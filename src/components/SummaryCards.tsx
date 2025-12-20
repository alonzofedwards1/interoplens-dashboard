import React from "react";
import { IconType } from "react-icons";

interface SummaryCardProps {
    count: number | string;
    label: string;
    bgColor: string;
    Icon: IconType;
    iconColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ count, label, bgColor, Icon, iconColor }) => {
    return (
        <div className={`p-4 rounded shadow-sm ${bgColor} flex items-center space-x-4 min-w-[150px]`}>
            <Icon className={`text-2xl ${iconColor}`} />
            <div>
                <div className="text-xl font-bold">{count}</div>
                <div className="text-sm text-gray-700">{label}</div>
            </div>
        </div>
    );
};

export default SummaryCard;
