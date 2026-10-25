import { ErrorCodes } from './error-codes.js';
import type { IBaseError } from 'lang-extensions/types';

export interface IInvalidStatusTransitionError extends IBaseError {
    readonly code: typeof ErrorCodes.INVALID_STATUS_TRANSITION;
    readonly details: {
        readonly source: string;
        readonly target: string;
    };
}

export const InvalidStatusTransitionError = {
    of: (source: string, target: string): IInvalidStatusTransitionError => ({
        code: ErrorCodes.INVALID_STATUS_TRANSITION,
        message: `Not able to change status from '${source}' to '${target}'`,
        details: { source, target },
    }),
} as const;
