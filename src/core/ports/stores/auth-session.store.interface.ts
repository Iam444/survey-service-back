import type { IAuthSessionDTO } from '$components/base/application/services/auth-service/dto/auth-session.dto.interface.js';

export interface IAuthSessionStore {
    save(session: IAuthSessionDTO): Promise<void>;
    delete(id: string): Promise<void>;
}
