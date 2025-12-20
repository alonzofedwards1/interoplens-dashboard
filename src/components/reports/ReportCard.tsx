import React from "react";
import ExportMenu from "./ExportMenu";
import { Calendar } from "lucide-react";

interface ReportCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    audience: string;
    lastGenerated: string;
    onView: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({
                                                   icon,
                                                   title,
                                                   description,
                                                   audience,
                                                   lastGenerated,
                                                   onView
                                               }) => {
    return (
        <div className="bg-white border rounded-lg p-5 flex flex-col justify-between">
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded bg-gray-100 text-gray-700">
                        {icon}
                    </div>
                    <h2 className="font-semibold text-lg">
                        {title}
                    </h2>
                </div>

                <p className="text-sm text-gray-600">
                    {description}
                </p>

                <div className="text-xs text-gray-500 space-y-1">
                    <div>
                        <strong>Audience:</strong> {audience}
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        Last generated: {lastGenerated}
                    </div>
                </div>
            </div>

            <div className="mt-4 flex gap-2">
                <button
                    onClick={onView}
                    className="flex-1 border rounded px-3 py-2 text-sm hover:bg-gray-50"
                >
                    View
                </button>

                <ExportMenu />
            </div>
        </div>
    );
};

export default ReportCard;
