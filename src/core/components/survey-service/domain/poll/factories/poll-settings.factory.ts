import { Collection } from 'lang-extensions/list';
import { Result } from 'lang-extensions/result';
import { UserID } from '$shared/components/base/domain/user/user.id.js';
import { PollAccessTypesEnum } from '../poll-access-types.enum.js';
import {
    PollSpecifiedAccessSettings,
    PollRegisteredAccessSettings,
    PollPublicAccessSettings,
} from '../poll-access-settings.js';
import { PollStatisticsDisplayFormatsEnum } from '../poll-statistics-display-formats.enum.js';
import { PollStatisticsAccessTypesEnum } from '../poll-statistics-access-types.enum.js';
import {
    PollStatisticsSpecifiedAccessSettings,
    PollStatisticsNonSpecifiedAccessSettings,
} from '../poll-statistics-access-settings.js';
import { PollEnabledStatisticsSettings, PollDisabledStatisticsSettings } from '../poll-statistics-settings.js';
import { PollSettings } from '../poll-settings.js';
import { DuplicatedAccessHolderError } from '../../errors/duplicated-access-holder.error.js';
import type { IDuplicatedAccessHolderError } from '../../errors/duplicated-access-holder.error.js';
import type { IPollSettingsDataDTO } from './poll-settings-data.dto.interface.js';

export class PollSettingsFactory {
    public static create(dto: IPollSettingsDataDTO): Result<PollSettings, IDuplicatedAccessHolderError> {
        const isMultiChoiceEnabled = dto.isMultiChoiceEnabled;
        const accessSettingsData = dto.accessSettings;
        const statisticsSettingsData = dto.statisticsSettings;

        let accessSettingsResult;

        if (accessSettingsData.type === PollAccessTypesEnum.SPECIFIED) {
            const accessHoldersArray = accessSettingsData.holderIds.map((userId) => UserID.of(userId));

            accessSettingsResult = Collection.of(accessHoldersArray)
                .map((accessHolders) => PollSpecifiedAccessSettings.of(accessHolders))
                .mapError((error) =>
                    DuplicatedAccessHolderError.of(
                        'Users of poll access holer list must be unique',
                        error.details.duplicant,
                    ),
                );
        } else if (accessSettingsData.type === PollAccessTypesEnum.REGISTERED) {
            accessSettingsResult = Result.success(PollRegisteredAccessSettings.of());
        } else {
            accessSettingsResult = Result.success(PollPublicAccessSettings.of());
        }

        let statisticsSettingsResult;

        if (statisticsSettingsData.displayFormat === PollStatisticsDisplayFormatsEnum.NONE) {
            statisticsSettingsResult = Result.success(PollDisabledStatisticsSettings.of());
        } else {
            const statisticsDisplayFormat = statisticsSettingsData.displayFormat;
            const shouldShowStatisticsAfterVoting = statisticsSettingsData.shouldShowAfterVoting;

            let statisticsAccessSettingsResult;

            if (statisticsSettingsData.accessSettings.type === PollStatisticsAccessTypesEnum.SPECIFIED) {
                const accessHoldersArray = statisticsSettingsData.accessSettings.holderIds.map((userId) =>
                    UserID.of(userId),
                );

                statisticsAccessSettingsResult = Collection.of(accessHoldersArray)
                    .map((accessHolders) => PollStatisticsSpecifiedAccessSettings.of(accessHolders))
                    .mapError((error) =>
                        DuplicatedAccessHolderError.of(
                            'Users of statistics access holer list must be unique',
                            error.details.duplicant,
                        ),
                    );
            } else {
                statisticsAccessSettingsResult = Result.success(
                    PollStatisticsNonSpecifiedAccessSettings.of(statisticsSettingsData.accessSettings.type),
                );
            }

            statisticsSettingsResult = statisticsAccessSettingsResult.map((statisticsAccessSettings) =>
                PollEnabledStatisticsSettings.of(
                    statisticsDisplayFormat,
                    statisticsAccessSettings,
                    shouldShowStatisticsAfterVoting,
                ),
            );
        }

        return Result.combine(accessSettingsResult, statisticsSettingsResult).map(
            ([accessSettings, statisticsSettings]) =>
                PollSettings.of(isMultiChoiceEnabled, accessSettings, statisticsSettings),
        );
    }
}
