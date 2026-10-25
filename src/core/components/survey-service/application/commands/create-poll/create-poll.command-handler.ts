import { Inject, Injectable } from '@nestjs/common';
import { Result } from 'lang-extensions/result';
import { UserID } from '$shared/components/base/domain/user/user.id.js';
import { PollName } from '$components/survey-service/domain/poll/poll-name.js';
import { PollDescription } from '$components/survey-service/domain/poll/poll-description.js';
import { Poll } from '$components/survey-service/domain/poll/poll.js';
import { PollOptionFactory } from '$components/survey-service/domain/poll/factories/poll-option.factory.js';
import { PollSettingsFactory } from '$components/survey-service/domain/poll/factories/poll-settings.factory.js';
import type { AsyncResult } from 'lang-extensions/result';
import type { PollID } from '$components/survey-service/domain/poll/poll.id.js';
import type { IDuplicatedOptionError } from '$components/survey-service/domain/errors/duplicated-option.error.js';
import type { IDuplicatedAccessHolderError } from '$components/survey-service/domain/errors/duplicated-access-holder.error.js';
import type { IPollRepository } from '$ports/repositories/poll.repository.interface.js';
import type { TCreatePollCommand } from './create-poll.command.type.js';

@Injectable()
export class CreatePollCommandHandler {
    constructor(@Inject('IPollRepository') private readonly _pollRepository: IPollRepository) {}

    public handle(
        command: TCreatePollCommand,
    ): AsyncResult<PollID, IDuplicatedOptionError | IDuplicatedAccessHolderError> {
        const author = UserID.of(command.userId);
        const name = PollName.of(command.name);
        const description = command.description ? PollDescription.of(command.description) : null;

        const optionsWithFormatResult = PollOptionFactory.create(command);
        const settingsResult = PollSettingsFactory.create(command.settings);

        return Result.combine(optionsWithFormatResult, settingsResult)
            .onSuccess(([optionsWithFormat, settings]) =>
                Poll.create({
                    author,
                    name,
                    description,
                    settings,
                    ...optionsWithFormat,
                }),
            )
            .mapAsync(async (poll) => {
                await this._pollRepository.save(poll);

                return poll.id;
            });
    }
}
