import React from "react";

export interface FiltersState {
    organization: string;
    status: string;
}

interface FiltersProps {
    value: FiltersState;
    onChange: React.Dispatch<React.SetStateAction<FiltersState>>;
    organizations: { id: string; name: string }[];
}

const Filters: React.FC<FiltersProps> = ({
                                             value,
                                             onChange,
                                             organizations,
                                         }) => {
    return (
        <div className="flex gap-4 bg-white p-4 rounded-lg shadow">
            {/* Organization */}
            <select
                value={value.organization}
                onChange={(e) =>
                    onChange((prev) => ({ ...prev, organization: e.target.value }))
                }
                className="border rounded px-3 py-2 text-sm"
            >
                <option value="">All Organizations</option>
                {organizations.map((org) => (
                    <option key={org.id} value={org.name}>
                        {org.name}
                    </option>
                ))}
            </select>

            {/* Status */}
            <select
                value={value.status}
                onChange={(e) =>
                    onChange((prev) => ({ ...prev, status: e.target.value }))
                }
                className="border rounded px-3 py-2 text-sm"
            >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="resolved">Resolved</option>
                <option value="ignored">Ignored</option>
            </select>
        </div>
    );
};

export default Filters;
