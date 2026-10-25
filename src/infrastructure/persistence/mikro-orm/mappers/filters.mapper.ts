import type { ObjectQuery } from '@mikro-orm/core';
import type { TFilters, TFilter, TPureFilters } from '$shared/queries/filters.type.js';

export class FiltersMapper {
    public static map<T extends object>(filters?: TFilters<T>): ObjectQuery<T> {
        if (!filters) {
            return {} as ObjectQuery<T>;
        }

        const where: Record<string, unknown> = {};

        if (filters._or) {
            where.$or = filters._or.map((clause) => this.map(clause));
        }

        const pureFilters: TPureFilters<T> = { ...filters, _or: undefined };
        const pureFiltersEntries = Object.entries(pureFilters) as [keyof T & string, TFilter<T[keyof T]> | undefined][];

        for (const [key, filter] of pureFiltersEntries) {
            if (key === '_or' || !filter) continue;

            const filterValue: Record<string, unknown> = {};

            if (filter.is !== undefined) {
                filterValue.$eq = filter.is;
            }

            if (filter.not !== undefined) {
                filterValue.$ne = filter.not;
            }

            if (filter.in !== undefined) {
                filterValue.$in = filter.in;
            }

            if (filter.notIn !== undefined) {
                filterValue.$nin = filter.notIn;
            }

            if (filter.from !== undefined) {
                filterValue.$gte = filter.from;
            }

            if (filter.to !== undefined) {
                filterValue.$lte = filter.to;
            }

            if (filter.contains !== undefined) {
                filterValue.$ilike = `%${filter.contains}%`;
            }

            if (Object.keys(filterValue).length > 0) {
                where[key] = filterValue;
            }
        }

        return where as ObjectQuery<T>;
    }
}
