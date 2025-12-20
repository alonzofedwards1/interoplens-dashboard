import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
    KnowledgeBaseArticle,
    KnowledgeBaseStatus,
} from './data/knowledgeBase.data';
import { readKnowledgeBase } from './knowledgeBaseStore';

const statusLabels: Record<KnowledgeBaseStatus, string> = {
    queued: 'Queued',
    draft: 'Draft',
    published: 'Published',
};

const badgeClasses: Record<KnowledgeBaseStatus, string> = {
    queued: 'bg-blue-100 text-blue-800',
    draft: 'bg-yellow-100 text-yellow-800',
    published: 'bg-green-100 text-green-800',
};

const KnowledgeBasePage: React.FC = () => {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState<'all' | KnowledgeBaseStatus>(
        'all'
    );
    const [articles, setArticles] = useState<KnowledgeBaseArticle[]>([]);

    useEffect(() => {
        setArticles(readKnowledgeBase());
    }, []);

    const filteredArticles = useMemo(() => {
        if (statusFilter === 'all') return articles;
        return articles.filter((article) => article.status === statusFilter);
    }, [articles, statusFilter]);

    return (
        <div className="p-6 space-y-4">
            <button
                onClick={() => navigate('/committee')}
                className="text-sm text-blue-600 hover:underline"
            >
                ← Back to Committee Queue
            </button>

            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Knowledge Base Articles
                    </h1>
                    <p className="text-sm text-gray-600">
                        Published learnings generated from the committee workflow.
                    </p>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                    <label htmlFor="kb-status" className="text-gray-700">
                        Status
                    </label>
                    <select
                        id="kb-status"
                        value={statusFilter}
                        onChange={(event) =>
                            setStatusFilter(event.target.value as 'all' | KnowledgeBaseStatus)
                        }
                        className="border rounded px-3 py-1 text-gray-800"
                    >
                        <option value="all">All</option>
                        <option value="queued">Queued</option>
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left">Case</th>
                            <th className="px-4 py-3 text-left">Title</th>
                            <th className="px-4 py-3 text-left">Decision</th>
                            <th className="px-4 py-3 text-left">Status</th>
                            <th className="px-4 py-3 text-left">Last Updated</th>
                            <th className="px-4 py-3 text-left">Tags</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredArticles.map((article) => (
                            <tr
                                key={article.id}
                                className="border-t hover:bg-gray-50"
                            >
                                <td className="px-4 py-3 font-mono text-gray-700">
                                    {article.caseId}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-semibold text-gray-900">
                                        {article.title}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {article.organization}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {article.resolutionSummary}
                                    </p>
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                    {article.decision}
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`px-2 py-0.5 rounded text-xs font-semibold ${badgeClasses[article.status]}`}
                                    >
                                        {statusLabels[article.status]}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                                    {new Date(article.updatedAt).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-gray-700">
                                    <div className="flex flex-wrap gap-2">
                                        {article.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!filteredArticles.length && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-6 text-center text-gray-500"
                                >
                                    No knowledge base articles match this filter yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default KnowledgeBasePage;
