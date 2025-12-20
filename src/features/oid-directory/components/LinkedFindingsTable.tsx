interface Finding {
    id: string;
    severity: "OK" | "WARNING" | "CRITICAL";
    summary: string;
    lastObserved: string;
}

interface Props {
    findings?: Finding[];
}

const LinkedFindingsTable = ({ findings = [] }: Props) => {
    return (
        <div className="border rounded p-4 bg-white">
            <h2 className="text-lg font-semibold mb-2">Linked Findings</h2>

            {findings.length === 0 ? (
                <p className="text-sm text-gray-500">
                    No findings currently associated with this OID.
                </p>
            ) : (
                <table className="w-full text-sm border">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 text-left">Severity</th>
                        <th className="p-2 text-left">Summary</th>
                        <th className="p-2 text-left">Last Observed</th>
                    </tr>
                    </thead>
                    <tbody>
                    {findings.map(f => (
                        <tr key={f.id} className="border-t">
                            <td className="p-2">{f.severity}</td>
                            <td className="p-2">{f.summary}</td>
                            <td className="p-2">{f.lastObserved}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default LinkedFindingsTable;
