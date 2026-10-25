import { SharedErrorCodes } from './shared-error-codes.js';
import type { IBaseError } from 'lang-extensions/types';

export interface INotPermittedError extends IBaseError {
    readonly code: typeof SharedErrorCodes.NOT_PERMITTED;
}

export const NotPermittedError = {
    of: (message: string): INotPermittedError => ({
        code: SharedErrorCodes.NOT_PERMITTED,
        message,
    }),
} as const;
