import type { TPollStatus } from '$components/survey-service/domain/poll/poll-statuses.enum.js';

export interface IChangePollStatusCommand {
    readonly userId: string;
    readonly isUserRegistered: boolean;
    readonly pollId: string;
    readonly status: TPollStatus;
}
