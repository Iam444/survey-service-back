export const PollStatusesEnum = {
    CREATED: 'created',
    OPENED: 'opened',
    CLOSED: 'closed',
} as const;

export type TPollStatus = (typeof PollStatusesEnum)[keyof typeof PollStatusesEnum];
