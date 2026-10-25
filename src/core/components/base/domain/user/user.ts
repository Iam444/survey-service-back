import { AbstractEntity } from 'lang-extensions/entity';
import { Result } from 'lang-extensions/result';
import { UserID } from '$shared/components/base/domain/user/user.id.js';
import { UserName } from './user-name.js';
import type { Email } from '$shared/value-objects/email.js';
import type { Phone } from '$shared/value-objects/phone.js';
import type { ICreateUserDTO } from './dto/create-user.dto.interface.js';
import type { IReconstituteUserDTO } from './dto/reconstitute-user.dto.interface.js';

export class User extends AbstractEntity<UserID> {
    public static reconstitute(dto: IReconstituteUserDTO): User {
        return new User(dto.id, dto.email, dto.name, dto.surname, dto.phone);
    }

    public static create(dto: ICreateUserDTO): Result<User, never> {
        const user = new User(UserID.generate(), dto.email, dto.name, dto.surname, null);

        return Result.success(user);
    }

    constructor(
        id: UserID,
        private readonly _email: Email,
        private readonly _name: UserName,
        private readonly _surname: UserName | null,
        private readonly _phone: Phone | null,
    ) {
        super(id);
    }

    get email(): Email {
        return this._email;
    }

    get name(): UserName {
        return this._name;
    }

    get surname(): UserName | null {
        return this._surname;
    }

    get phone(): Phone | null {
        return this._phone;
    }
}
