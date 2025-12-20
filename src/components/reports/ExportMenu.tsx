import React from "react";
import { Download } from "lucide-react";

const EXPORT_FORMATS = ["PDF", "CSV", "Excel", "JSON"];

const ExportMenu: React.FC = () => {
    return (
        <div className="relative group">
            <button className="flex items-center gap-2 border rounded px-3 py-2 text-sm hover:bg-gray-50">
                <Download size={14} />
                Export
            </button>

            <div className="absolute right-0 mt-1 hidden group-hover:block bg-white border rounded shadow z-10 w-36">
                {EXPORT_FORMATS.map(format => (
                    <button
                        key={format}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                    >
                        {format}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ExportMenu;
