export type CommitteeStatus =
    | 'Pending Review'
    | 'In Committee'
    | 'Decision Required'
    | 'Decision Made'
    | 'Resolved';

export const committeeStatusOrder: CommitteeStatus[] = [
    'Pending Review',
    'In Committee',
    'Decision Required',
    'Decision Made',
    'Resolved',
];

export const committeeStatusStyles: Record<CommitteeStatus, string> = {
    'Pending Review': 'bg-gray-100 text-gray-800',
    'In Committee': 'bg-blue-100 text-blue-800',
    'Decision Required': 'bg-red-100 text-red-800',
    'Decision Made': 'bg-green-100 text-green-800',
    'Resolved': 'bg-emerald-100 text-emerald-800',
};
