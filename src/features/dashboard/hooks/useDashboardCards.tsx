import React from 'react';

import {
    FaUsers,
    FaExclamationTriangle,
    FaBell,
    FaExclamationCircle,
    FaGavel,
} from 'react-icons/fa';

import { AlertCardData, AlertIconKey } from './useDashboardMetrics';

interface AlertCard {
    title: string;
    value: string;
    icon: React.ReactNode;
    bgColor: string;
    textColor: string;
    route: string;
}

const iconMap: Record<AlertIconKey, React.ReactNode> = {
    users: <FaUsers className="text-blue-500 text-2xl" />,
    findings: <FaExclamationTriangle className="text-red-500 text-2xl" />,
    warning: <FaBell className="text-yellow-500 text-2xl" />,
    critical: <FaExclamationCircle className="text-orange-600 text-2xl" />,
    committee: <FaGavel className="text-red-600 text-2xl" />,
};

const useDashboardCards = (alertCards: AlertCardData[]) => {
    const cards = React.useMemo(
        () =>
            alertCards.map(card => ({
                ...card,
                icon: iconMap[card.iconKey],
            })),
        [alertCards]
    );

    return { cards };
};

export type { AlertCard };
export default useDashboardCards;
