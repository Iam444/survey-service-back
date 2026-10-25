import { ErrorCodes } from './error-codes.js';
import type { IBaseError } from 'lang-extensions/types';

export interface IChosenOptionsCountError extends IBaseError {
    readonly code: typeof ErrorCodes.CHOSEN_OPTIONS_COUNT;
    readonly details: {
        readonly optionsQuantity: number;
    };
}

export const ChosenOptionsCountError = {
    of: (optionsQuantity: number): IChosenOptionsCountError => ({
        code: ErrorCodes.CHOSEN_OPTIONS_COUNT,
        message: `Not able to choose more than one option. "Multichoice" is disabled. Chosen options quantity: ${optionsQuantity}`,
        details: { optionsQuantity },
    }),
} as const;
