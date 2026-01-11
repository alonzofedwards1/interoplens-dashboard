import React from 'react';

import { AlertCard } from '../hooks/useDashboardMetrics';


interface AlertSummaryCardsProps {
    cards: AlertCard[];
    onNavigate: (route: string) => void;
}

const AlertSummaryCards: React.FC<AlertSummaryCardsProps> = ({
    cards,
    onNavigate,
}) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map(card => (
                <button
                    key={card.title}
                    type="button"
                    onClick={() => onNavigate(card.route)}
                    className={
                        `text-left rounded-lg p-4 shadow w-full ` +
                        `flex items-center space-x-3 ` +
                        `transition hover:shadow-md hover:scale-[1.02] ` +
                        `${card.bgColor} ${card.textColor}`
                    }
                >
                    <div>{card.icon}</div>
                    <div>
                        <div className="text-xl font-bold">{card.value}</div>
                        <div className="text-sm">{card.title}</div>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default AlertSummaryCards;
