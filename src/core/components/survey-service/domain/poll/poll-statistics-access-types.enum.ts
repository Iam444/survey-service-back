export const PollStatisticsAccessTypesEnum = {
    PUBLIC: 'public',
    SPECIFIED: 'specified_users',
    PRIVATE: 'private',
} as const;

export type TPollStatisticsAccessType =
    (typeof PollStatisticsAccessTypesEnum)[keyof typeof PollStatisticsAccessTypesEnum];
