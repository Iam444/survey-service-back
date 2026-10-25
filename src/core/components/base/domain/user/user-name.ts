import { Text } from '$shared/value-objects/text.js';

export class UserName extends Text {
    protected override readonly _MAX_LENGTH: number = 50;
}
