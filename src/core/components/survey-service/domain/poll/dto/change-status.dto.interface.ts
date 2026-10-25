import type { IViewer } from '$shared/components/base/domain/user/viewer.interface.js';
import type { TPollStatus } from '../poll-statuses.enum.js';

export interface IChangeStatusDTO {
    readonly viewer: IViewer;
    readonly status: TPollStatus;
}
