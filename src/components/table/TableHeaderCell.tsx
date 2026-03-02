import React from 'react';

import { SortOrder } from './types';

interface TableHeaderCellProps<C extends string> {
    columnKey: C;
    label: string;
    sortable?: boolean;
    activeSortBy: C | null;
    activeSortOrder: SortOrder | null;
    onSort: (column: C) => void;
    disabled?: boolean;
    className?: string;
}

function getSortIndicator(isActive: boolean, order: SortOrder | null) {
    if (!isActive || !order) {
        return <span className="text-gray-300">↕</span>;
    }
    return order === 'asc' ? <span aria-label="ascending">▲</span> : <span aria-label="descending">▼</span>;
}

export function TableHeaderCell<C extends string>({
    columnKey,
    label,
    sortable = true,
    activeSortBy,
    activeSortOrder,
    onSort,
    disabled = false,
    className = 'p-3',
}: TableHeaderCellProps<C>) {
    const isActive = activeSortBy === columnKey;

    if (!sortable) {
        return <th className={className}>{label}</th>;
    }

    return (
        <th className={className}>
            <button
                type="button"
                onClick={() => onSort(columnKey)}
                disabled={disabled}
                className="inline-flex items-center gap-1 font-medium text-gray-700 disabled:cursor-not-allowed disabled:text-gray-400"
            >
                <span>{label}</span>
                {getSortIndicator(isActive, activeSortOrder)}
            </button>
        </th>
    );
}
