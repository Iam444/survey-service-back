import type { Series } from 'lang-extensions/list';
import type { UserID } from '$shared/components/base/domain/user/user.id.js';
import type { PollFormatsEnum } from '../poll-formats.enum.js';
import type { PlainPollOption, ElectionsPollOption } from '../poll-option.js';
import type { PollName } from '../poll-name.js';
import type { PollDescription } from '../poll-description.js';
import type { PollSettings } from '../poll-settings.js';

export type TCreatePollDTO =
    | (ICreatePollDTO & {
          readonly format: typeof PollFormatsEnum.VOTING;
          readonly options: Series<PlainPollOption>;
      })
    | (ICreatePollDTO & {
          readonly format: typeof PollFormatsEnum.ELECTIONS;
          readonly options: Series<ElectionsPollOption>;
      });

interface ICreatePollDTO {
    readonly author: UserID;
    readonly name: PollName;
    readonly description: PollDescription | null;
    readonly settings: PollSettings;
}
