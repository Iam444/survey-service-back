import type { IViewer } from '$shared/components/base/domain/user/viewer.interface.js';
import type { PollVote } from '../poll-vote.js';

export interface ISubmitVoteDTO {
    readonly viewer: IViewer;
    readonly vote: PollVote;
}
