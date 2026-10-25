import { UUIDGenerator } from 'lang-extensions/uuid';
import { Result } from 'lang-extensions/result';
import { InvalidRefreshTokenError } from './errors/invalid-refresh-token.error.js';
import type { IInvalidRefreshTokenError } from './errors/invalid-refresh-token.error.js';
import type { IParsedRefreshTokenDTO } from './dto/parsed-refresh-token.dto.interface.js';

export class RefreshTokenParser {
    public static parse(refreshToken?: string): Result<IParsedRefreshTokenDTO, IInvalidRefreshTokenError> {
        if (!refreshToken) {
            return Result.failure(InvalidRefreshTokenError.of('Token is not provided'));
        }

        const [sessionId, secret] = refreshToken.split('.', 2);

        if (!secret || !sessionId || !UUIDGenerator.isValid(sessionId)) {
            return Result.failure(InvalidRefreshTokenError.of('Token is invalid', refreshToken));
        }

        return Result.success({ sessionId, secret });
    }
}
