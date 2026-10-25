import { AbstractVO } from 'lang-extensions/value-object';
import { CorruptedInvariantException } from 'lang-extensions/errors';

export class Phone extends AbstractVO {
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
        const pattern = /^\+\d{11}$/;

        if (this.value.length === 0 && !pattern.test(this.value)) {
            throw new CorruptedInvariantException(
                `The value must be a valid phone number that satisfies template: +78005553535`,
                {
                    value: this.value,
                    className: Phone.name,
                },
            );
        }
    }
}
