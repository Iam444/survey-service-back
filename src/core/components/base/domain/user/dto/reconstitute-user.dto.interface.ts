import type { UserID } from '$shared/components/base/domain/user/user.id.js';
import type { Email } from '$shared/value-objects/email.js';
import type { Phone } from '$shared/value-objects/phone.js';
import type { UserName } from '../user-name.js';

export interface IReconstituteUserDTO {
    id: UserID;
    email: Email;
    name: UserName;
    surname: UserName | null;
    phone: Phone | null;
}
