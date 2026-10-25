import { AbstractVO } from 'lang-extensions/value-object';
import { Collection } from 'lang-extensions/list';
import { CorruptedInvariantException } from 'lang-extensions/errors';
import { UserID } from '$shared/components/base/domain/user/user.id.js';
import type { ElectionsPollOption, PlainPollOption } from './poll-option.js';

export class PollVote extends AbstractVO {
    constructor(
        public readonly voter: UserID,
        public readonly options: Collection<PlainPollOption> | Collection<ElectionsPollOption>,
    ) {
        super();
    }

    public toString(): string {
        const optionsString = this.options
            .asArray()
            .map((option, index) => `\n\t[${index}] ${option.toString()}`)
            .join('')
            .concat('\n');

        return `Voter ID: ${this.voter.toString()}\nOptions: [${optionsString}]`;
    }

    public toScalar(): string {
        return JSON.stringify({
            voter: this.voter.toScalar(),
            options: this.options.asArray().map((option) => option.toScalar()),
        });
    }

    protected validate(): void {
        if (this.options.isEmpty) {
            throw new CorruptedInvariantException(`The chosen option list must not be empty`, {
                options: this.options,
                className: PollVote.name,
            });
        }
    }
}
