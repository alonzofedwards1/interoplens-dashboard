import React from 'react';
import { AlertCard } from './useDashboardMetrics';

const useDashboardCards = (alertCards: AlertCard[]) => {
    const cards = React.useMemo(() => alertCards, [alertCards]);
    return { cards };
};

export default useDashboardCards;
