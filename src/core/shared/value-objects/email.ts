import { AbstractVO } from 'lang-extensions/value-object';
import { CorruptedInvariantException } from 'lang-extensions/errors';

export class Email extends AbstractVO {
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
        const pattern =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

        if (this.value.length === 0 && !pattern.test(this.value)) {
            throw new CorruptedInvariantException(
                `The value must be a valid email that satisfies template: email@domain.zone`,
                {
                    value: this.value,
                    className: Email.name,
                },
            );
        }
    }
}
