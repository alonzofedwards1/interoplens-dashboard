import { NavLink } from "react-router-dom";
import {
    FaTachometerAlt,
    FaHeartbeat,
    FaFingerprint,
    FaFileAlt,
    FaCog,
    FaBook
} from "react-icons/fa";

const iconClass =
    "text-xl cursor-pointer transition-opacity hover:opacity-80";

const activeClass = "opacity-100";
const inactiveClass = "opacity-60";

const Sidebar = () => {
    return (
        <div className="w-20 bg-blue-900 text-white flex flex-col items-center py-4 space-y-6">
            {/* Dashboard */}
            <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                    `${iconClass} ${isActive ? activeClass : inactiveClass}`
                }
                title="Dashboard"
            >
                <FaTachometerAlt />
            </NavLink>

            {/* Integration Health */}
            <NavLink
                to="/IntegrationIssues"
                className={({ isActive }) =>
                    `${iconClass} ${isActive ? activeClass : inactiveClass}`
                }
                title="Integration Health"
            >
                <FaHeartbeat />
            </NavLink>

            {/* OID Registry */}
            <NavLink
                to="/oids"
                className={({ isActive }) =>
                    `${iconClass} ${isActive ? activeClass : inactiveClass}`
                }
                title="OID Registry"
            >
                <FaFingerprint />
            </NavLink>

            {/* Reports */}
            <NavLink
                to="/reports"
                className={({ isActive }) =>
                    `${iconClass} ${isActive ? activeClass : inactiveClass}`
                }
                title="Reports"
            >
                <FaFileAlt />
            </NavLink>

            {/* Knowledge Base */}
            <NavLink
                to="/knowledge-base"
                className={({ isActive }) =>
                    `${iconClass} ${isActive ? activeClass : inactiveClass}`
                }
                title="Knowledge Base"
            >
                <FaBook />
            </NavLink>

            {/* Settings */}
            <NavLink
                to="/settings"
                className={({ isActive }) =>
                    `${iconClass} ${isActive ? activeClass : inactiveClass}`
                }
                title="Settings"
            >
                <FaCog />
            </NavLink>
        </div>
    );
};

export default Sidebar;
