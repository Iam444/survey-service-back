import type { IUserPreviewReadModel } from '$ports/queries/user/user-preview.read-model.interface.js';
import type { IPollPlainOptionReadModel } from '../poll-overview/poll-option.read-model.type.js';

export interface IPollResultsReadModel {
    readonly isInMultiChoiceMode: boolean;
    readonly isInFullStatisticsMode: boolean;
    readonly summary: IPollResultsSummaryReadModel | null;
    readonly statistics: IPollResultsStatisticsReadModel | null;
}

export interface IPollResultsSummaryReadModel {
    readonly leadingOptions: IPollPlainOptionReadModel[];
    readonly viewerSelection: IPollPlainOptionReadModel[];
}

export interface IPollResultsStatisticsReadModel {
    readonly totalVotesQuantity: number;
    readonly optionStatisticsList: IPollOptionStatisticsReadModel[];
}

export interface IPollOptionStatisticsReadModel {
    readonly isSelectedByUser: boolean;
    readonly isLeading: boolean;
    readonly votesQuantity: number;
    readonly votesPercentage: number;
    readonly option: IPollPlainOptionReadModel;
    readonly votes?: IPollVoteReadModel[] | undefined;
}

export interface IPollVoteReadModel {
    readonly votedBy: IUserPreviewReadModel;
    readonly votedAt: number;
}
