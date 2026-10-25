import type { IJWTPayloadDTO } from './jwt-payload.dto.interface.js';

export interface IJWTService {
    sign(payload: IJWTPayloadDTO, options: { expiresIn: string }): string;
}
