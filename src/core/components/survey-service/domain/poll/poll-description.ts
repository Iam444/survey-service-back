import { Text } from '$shared/value-objects/text.js';

export class PollDescription extends Text {
    protected override readonly _MAX_LENGTH: number = 500;
}
