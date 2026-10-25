export type TFilter<T> = {
    readonly is?: T;
    readonly not?: T;
    readonly in?: T[];
    readonly notIn?: T[];
    readonly from?: T;
    readonly to?: T;
    readonly contains?: string;
};

export type TPureFilters<T> = {
    readonly [K in keyof T]?: TFilter<T[K]>;
};

export type TFilters<T> = TPureFilters<T> & {
    readonly _or?: TPureFilters<T>[];
};
