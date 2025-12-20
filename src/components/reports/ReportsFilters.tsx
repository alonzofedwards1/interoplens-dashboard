import React from "react";
import { Filter } from "lucide-react";

interface ReportsFiltersProps {
    dateRange: string;
    environment: string;
    status: string;
    onDateRangeChange: (v: string) => void;
    onEnvironmentChange: (v: string) => void;
    onStatusChange: (v: string) => void;
}

const ReportsFilters: React.FC<ReportsFiltersProps> = ({
                                                           dateRange,
                                                           environment,
                                                           status,
                                                           onDateRangeChange,
                                                           onEnvironmentChange,
                                                           onStatusChange
                                                       }) => {
    return (
        <div className="bg-white border rounded-lg p-4 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter size={16} />
                Filters
            </div>

            <select
                className="border rounded px-3 py-1 text-sm"
                value={dateRange}
                onChange={(e) => onDateRangeChange(e.target.value)}
            >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="custom">Custom Range</option>
            </select>

            <select
                className="border rounded px-3 py-1 text-sm"
                value={environment}
                onChange={(e) => onEnvironmentChange(e.target.value)}
            >
                <option value="all">All Environments</option>
                <option value="prod">Production</option>
                <option value="test">Test</option>
                <option value="sandbox">Sandbox</option>
            </select>

            <select
                className="border rounded px-3 py-1 text-sm"
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
            >
                <option value="all">All Statuses</option>
                <option value="healthy">Healthy</option>
                <option value="degraded">Degraded</option>
                <option value="failing">Failing</option>
            </select>
        </div>
    );
};

export default ReportsFilters;
