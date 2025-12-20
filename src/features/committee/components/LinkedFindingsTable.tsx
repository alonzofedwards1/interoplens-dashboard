import React from 'react';

interface LinkedFinding {
    id: string;
    type: string;
    date: string;
    severity: string;
}

interface LinkedFindingsTableProps {
    findings: LinkedFinding[];
}

const LinkedFindingsTable: React.FC<LinkedFindingsTableProps> = ({ findings }) => {
    return (
        <section className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold mb-3">Linked Findings</h2>

            <table className="w-full text-sm">
                <thead className="text-left text-gray-500 border-b">
                <tr>
                    <th className="py-2">Finding ID</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Severity</th>
                </tr>
                </thead>
                <tbody>
                {findings.map((f) => (
                    <tr key={f.id} className="border-b">
                        <td className="py-2 font-mono">{f.id}</td>
                        <td>{f.type}</td>
                        <td>{f.date}</td>
                        <td>{f.severity}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </section>
    );
};

export default LinkedFindingsTable;
