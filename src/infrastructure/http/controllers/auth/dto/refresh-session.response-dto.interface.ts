import type { ITokenPairDTO } from '$components/base/application/services/auth-service/dto/token-pair.dto.interface.js';

export interface IRefreshSessionResponseDTO {
    readonly accessToken: ITokenPairDTO['accessToken'];
}
