import type { Poll } from '$components/survey-service/domain/poll/poll.js';
import type { PollID } from '$components/survey-service/domain/poll/poll.id.js';

export interface IPollRepository {
    save(poll: Poll): Promise<void>;
    findById(id: PollID): Promise<Poll | null>;
}
