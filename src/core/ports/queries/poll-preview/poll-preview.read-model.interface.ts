import type { TPollFormat } from '$components/survey-service/domain/poll/poll-formats.enum.js';
import type { TPollStatus } from '$components/survey-service/domain/poll/poll-statuses.enum.js';
import type { IUserPreviewReadModel } from '$ports/queries/user/user-preview.read-model.interface.js';

export interface IPollPreviewReadModel {
    readonly id: string;
    readonly format: TPollFormat;
    readonly status: TPollStatus;
    readonly name: string;
    readonly description: string | null;
    readonly author: IUserPreviewReadModel;
}
