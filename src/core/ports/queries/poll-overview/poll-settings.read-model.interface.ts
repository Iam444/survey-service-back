import { PollStatisticsDisplayFormatsEnum } from '$components/survey-service/domain/poll/poll-statistics-display-formats.enum.js';
import { PollStatisticsAccessTypesEnum } from '$components/survey-service/domain/poll/poll-statistics-access-types.enum.js';
import type {
    PollAccessTypesEnum,
    TPollAccessType,
} from '$components/survey-service/domain/poll/poll-access-types.enum.js';
import type { TPollStatisticsDisplayFormat } from '$components/survey-service/domain/poll/poll-statistics-display-formats.enum.js';
import type { TPollStatisticsAccessType } from '$components/survey-service/domain/poll/poll-statistics-access-types.enum.js';
import type { IUserPreviewReadModel } from '$ports/queries/user/user-preview.read-model.interface.js';

export interface IPollSettingsReadModel {
    readonly isMultiChoiceEnabled: boolean;
    readonly accessSettings: IPollSpecifiedAccessSettingsReadModel | IPollNonSpecifiedAccessSettingsReadModel;
    readonly statisticsSettings: IPollEnabledStatisticsSettingsReadModel | IPollDisabledStatisticsSettingsReadModel;
}

export interface IPollSpecifiedAccessSettingsReadModel {
    readonly type: typeof PollAccessTypesEnum.SPECIFIED;
    readonly holders: IUserPreviewReadModel[];
}

export interface IPollNonSpecifiedAccessSettingsReadModel {
    readonly type: Exclude<TPollAccessType, typeof PollAccessTypesEnum.SPECIFIED>;
}

export interface IPollEnabledStatisticsSettingsReadModel {
    readonly displayFormat: Exclude<TPollStatisticsDisplayFormat, typeof PollStatisticsDisplayFormatsEnum.NONE>;
    readonly accessSettings:
        IPollStatisticsSpecifiedAccessSettingsReadModel | IPollStatisticsNonSpecifiedAccessSettingsReadModel;
    readonly shouldShowAfterVoting: boolean;
}

export interface IPollDisabledStatisticsSettingsReadModel {
    readonly displayFormat: typeof PollStatisticsDisplayFormatsEnum.NONE;
}

export interface IPollStatisticsSpecifiedAccessSettingsReadModel {
    readonly type: typeof PollStatisticsAccessTypesEnum.SPECIFIED;
    readonly holders: IUserPreviewReadModel[];
}

export interface IPollStatisticsNonSpecifiedAccessSettingsReadModel {
    readonly type: Exclude<TPollStatisticsAccessType, typeof PollStatisticsAccessTypesEnum.SPECIFIED>;
}
