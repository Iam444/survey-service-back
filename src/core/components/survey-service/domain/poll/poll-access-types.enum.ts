export const PollAccessTypesEnum = {
    PUBLIC: 'public',
    REGISTERED: 'registered_only',
    SPECIFIED: 'specified_users',
} as const;

export type TPollAccessType = (typeof PollAccessTypesEnum)[keyof typeof PollAccessTypesEnum];
