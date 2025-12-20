import React from 'react';

interface TimelineEvent {
    label: string;
    date?: string;
    active?: boolean;
}

interface DecisionTimelineProps {
    events: TimelineEvent[];
}

const DecisionTimeline: React.FC<DecisionTimelineProps> = ({ events }) => {
    return (
        <section className="bg-white rounded-lg shadow p-5">
            <h2 className="text-lg font-semibold mb-3">Decision Timeline</h2>

            <ul className="space-y-2 text-sm">
                {events.map((e, idx) => (
                    <li
                        key={idx}
                        className={e.active ? 'font-medium text-orange-700' : ''}
                    >
                        • {e.label}
                        {e.date && ` — ${e.date}`}
                    </li>
                ))}
            </ul>
        </section>
    );
};

export default DecisionTimeline;
