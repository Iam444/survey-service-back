import { ErrorCodes } from './error-codes.js';
import type { IDuplicatedElementError } from 'lang-extensions/types';
import type { UserID } from '$shared/components/base/domain/user/user.id.js';

export interface IDuplicatedAccessHolderError extends IDuplicatedElementError<UserID> {
    readonly code: typeof ErrorCodes.DUPLICATED_OPTION;
    readonly details: {
        readonly duplicant: UserID;
    };
}

export const DuplicatedAccessHolderError = {
    of: (message: string, duplicant: UserID): IDuplicatedAccessHolderError => ({
        code: ErrorCodes.DUPLICATED_OPTION,
        message,
        details: { duplicant },
    }),
} as const;
