import React from "react";

const ReportsHeader: React.FC = () => {
    return (
        <div>
            <h1 className="text-2xl font-semibold">
                Interoperability Reports
            </h1>
            <p className="text-sm text-gray-500">
                Canned, exportable intelligence snapshots generated from observed exchange behavior
            </p>
        </div>
    );
};

export default ReportsHeader;
