import { AuthErrorCodes } from './auth-error-codes.js';
import type { IBaseError } from 'lang-extensions/types';

export interface IInvalidCredentialsError extends IBaseError {
    readonly code: typeof AuthErrorCodes.INVALID_CREDENTIALS;
    readonly details: {
        readonly email: string;
    };
}

export const InvalidCredentialsError = {
    of: (message: string, email: string): IInvalidCredentialsError => ({
        code: AuthErrorCodes.INVALID_CREDENTIALS,
        message,
        details: { email },
    }),
} as const;
