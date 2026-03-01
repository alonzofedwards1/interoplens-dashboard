import { Link, useLocation } from 'react-router-dom';

export const TransactionLink = ({ id }: { id: string }) => {
    const location = useLocation();

    return (
        <Link
            to={`/transactions/${id}`}
            state={{ from: location.pathname }}
            className="text-blue-600 hover:text-blue-800 underline underline-offset-2 font-mono"
        >
            {id}
        </Link>
    );
};
