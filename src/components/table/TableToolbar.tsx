import React from 'react';

interface TableToolbarProps {
    globalSearch: string;
    onGlobalSearchChange: (value: string) => void;
    onReset: () => void;
    limit: number;
    onLimitChange: (limit: number) => void;
    isLoading?: boolean;
}

export const TableToolbar: React.FC<TableToolbarProps> = ({
    globalSearch,
    onGlobalSearchChange,
    onReset,
    limit,
    onLimitChange,
    isLoading = false,
}) => {
    const [localSearch, setLocalSearch] = React.useState(globalSearch);

    React.useEffect(() => {
        setLocalSearch(globalSearch);
    }, [globalSearch]);

    React.useEffect(() => {
        const timeout = window.setTimeout(() => {
            onGlobalSearchChange(localSearch);
        }, 400);

        return () => window.clearTimeout(timeout);
    }, [localSearch, onGlobalSearchChange]);

    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-4 shadow">
            <input
                type="search"
                value={localSearch}
                onChange={event => setLocalSearch(event.target.value)}
                placeholder="Global search"
                className="w-full rounded border px-3 py-2 sm:w-80"
                disabled={isLoading}
            />

            <div className="flex items-center gap-2">
                <label htmlFor="table-page-size" className="text-sm text-gray-700">
                    Page size
                </label>
                <select
                    id="table-page-size"
                    value={limit}
                    onChange={event => onLimitChange(Number(event.target.value))}
                    className="rounded border px-2 py-1 text-sm"
                    disabled={isLoading}
                >
                    {[10, 25, 50, 100].map(size => (
                        <option key={size} value={size}>
                            {size}
                        </option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={onReset}
                    className="rounded border px-3 py-1 text-sm"
                    disabled={isLoading}
                >
                    Reset
                </button>
            </div>
        </div>
    );
};
