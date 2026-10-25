import { AbstractVO } from 'lang-extensions/value-object';
import { PollStatisticsDisplayFormatsEnum } from './poll-statistics-display-formats.enum.js';
import type { TPollStatisticsDisplayFormat } from './poll-statistics-display-formats.enum.js';
import type { TPollStatisticsAccessSettings } from './poll-statistics-access-settings.js';

type TPollEnabledStatisticsSettings = Exclude<
    TPollStatisticsDisplayFormat,
    typeof PollStatisticsDisplayFormatsEnum.NONE
>;

interface IPollStatisticsSettings {
    readonly displayFormat: TPollStatisticsDisplayFormat;
}

export class PollDisabledStatisticsSettings extends AbstractVO implements IPollStatisticsSettings {
    public readonly displayFormat = PollStatisticsDisplayFormatsEnum.NONE;

    public toString(): string {
        return `[${PollDisabledStatisticsSettings.name}] Display format: ${this.displayFormat}`;
    }

    public toScalar(): string {
        return JSON.stringify({ format: this.displayFormat });
    }

    protected validate(): void {
        return;
    }
}

export class PollEnabledStatisticsSettings extends AbstractVO implements IPollStatisticsSettings {
    public constructor(
        public readonly displayFormat: TPollEnabledStatisticsSettings,
        public readonly accessSettings: TPollStatisticsAccessSettings,
        public readonly shouldShowAfterVoting: boolean,
    ) {
        super();
    }

    public toString(): string {
        const showAfterVotingString = this.shouldShowAfterVoting ? 'enabled' : 'disabled';

        return `[${PollEnabledStatisticsSettings.name}]\nDisplay format: ${this.displayFormat}\nShow after voting flag: ${showAfterVotingString}\nAccess settings: ${this.accessSettings.toString()}`;
    }

    public toScalar(): string {
        return JSON.stringify({
            displayFormat: this.displayFormat,
            accessSettings: this.accessSettings.toScalar(),
            shouldShowAfterVoting: this.shouldShowAfterVoting,
        });
    }

    protected validate(): void {
        return;
    }
}

export type TPollStatisticsSettings = PollDisabledStatisticsSettings | PollEnabledStatisticsSettings;
