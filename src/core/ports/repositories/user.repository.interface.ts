import type { UserID } from '$shared/components/base/domain/user/user.id.js';
import type { Email } from '$shared/value-objects/email.js';
import type { User } from '$components/base/domain/user/user.js';

export interface IUserRepository {
    save(user: User, passwordHash?: string): Promise<void>;
    findById(id: UserID): Promise<User | null>;
    findByEmail(email: Email): Promise<User | null>;
}
