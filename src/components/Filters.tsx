import React from 'react';

const Filters: React.FC = () => {
    return (
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
            {/* Organization Filter */}
            <select className="p-2 border rounded-md w-full sm:w-56">
                <option>All Organizations</option>
                <option>Cleveland Clinic</option>
                <option>Kaiser Permanente</option>
                <option>HCA Healthcare</option>
                <option>Mayo Clinic</option>
            </select>

            {/* Facility Filter */}
            <select className="p-2 border rounded-md w-full sm:w-56">
                <option>All Facilities</option>
                <option>Fairview Hospital</option>
                <option>Oakland Medical Center</option>
                <option>St. David’s Medical Center</option>
                <option>Rochester Campus</option>
            </select>

            {/* Status Filter */}
            <select className="p-2 border rounded-md w-full sm:w-48">
                <option>All Statuses</option>
                <option>Compliant</option>
                <option>Non-Compliant</option>
            </select>
        </div>
    );
};

export default Filters;
