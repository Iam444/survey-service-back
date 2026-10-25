import { AuthErrorCodes } from './auth-error-codes.js';
import type { IBaseError } from 'lang-extensions/types';

export interface IInvalidRefreshTokenError extends IBaseError {
    readonly code: typeof AuthErrorCodes.INVALID_REFRESH_TOKEN;
    readonly details: {
        readonly token?: string | undefined;
    };
}

export const InvalidRefreshTokenError = {
    of: (message: string, token?: string): IInvalidRefreshTokenError => ({
        code: AuthErrorCodes.INVALID_REFRESH_TOKEN,
        message,
        details: { token },
    }),
} as const;
