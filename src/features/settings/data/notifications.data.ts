export type NotificationSeverity = "info" | "warning" | "critical";

export interface NotificationItem {
    id: string;
    title: string;
    description: string;
    severity: NotificationSeverity;
    timestamp: string;
    link?: string;
    read?: boolean;
}

export const notificationsData: NotificationItem[] = [
    {
        id: "notif-001",
        title: "Patient Discovery Failure Spike",
        description:
            "Patient Discovery failures exceeded baseline for Epic QHIN over the last 2 hours.",
        severity: "critical",
        timestamp: "5 min ago",
        link: "/integration-issues",
        read: false
    },
    {
        id: "notif-002",
        title: "Certificate Expiring Soon",
        description:
            "Cerner endpoint certificate expires in 12 days. Renewal recommended.",
        severity: "warning",
        timestamp: "32 min ago",
        read: false
    },
    {
        id: "notif-003",
        title: "CommitteeQueue Review Required",
        description:
            "New interoperability finding requires committee triage.",
        severity: "warning",
        timestamp: "1 hr ago",
        link: "/committee",
        read: false
    },
    {
        id: "notif-004",
        title: "TEFCA Readiness Snapshot Generated",
        description:
            "Weekly TEFCA readiness report completed successfully.",
        severity: "info",
        timestamp: "Yesterday",
        link: "/reports",
        read: true
    }
];
