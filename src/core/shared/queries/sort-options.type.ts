export type TSortOptions<T> = {
    [K in keyof T]?: TSortOrder;
};

export const SortOrdersEnum = {
    ASC: 'asc',
    DESC: 'desc',
} as const;

export type TSortOrder = (typeof SortOrdersEnum)[keyof typeof SortOrdersEnum];
