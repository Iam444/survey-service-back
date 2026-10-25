import type { Email } from '$shared/value-objects/email.js';
import type { UserName } from '../user-name.js';

export interface ICreateUserDTO {
    email: Email;
    name: UserName;
    surname: UserName | null;
}
