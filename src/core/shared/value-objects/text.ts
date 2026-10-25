import { AbstractVO } from 'lang-extensions/value-object';
import { CorruptedInvariantException } from 'lang-extensions/errors';

export class Text extends AbstractVO {
    protected readonly _MAX_LENGTH: number = 1000;

    constructor(public readonly value: string) {
        super();
    }

    public toString(): string {
        return this.value;
    }

    public toScalar(): string {
        return this.value;
    }

    protected validate(): void {
        if (this.value.length === 0 || this.value.length > this._MAX_LENGTH) {
            throw new CorruptedInvariantException(
                `The value must be a string with 1-${this._MAX_LENGTH} chars length`,
                {
                    value: this.value,
                    className: Text.name,
                },
            );
        }
    }
}
