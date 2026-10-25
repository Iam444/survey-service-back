import type { Series, Collection } from 'lang-extensions/list';
import type { UserID } from '$shared/components/base/domain/user/user.id.js';
import type { PlainPollOption, ElectionsPollOption } from '../poll-option.js';
import type { PollName } from '../poll-name.js';
import type { PollDescription } from '../poll-description.js';
import type { PollSettings } from '../poll-settings.js';
import type { TPollFormat } from '../poll-formats.enum.js';
import type { TPollStatus } from '../poll-statuses.enum.js';
import type { PollVote } from '../poll-vote.js';
import type { PollID } from '../poll.id.js';

export interface IReconstitutePollDTO {
    readonly id: PollID;
    readonly author: UserID;
    readonly format: TPollFormat;
    readonly status: TPollStatus;
    readonly name: PollName;
    readonly description: PollDescription | null;
    readonly settings: PollSettings;
    readonly options: Series<PlainPollOption> | Series<ElectionsPollOption>;
    readonly votes: Collection<PollVote>;
}
