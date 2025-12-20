import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaBell,
    FaChevronDown,
    FaSignOutAlt,
    FaCircle
} from "react-icons/fa";

import { UserRole } from "../types/auth";
import {
    notificationsData,
    NotificationItem
} from "../features/settings/data/notifications.data";

interface TopbarProps {
    role: UserRole | null;
    onLogout: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ role, onLogout }) => {
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showEnvMenu, setShowEnvMenu] = useState(false);
    const [environment, setEnvironment] = useState<"Test" | "Prod">("Test");

    const today = new Date().toISOString().split("T")[0];
    const [dateFrom, setDateFrom] = useState("2025-12-01");
    const [dateTo, setDateTo] = useState(today);

    const unreadCount = notificationsData.filter(n => !n.read).length;

    const handleLogoutClick = () => {
        onLogout();
        navigate("/login", { replace: true });
    };

    const handleNotificationClick = (notification: NotificationItem) => {
        setShowNotifications(false);
        if (notification.link) {
            navigate(notification.link);
        }
    };

    return (
        <div className="bg-white shadow px-6 py-3 flex items-center justify-between relative">
            {/* LEFT */}
            <div className="flex items-center space-x-4 relative">
                <span className="text-gray-700 font-semibold text-sm">
                    Environment:
                </span>

                <button
                    onClick={() => setShowEnvMenu(!showEnvMenu)}
                    className="bg-gray-100 px-3 py-1 text-sm rounded flex items-center space-x-1 hover:bg-gray-200"
                >
                    <span>{environment}</span>
                    <FaChevronDown className="text-xs" />
                </button>

                {showEnvMenu && (
                    <div className="absolute top-9 left-0 w-28 bg-white border rounded shadow z-50">
                        {["Test", "Prod"].map((env) => (
                            <div
                                key={env}
                                onClick={() => {
                                    setEnvironment(env as "Test" | "Prod");
                                    setShowEnvMenu(false);
                                }}
                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                                    environment === env
                                        ? "font-semibold text-blue-600"
                                        : "text-gray-700"
                                }`}
                            >
                                {env}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CENTER */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
                <h1 className="text-base font-semibold text-gray-800 whitespace-nowrap">
                    Interoperability Behavior Analysis Dashboard
                </h1>
            </div>

            {/* RIGHT */}
            <div className="flex items-center space-x-4 relative">
                <div className="flex items-center space-x-2 text-sm">
                    <input
                        type="date"
                        value={dateFrom}
                        max={dateTo}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="border rounded px-2 py-1 text-gray-700"
                    />
                    <span className="text-gray-500">→</span>
                    <input
                        type="date"
                        value={dateTo}
                        max={today}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="border rounded px-2 py-1 text-gray-700"
                    />
                </div>

                {/* Notifications */}
                <div className="relative">
                    <FaBell
                        className="text-gray-600 text-lg cursor-pointer"
                        onClick={() => setShowNotifications(!showNotifications)}
                    />

                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full px-1.5">
                            {unreadCount}
                        </span>
                    )}

                    {showNotifications && (
                        <div className="absolute right-0 mt-3 w-96 bg-white border rounded-md shadow-lg z-50">
                            <div className="px-4 py-3 border-b font-semibold text-sm text-gray-700">
                                Alerts
                            </div>

                            <div className="max-h-96 overflow-y-auto">
                                {notificationsData.map((n) => (
                                    <div
                                        key={n.id}
                                        className="px-4 py-3 border-b hover:bg-gray-50 cursor-pointer"
                                        onClick={() => handleNotificationClick(n)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {n.title}
                                                </p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    {n.description}
                                                </p>
                                                <p className="text-[11px] text-gray-400 mt-1">
                                                    {n.timestamp}
                                                </p>
                                            </div>

                                            <FaCircle
                                                className={`text-[10px] mt-1 ${
                                                    n.severity === "critical"
                                                        ? "text-red-600"
                                                        : n.severity === "warning"
                                                            ? "text-yellow-500"
                                                            : "text-blue-500"
                                                }`}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div
                                className="px-4 py-2 text-sm text-blue-600 hover:bg-gray-50 cursor-pointer text-center"
                                onClick={() => {
                                    setShowNotifications(false);
                                    navigate("/alerts");
                                }}
                            >
                                View all alerts
                            </div>
                        </div>
                    )}
                </div>

                {/* User Menu */}
                <div
                    onClick={() => setOpen(!open)}
                    className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold cursor-pointer select-none"
                >
                    AE
                </div>

                {open && (
                    <div className="absolute right-0 mt-2 w-44 bg-white border rounded-md shadow-lg text-sm z-50">
                        <div className="px-4 py-2 text-gray-600 border-b capitalize">
                            Role: {role}
                        </div>

                        <button
                            onClick={handleLogoutClick}
                            className="w-full px-4 py-2 flex items-center space-x-2 text-red-600 hover:bg-gray-100"
                        >
                            <FaSignOutAlt />
                            <span>Logout</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Topbar;
