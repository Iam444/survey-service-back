import { Inject, Injectable } from '@nestjs/common';
import { Result, AsyncResult } from 'lang-extensions/result';
import { UserID } from '$shared/components/base/domain/user/user.id.js';
import { NotFoundError } from '$shared/errors/not-found.error.js';
import { PollID } from '$components/survey-service/domain/poll/poll.id.js';
import type { INotFoundError } from '$shared/errors/not-found.error.js';
import type { INotPermittedError } from '$shared/errors/not-permitted.error.js';
import type { IStatusRestrictionsError } from '$components/survey-service/domain/errors/status-restrictions.error.js';
import type { IPollRepository } from '$ports/repositories/poll.repository.interface.js';
import type { IRetractPollVoteCommand } from './retract-poll-vote.command.interface.js';

@Injectable()
export class RetractPollVoteCommandHandler {
    constructor(@Inject('IPollRepository') private readonly _pollRepository: IPollRepository) {}

    public handle(
        command: IRetractPollVoteCommand,
    ): AsyncResult<void, INotFoundError | INotPermittedError | IStatusRestrictionsError> {
        const pollId = PollID.of(command.pollId);
        const userId = UserID.of(command.userId);

        return AsyncResult.wrap(
            async (): Promise<Result<void, INotFoundError | INotPermittedError | IStatusRestrictionsError>> => {
                const poll = await this._pollRepository.findById(pollId);

                if (!poll) {
                    return Result.failure(NotFoundError.of('Poll', 'id', pollId.value));
                }

                return poll.retractVote(userId).mapAsync(async () => this._pollRepository.save(poll));
            },
        );
    }
}
