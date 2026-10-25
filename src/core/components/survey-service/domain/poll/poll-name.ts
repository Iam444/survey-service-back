import { Text } from '$shared/value-objects/text.js';

export class PollName extends Text {
    protected override readonly _MAX_LENGTH: number = 50;
}
