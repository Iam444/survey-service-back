import { Inject, Injectable } from '@nestjs/common';
import { Result, AsyncResult } from 'lang-extensions/result';
import { UserID } from '$shared/components/base/domain/user/user.id.js';
import { NotFoundError } from '$shared/errors/not-found.error.js';
import { PollID } from '$components/survey-service/domain/poll/poll.id.js';
import type { INotPermittedError } from '$shared/errors/not-permitted.error.js';
import type { INotFoundError } from '$shared/errors/not-found.error.js';
import type { IInvalidStatusTransitionError } from '$components/survey-service/domain/errors/invalid-status-transition.error.js';
import type { IPollRepository } from '$ports/repositories/poll.repository.interface.js';
import type { IChangePollStatusCommand } from './change-poll-status.command.interface.js';

@Injectable()
export class ChangePollStatusCommandHandler {
    constructor(@Inject('IPollRepository') private readonly _pollRepository: IPollRepository) {}

    public handle(
        command: IChangePollStatusCommand,
    ): AsyncResult<void, INotFoundError | INotPermittedError | IInvalidStatusTransitionError> {
        const pollId = PollID.of(command.pollId);
        const userId = UserID.of(command.userId);

        return AsyncResult.wrap(
            async (): Promise<Result<void, INotFoundError | INotPermittedError | IInvalidStatusTransitionError>> => {
                const poll = await this._pollRepository.findById(pollId);

                if (!poll) {
                    return Result.failure(NotFoundError.of('Poll', 'id', pollId.value));
                }

                return poll
                    .changeStatus({
                        status: command.status,
                        viewer: {
                            user: userId,
                            isRegistered: command.isUserRegistered,
                        },
                    })
                    .mapAsync(async () => this._pollRepository.save(poll));
            },
        );
    }
}
