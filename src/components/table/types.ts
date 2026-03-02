export type SortOrder = 'asc' | 'desc';

export type PrimitiveFilterValue = string | number | boolean;

export interface RangeFilterValue<T extends string | number> {
    min?: T;
    max?: T;
}

export interface DateRangeFilterValue {
    start?: string;
    end?: string;
}

export type FilterValue =
    | PrimitiveFilterValue
    | null
    | undefined
    | RangeFilterValue<string>
    | RangeFilterValue<number>
    | DateRangeFilterValue;

export type TableFilterRecord = Record<string, FilterValue>;
