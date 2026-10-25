import { AbstractVO } from 'lang-extensions/value-object';
import { CorruptedInvariantException } from 'lang-extensions/errors';
import { PollAccessTypesEnum } from './poll-access-types.enum.js';
import { PollStatisticsDisplayFormatsEnum } from './poll-statistics-display-formats.enum.js';
import { PollStatisticsAccessTypesEnum } from './poll-statistics-access-types.enum.js';
import type { TPollAccessSettings } from './poll-access-settings.js';
import type { TPollStatisticsSettings } from './poll-statistics-settings.js';

export class PollSettings extends AbstractVO {
    constructor(
        public readonly isMultiChoiceEnabled: boolean,
        public readonly accessSettings: TPollAccessSettings,
        public readonly statisticsSettings: TPollStatisticsSettings,
    ) {
        super();
    }

    public toString(): string {
        return `Multi-choice: ${this.isMultiChoiceEnabled ? 'enabled' : 'disabled'}\nAccess settings: ${this.accessSettings.toString()}\nStatistics settings: ${this.statisticsSettings.toString()}`;
    }

    public toScalar(): string {
        return JSON.stringify({
            isMultiChoiceEnabled: this.isMultiChoiceEnabled,
            accessSettings: this.accessSettings.toScalar(),
            statisticsSettings: this.statisticsSettings.toScalar(),
        });
    }

    protected validate(): void {
        if (
            this.accessSettings.type === PollAccessTypesEnum.SPECIFIED &&
            this.statisticsSettings.displayFormat !== PollStatisticsDisplayFormatsEnum.NONE &&
            this.statisticsSettings.accessSettings.type === PollStatisticsAccessTypesEnum.SPECIFIED &&
            !this.accessSettings.checkIfThereIsAccessFor(this.statisticsSettings.accessSettings.holders)
        ) {
            throw new CorruptedInvariantException(
                'The statistics access holder list must include only those items which are presented in poll access holder list',
                {
                    value: {
                        pollAccessHolders: this.accessSettings.holders,
                        statisticsAccessHolders: this.statisticsSettings.accessSettings.holders,
                    },
                    className: PollSettings.name,
                },
            );
        }
    }
}
