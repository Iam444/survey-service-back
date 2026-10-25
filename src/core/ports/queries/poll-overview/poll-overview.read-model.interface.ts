import type { PollFormatsEnum, TPollFormat } from '$components/survey-service/domain/poll/poll-formats.enum.js';
import type { TPollStatus } from '$components/survey-service/domain/poll/poll-statuses.enum.js';
import type { IUserPreviewReadModel } from '$ports/queries/user/user-preview.read-model.interface.js';
import type {
    IPollPlainOptionReadModel,
    IPollElectionsOptionReadModel,
    TPollOptionListReadModel,
} from './poll-option.read-model.type.js';
import type { IPollSettingsReadModel } from './poll-settings.read-model.interface.js';

export type TPollOverviewReadModel = IVotingPollOverviewReadModel | IElectionsPollOverviewReadModel;

interface IPollOverviewReadModel {
    readonly format: TPollFormat;
    readonly status: TPollStatus;
    readonly author: IUserPreviewReadModel;
    readonly name: string;
    readonly description: string | null;
    readonly settings: IPollSettingsReadModel;
    readonly options: TPollOptionListReadModel;
    readonly viewerSelection: number[];
}

export interface IVotingPollOverviewReadModel extends IPollOverviewReadModel {
    readonly format: typeof PollFormatsEnum.VOTING;
    readonly options: IPollPlainOptionReadModel[];
}

export interface IElectionsPollOverviewReadModel extends IPollOverviewReadModel {
    readonly format: typeof PollFormatsEnum.ELECTIONS;
    readonly options: IPollElectionsOptionReadModel[];
}
