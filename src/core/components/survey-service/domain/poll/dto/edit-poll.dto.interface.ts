import type { IViewer } from '$shared/components/base/domain/user/viewer.interface.js';
import type { PollName } from '../poll-name.js';
import type { PollDescription } from '../poll-description.js';

export interface IEditPollDTO {
    readonly viewer: IViewer;
    readonly name?: PollName | undefined;
    readonly description?: PollDescription | null | undefined;
}
