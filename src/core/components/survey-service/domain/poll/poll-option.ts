import { AbstractVO } from 'lang-extensions/value-object';
import { CorruptedInvariantException } from 'lang-extensions/errors';
import { UserID } from '$shared/components/base/domain/user/user.id.js';
import { PollFormatsEnum } from './poll-formats.enum.js';

abstract class PollOption extends AbstractVO {
    protected readonly _MAX_NAME_LENGTH: number = 60;
    protected readonly _MAX_DESCRIPTION_LENGTH: number = 500;

    protected constructor(
        public readonly name: string,
        public readonly description: string | null,
    ) {
        super();
    }

    protected validate(): void {
        if (this.name.length === 0 || this.name.length > this._MAX_NAME_LENGTH) {
            throw new CorruptedInvariantException(
                `The poll option name must be a string with 1-${this._MAX_NAME_LENGTH} chars length`,
                {
                    name: this.name,
                    className: this.constructor.name,
                },
            );
        }

        if (
            this.description &&
            (this.description.length === 0 || this.description.length > this._MAX_DESCRIPTION_LENGTH)
        ) {
            throw new CorruptedInvariantException(
                `The poll option description if set must be a string with 1-${this._MAX_DESCRIPTION_LENGTH} chars length`,
                {
                    name: this.name,
                    className: this.constructor.name,
                },
            );
        }
    }
}

export class PlainPollOption extends PollOption {
    public readonly pollFormat = PollFormatsEnum.VOTING;

    constructor(name: string, description: string | null) {
        super(name, description);
    }

    public toString(): string {
        return `[${PlainPollOption.name}] Poll format: "${this.pollFormat}". Name: "${this.name}". Description: "${this.description}".`;
    }

    public toScalar(): string {
        return JSON.stringify({ pollFormat: this.pollFormat, name: this.name, description: this.description });
    }
}

export class ElectionsPollOption extends PollOption {
    public readonly pollFormat = PollFormatsEnum.ELECTIONS;

    constructor(
        name: string,
        description: string | null,
        public readonly candidate: UserID,
    ) {
        super(name, description);
    }

    public toString(): string {
        return `[${ElectionsPollOption.name}] Poll format: "${this.pollFormat}". Name: "${this.name}". Description: "${this.description}". Candidate ID: ${this.candidate.toString()}`;
    }

    public toScalar(): string {
        return JSON.stringify({
            pollFormat: this.pollFormat,
            name: this.name,
            description: this.description,
            candidate: this.candidate.toScalar(),
        });
    }
}

export type TPollOption = PlainPollOption | ElectionsPollOption;
