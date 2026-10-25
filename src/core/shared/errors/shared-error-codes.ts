export const SharedErrorCodes = {
    NOT_FOUND: 'NOT_FOUND',
    NOT_PERMITTED: 'NOT_PERMITTED',
} as const;

export type TSharedErrorCode = (typeof SharedErrorCodes)[keyof typeof SharedErrorCodes];
