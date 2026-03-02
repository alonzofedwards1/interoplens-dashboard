import React from 'react';

type FilterType = 'text' | 'number' | 'date' | 'enum' | 'range';

interface EnumOption {
    label: string;
    value: string;
}

interface ColumnFilterProps {
    type: FilterType;
    value: string | number | { min?: number | string; max?: number | string };
    onChange: (value: string | number | { min?: number | string; max?: number | string }) => void;
    options?: EnumOption[];
    placeholder?: string;
    className?: string;
    debounceMs?: number;
}

export const ColumnFilter: React.FC<ColumnFilterProps> = ({
    type,
    value,
    onChange,
    options = [],
    placeholder,
    className = 'border rounded px-2 py-1 text-sm',
    debounceMs = 0,
}) => {
    const [localValue, setLocalValue] = React.useState(value);

    React.useEffect(() => {
        setLocalValue(value);
    }, [value]);

    React.useEffect(() => {
        if (!debounceMs) {
            return;
        }

        const handle = window.setTimeout(() => {
            onChange(localValue);
        }, debounceMs);

        return () => {
            window.clearTimeout(handle);
        };
    }, [debounceMs, localValue, onChange]);

    if (type === 'enum') {
        return (
            <select
                className={className}
                value={String(value ?? '')}
                onChange={event => onChange(event.target.value)}
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        );
    }

    if (type === 'range') {
        const rangeValue =
            typeof value === 'object' && value != null ? value : { min: undefined, max: undefined };

        return (
            <div className="flex gap-2">
                <input
                    type="number"
                    className={className}
                    placeholder="Min"
                    value={rangeValue.min ?? ''}
                    onChange={event =>
                        onChange({
                            ...rangeValue,
                            min: event.target.value === '' ? undefined : Number(event.target.value),
                        })
                    }
                />
                <input
                    type="number"
                    className={className}
                    placeholder="Max"
                    value={rangeValue.max ?? ''}
                    onChange={event =>
                        onChange({
                            ...rangeValue,
                            max: event.target.value === '' ? undefined : Number(event.target.value),
                        })
                    }
                />
            </div>
        );
    }

    const inputType = type === 'date' ? 'datetime-local' : type;

    return (
        <input
            type={inputType}
            className={className}
            placeholder={placeholder}
            value={String(localValue ?? '')}
            onChange={event => {
                const nextValue = type === 'number' ? Number(event.target.value) : event.target.value;
                setLocalValue(nextValue);
                if (!debounceMs) {
                    onChange(nextValue);
                }
            }}
        />
    );
};
