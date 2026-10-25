import { AbstractVO } from 'lang-extensions/value-object';
import { CorruptedInvariantException } from 'lang-extensions/errors';
import { PollStatisticsAccessTypesEnum } from './poll-statistics-access-types.enum.js';
import type { Collection } from 'lang-extensions/list';
import type { UserID } from '$shared/components/base/domain/user/user.id.js';
import type { TPollStatisticsAccessType } from './poll-statistics-access-types.enum.js';

type TNonSpecifiedAccessType = Exclude<TPollStatisticsAccessType, typeof PollStatisticsAccessTypesEnum.SPECIFIED>;

export class PollStatisticsNonSpecifiedAccessSettings extends AbstractVO {
    constructor(public readonly type: TNonSpecifiedAccessType) {
        super();
    }

    public toString(): string {
        return `[${PollStatisticsNonSpecifiedAccessSettings.name}] Type: ${this.type}`;
    }

    public toScalar(): string {
        return JSON.stringify({ type: this.type });
    }

    protected validate(): void {
        return;
    }
}
export class PollStatisticsSpecifiedAccessSettings extends AbstractVO {
    public readonly type = PollStatisticsAccessTypesEnum.SPECIFIED;

    constructor(public readonly holders: Collection<UserID>) {
        super();
    }

    public toString(): string {
        const holdersString = this.holders
            .asArray()
            .map((holder, index) => `\n\t[${index}] ${holder.toString()}`)
            .join('')
            .concat('\n');

        return `[${PollStatisticsSpecifiedAccessSettings.name}] Type: ${this.type}\nHolders: [${holdersString}]`;
    }

    public toScalar(): string {
        return JSON.stringify({
            type: this.type,
            holders: this.holders,
        });
    }

    protected validate(): void {
        if (this.holders.isEmpty) {
            throw new CorruptedInvariantException(`The statistics access holders list must not be empty`, {
                holders: this.holders,
                className: PollStatisticsSpecifiedAccessSettings.name,
            });
        }
    }
}

export type TPollStatisticsAccessSettings =
    PollStatisticsNonSpecifiedAccessSettings | PollStatisticsSpecifiedAccessSettings;
