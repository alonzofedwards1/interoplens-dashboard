import React from 'react';

interface EvidenceItem {
    title: string;
    description: string;
}

interface EvidenceSnapshotProps {
    items: EvidenceItem[];
}

const EvidenceSnapshot: React.FC<EvidenceSnapshotProps> = ({ items }) => {
    return (
        <section className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold mb-4">Evidence Snapshot</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item, idx) => (
                    <div key={idx} className="border rounded p-4">
                        <div className="text-sm font-medium">{item.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                            {item.description}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default EvidenceSnapshot;
