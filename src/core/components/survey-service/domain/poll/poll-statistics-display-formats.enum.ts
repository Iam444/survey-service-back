export const PollStatisticsDisplayFormatsEnum = {
    NONE: 'none',
    PARTIAL: 'partial',
    FULL: 'full',
} as const;

export type TPollStatisticsDisplayFormat =
    (typeof PollStatisticsDisplayFormatsEnum)[keyof typeof PollStatisticsDisplayFormatsEnum];
