const DOMAIN_PREFIX = 'BASE';

export const AuthErrorCodes = {
    INVALID_CREDENTIALS: `${DOMAIN_PREFIX}.INVALID_CREDENTIALS`,
    INVALID_REFRESH_TOKEN: `${DOMAIN_PREFIX}.INVALID_REFRESH_TOKEN`,
} as const;

export type TAuthErrorCode = (typeof AuthErrorCodes)[keyof typeof AuthErrorCodes];
