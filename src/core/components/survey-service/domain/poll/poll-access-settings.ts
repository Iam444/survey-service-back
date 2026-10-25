import { AbstractVO } from 'lang-extensions/value-object';
import { CorruptedInvariantException } from 'lang-extensions/errors';
import { PollAccessTypesEnum } from './poll-access-types.enum.js';
import type { Collection } from 'lang-extensions/list';
import type { UserID } from '$shared/components/base/domain/user/user.id.js';
import type { IViewer } from '$shared/components/base/domain/user/viewer.interface.js';
import type { TPollAccessType } from './poll-access-types.enum.js';

interface IPollAccessSettings {
    readonly type: TPollAccessType;
    canParticipate(viewer: IViewer, creatorId: string): boolean;
}

abstract class PollNonSpecifiedAccessSettings extends AbstractVO implements IPollAccessSettings {
    public abstract readonly type: TPollAccessType;

    public toString(): string {
        return `[${PollPublicAccessSettings.name}] Type: ${this.type}`;
    }

    public toScalar(): string {
        return JSON.stringify({ type: this.type });
    }

    protected validate(): void {
        return;
    }

    public abstract canParticipate(viewer: IViewer, creatorId: string): boolean;
}

export class PollPublicAccessSettings extends PollNonSpecifiedAccessSettings {
    public readonly type = PollAccessTypesEnum.PUBLIC;

    public canParticipate(): boolean {
        return true;
    }
}

export class PollRegisteredAccessSettings extends PollNonSpecifiedAccessSettings {
    public readonly type = PollAccessTypesEnum.REGISTERED;

    public canParticipate(viewer: IViewer): boolean {
        return viewer.isRegistered;
    }
}

export class PollSpecifiedAccessSettings extends AbstractVO implements IPollAccessSettings {
    public readonly type = PollAccessTypesEnum.SPECIFIED;

    constructor(public readonly holders: Collection<UserID>) {
        super();
    }

    public canParticipate(viewer: IViewer): boolean {
        return this.holders.contains(viewer.user);
    }

    public checkIfThereIsAccessFor(users: Collection<UserID>): boolean {
        if (users.size > this.holders.size) {
            return false;
        }

        const specifiedUserIds = this.holders.asArray();
        const specifiedUserIdValues = specifiedUserIds.map((id) => id.value);

        const mainSet = new Set(specifiedUserIdValues);

        return users.asArray().every((user) => mainSet.has(user.value));
    }

    public toString(): string {
        const holdersString = this.holders
            .asArray()
            .map((holder, index) => `\n\t[${index}] ${holder.toString()}`)
            .join('')
            .concat('\n');

        return `[${PollSpecifiedAccessSettings.name}] Type: ${this.type}\nHolders: [${holdersString}]`;
    }

    public toScalar(): string {
        return JSON.stringify({
            type: this.type,
            holders: this.holders,
        });
    }

    protected validate(): void {
        if (this.holders.isEmpty) {
            throw new CorruptedInvariantException(`The poll access holders list must not be empty`, {
                holders: this.holders,
                className: PollSpecifiedAccessSettings.name,
            });
        }
    }
}

export type TPollAccessSettings = PollPublicAccessSettings | PollRegisteredAccessSettings | PollSpecifiedAccessSettings;
