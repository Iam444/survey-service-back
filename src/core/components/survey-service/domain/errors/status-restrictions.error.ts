import { ErrorCodes } from './error-codes.js';
import type { IBaseError } from 'lang-extensions/types';

export interface IStatusRestrictionsError extends IBaseError {
    readonly code: typeof ErrorCodes.STATUS_RESTRICTIONS;
    readonly details: {
        readonly status: string;
    };
}

export const StatusRestrictionsError = {
    of: (description: string, status: string): IStatusRestrictionsError => ({
        code: ErrorCodes.STATUS_RESTRICTIONS,
        message: `${description} Current status: "${status}"`,
        details: { status },
    }),
} as const;
