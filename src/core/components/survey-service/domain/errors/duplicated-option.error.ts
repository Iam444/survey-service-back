import { ErrorCodes } from './error-codes.js';
import type { IDuplicatedElementError } from 'lang-extensions/types';
import type { TPollOption } from '../poll/poll-option.js';

export interface IDuplicatedOptionError<T extends TPollOption = TPollOption> extends IDuplicatedElementError<T> {
    readonly code: typeof ErrorCodes.DUPLICATED_OPTION;
    readonly details: {
        readonly duplicant: T;
    };
}

export const DuplicatedOptionError = {
    of: <T extends TPollOption>(message: string, duplicant: T): IDuplicatedOptionError<T> => ({
        code: ErrorCodes.DUPLICATED_OPTION,
        message,
        details: { duplicant },
    }),
} as const;
