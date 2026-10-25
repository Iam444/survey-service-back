import type { TPollOptionDataDTO } from '$components/survey-service/domain/poll/factories/poll-option-data.dto.type.js';

export type TSubmitPollVoteCommand = ISubmitPollVoteCommand & TPollOptionDataDTO;

interface ISubmitPollVoteCommand {
    readonly userId: string;
    readonly isUserRegistered: boolean;
    readonly pollId: string;
}
