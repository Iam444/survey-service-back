import { SharedErrorCodes } from './shared-error-codes.js';
import type { IBaseError } from 'lang-extensions/types';

export interface INotFoundError extends IBaseError {
    readonly code: typeof SharedErrorCodes.NOT_FOUND;
    readonly details: {
        readonly searchSubject: string;
        readonly searchField: string;
        readonly searchValue: unknown;
    };
}

export const NotFoundError = {
    of: (searchSubject: string, searchField: string, searchValue: unknown): INotFoundError => ({
        code: SharedErrorCodes.NOT_FOUND,
        message: `"${searchSubject} not found by provided ${searchField}. Provided ${searchField}: "${searchValue?.toString()}"`,
        details: { searchSubject, searchField, searchValue },
    }),
} as const;
