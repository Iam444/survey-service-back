export const PollFormatsEnum = {
    VOTING: 'voting',
    ELECTIONS: 'elections',
} as const;

export type TPollFormat = (typeof PollFormatsEnum)[keyof typeof PollFormatsEnum];
