import React from 'react';

interface DecisionPanelProps {
    options: string[];
    selectedOption?: string;
    onSelect?: (value: string) => void;
}

const DecisionPanel: React.FC<DecisionPanelProps> = ({
                                                         options,
                                                         selectedOption,
                                                         onSelect,
                                                     }) => {
    return (
        <section className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold mb-3">Decision Panel</h2>

            <div className="space-y-3 text-sm">
                {options.map((option) => (
                    <label key={option} className="flex items-start gap-2">
                        <input
                            type="radio"
                            name="decision"
                            checked={selectedOption === option}
                            onChange={() => onSelect?.(option)}
                            className="mt-1"
                        />
                        <span>{option}</span>
                    </label>
                ))}
            </div>
        </section>
    );
};

export default DecisionPanel;
