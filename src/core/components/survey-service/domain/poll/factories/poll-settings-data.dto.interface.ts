import type {
    PollAccessTypesEnum,
    TPollAccessType,
} from '$components/survey-service/domain/poll/poll-access-types.enum.js';
import type {
    PollStatisticsDisplayFormatsEnum,
    TPollStatisticsDisplayFormat,
} from '$components/survey-service/domain/poll/poll-statistics-display-formats.enum.js';
import type {
    PollStatisticsAccessTypesEnum,
    TPollStatisticsAccessType,
} from '$components/survey-service/domain/poll/poll-statistics-access-types.enum.js';

export interface IPollSettingsDataDTO {
    readonly isMultiChoiceEnabled: boolean;
    readonly accessSettings: TPollAccessSettingsDataDTO;
    readonly statisticsSettings: TPollStatisticsSettingsDataDTO;
}

type TPollAccessSettingsDataDTO = IPollSpecifiedAccessSettingsDataDTO | IPollNonSpecifiedAccessSettingsDataDTO;

export interface IPollNonSpecifiedAccessSettingsDataDTO {
    readonly type: Exclude<TPollAccessType, typeof PollAccessTypesEnum.SPECIFIED>;
}

export interface IPollSpecifiedAccessSettingsDataDTO {
    readonly type: typeof PollAccessTypesEnum.SPECIFIED;
    readonly holderIds: string[];
}

type TPollStatisticsSettingsDataDTO = IPollEnabledStatisticsSettingsDataDTO | IPollDisabledStatisticsSettingsDataDTO;

export interface IPollDisabledStatisticsSettingsDataDTO {
    readonly displayFormat: typeof PollStatisticsDisplayFormatsEnum.NONE;
}

export interface IPollEnabledStatisticsSettingsDataDTO {
    readonly displayFormat: Exclude<TPollStatisticsDisplayFormat, typeof PollStatisticsDisplayFormatsEnum.NONE>;
    readonly accessSettings: TPollStatisticsAccessSettingsDataDTO;
    readonly shouldShowAfterVoting: boolean;
}

type TPollStatisticsAccessSettingsDataDTO =
    IPollStatisticsSpecifiedAccessSettingsDataDTO | IPollStatisticsNonSpecifiedAccessSettingsDataDTO;

export interface IPollStatisticsNonSpecifiedAccessSettingsDataDTO {
    readonly type: Exclude<TPollStatisticsAccessType, typeof PollStatisticsAccessTypesEnum.SPECIFIED>;
}

export interface IPollStatisticsSpecifiedAccessSettingsDataDTO {
    readonly type: typeof PollStatisticsAccessTypesEnum.SPECIFIED;
    readonly holderIds: string[];
}
