import { Injectable, Inject } from '@nestjs/common';
import { Result, type AsyncResult } from 'lang-extensions/result';
import { UserID } from '$shared/components/base/domain/user/user.id.js';
import { NotFoundError } from '$shared/errors/not-found.error.js';
import { PollVote } from '$components/survey-service/domain/poll/poll-vote.js';
import { PollID } from '$components/survey-service/domain/poll/poll.id.js';
import { PollOptionFactory } from '$components/survey-service/domain/poll/factories/poll-option.factory.js';
import type { INotFoundError } from '$shared/errors/not-found.error.js';
import type { INotPermittedError } from '$shared/errors/not-permitted.error.js';
import type { IStatusRestrictionsError } from '$components/survey-service/domain/errors/status-restrictions.error.js';
import type { IChosenOptionsCountError } from '$components/survey-service/domain/errors/chosen-options-count.error.js';
import type { IDuplicatedOptionError } from '$components/survey-service/domain/errors/duplicated-option.error.js';
import type { IPollRepository } from '$ports/repositories/poll.repository.interface.js';
import type { TSubmitPollVoteCommand } from './submit-poll-vote.command.type.js';

@Injectable()
export class SubmitPollVoteCommandHandler {
    constructor(@Inject('IPollRepository') private readonly _pollRepository: IPollRepository) {}

    public handle(
        command: TSubmitPollVoteCommand,
    ): AsyncResult<
        void,
        | INotFoundError
        | IStatusRestrictionsError
        | INotPermittedError
        | IChosenOptionsCountError
        | IDuplicatedOptionError
    > {
        const pollId = PollID.of(command.pollId);
        const userId = UserID.of(command.userId);

        const optionsWithFormatResult = PollOptionFactory.create(command);

        return optionsWithFormatResult.onSuccessAsync(
            async (
                optionsWithFormat,
            ): Promise<
                Result<
                    void,
                    | INotFoundError
                    | IStatusRestrictionsError
                    | INotPermittedError
                    | IChosenOptionsCountError
                    | IDuplicatedOptionError
                >
            > => {
                const poll = await this._pollRepository.findById(pollId);

                if (!poll) {
                    return Result.failure(NotFoundError.of('Poll', 'id', pollId.value));
                }

                const vote = PollVote.of(userId, optionsWithFormat.options);

                return poll
                    .submitVote({
                        vote,
                        viewer: {
                            user: vote.voter,
                            isRegistered: command.isUserRegistered,
                        },
                    })
                    .mapAsync(async () => this._pollRepository.save(poll));
            },
        );
    }
}
