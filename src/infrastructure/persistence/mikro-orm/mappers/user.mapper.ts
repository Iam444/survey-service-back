import { Email } from '$shared/value-objects/email.js';
import { Phone } from '$shared/value-objects/phone.js';
import { UserID } from '$shared/components/base/domain/user/user.id.js';
import { UserName } from '$components/base/domain/user/user-name.js';
import { User } from '$components/base/domain/user/user.js';
import { UserORMEntity } from '../orm-entities/user.orm-entity.js';

export class UserMapper {
    public static mapToORM(domainUser: User, ormUser: UserORMEntity, userPasswordHash?: string): void {
        ormUser.email = domainUser.email.value;
        ormUser.name = domainUser.name.value;
        ormUser.surname = domainUser.surname ? domainUser.surname.value : null;
        ormUser.phone = domainUser.phone ? domainUser.phone.value : null;

        if (userPasswordHash) {
            ormUser.passwordHash = userPasswordHash;
        }
    }

    public static mapToDomain(ormUser: UserORMEntity): User {
        const id = UserID.of(ormUser.id);
        const email = Email.of(ormUser.email);
        const name = UserName.of(ormUser.name);
        const surname = ormUser.surname ? UserName.of(ormUser.name) : null;
        const phone = ormUser.phone ? Phone.of(ormUser.phone) : null;

        return User.reconstitute({ id, email, name, surname, phone });
    }
}
