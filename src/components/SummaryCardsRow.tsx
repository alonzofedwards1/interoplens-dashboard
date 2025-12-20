import React from "react";
import { FaUsers, FaExclamationTriangle, FaTimesCircle, FaBug, FaGavel } from "react-icons/fa";
import SummaryCard from "./SummaryCards";

const SummaryCardsRow = () => {
    return (
        <div className="flex flex-wrap gap-4 mt-6">
            <SummaryCard
                count="10,004"
                label="Total PD Executions"
                bgColor="bg-blue-50"
                Icon={FaUsers}
                iconColor="text-blue-500"
            />
            <SummaryCard
                count="54"
                label="Findings Detected"
                bgColor="bg-red-50"
                Icon={FaExclamationTriangle}
                iconColor="text-red-500"
            />
            <SummaryCard
                count="2"
                label="Warnings"
                bgColor="bg-yellow-100"
                Icon={FaExclamationTriangle}
                iconColor="text-yellow-500"
            />
            <SummaryCard
                count="3"
                label="Critical Issues"
                bgColor="bg-yellow-200"
                Icon={FaBug}
                iconColor="text-orange-600"
            />
            <SummaryCard
                count="3"
                label="CommitteeQueue"
                bgColor="bg-red-100"
                Icon={FaGavel}
                iconColor="text-red-700"
            />
        </div>
    );
};

export default SummaryCardsRow;
