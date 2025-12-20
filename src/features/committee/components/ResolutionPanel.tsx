import React from 'react';

interface ResolutionPanelProps {
    canResolve: boolean;
    isGenerated?: boolean;
    onGenerateKB?: () => void;
}

const ResolutionPanel: React.FC<ResolutionPanelProps> = ({
    canResolve,
    isGenerated,
    onGenerateKB,
}) => {
    const buttonText = isGenerated
        ? 'Knowledge Base Article Queued'
        : 'Generate Knowledge Base Article';

    return (
        <section className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold mb-2">Resolution</h2>

            {!canResolve ? (
                <p className="text-sm text-gray-500 mb-3">
                    A finalized decision is required before this case can be resolved.
                </p>
            ) : (
                <p className="text-sm text-gray-600 mb-3">
                    This case is eligible for resolution and knowledge base publication.
                </p>
            )}

            <button
                disabled={!canResolve || isGenerated}
                onClick={onGenerateKB}
                className={`w-full px-3 py-2 rounded ${
                    canResolve && !isGenerated
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
            >
                {buttonText}
            </button>
        </section>
    );
};

export default ResolutionPanel;
