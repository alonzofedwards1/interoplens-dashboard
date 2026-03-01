import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

interface BackButtonLocationState {
    from?: string;
}

interface BackButtonProps {
    defaultRoute: string;
    className?: string;
    label?: string;
    showIcon?: boolean;
}

const BackButton: React.FC<BackButtonProps> = ({
    defaultRoute,
    className,
    label = 'Back',
    showIcon = true,
}) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleBack = React.useCallback(() => {
        const state = location.state as BackButtonLocationState | null;
        const from = state?.from;

        if (typeof from === 'string' && from.length > 0 && from !== location.pathname) {
            navigate(from);
            return;
        }

        navigate(defaultRoute);
    }, [defaultRoute, location.pathname, location.state, navigate]);

    return (
        <button onClick={handleBack} className={className}>
            {showIcon && <FaArrowLeft aria-hidden className="inline mr-1" />}
            {label}
        </button>
    );
};

export default BackButton;
