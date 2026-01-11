import { Link } from 'react-router-dom';

export const TransactionLink = ({ id }: { id: string }) => {
    return (
        <Link
            to={`/transactions/${id}`}
            className="text-blue-600 hover:text-blue-800 underline underline-offset-2 font-mono"
        >
            {id}
        </Link>
    );
};
