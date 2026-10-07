import { NavLink } from "react-router-dom";

function Sidebar() {
    const menuItems = [
        {
            path: "/dashboard",
            icon: "🏠",
            label: "Dashboard",
        },
        {
            path: "/add-patient",
            icon: "➕",
            label: "Add Patient",
        },
        {
            path: "/patients",
            icon: "👥",
            label: "Patients",
        },
        {
            path: "/prediction",
            icon: "🧠",
            label: "AI Prediction",
        },
        {
            path: "/blood-report",
            icon: "📄",
            label: "Report Analysis",
        },
        {
            path: "/reports",
            icon: "📊",
            label: "Reports",
        },
        {
            path: "/prediction-history",
            icon: "📜",
            label: "Prediction History",
        },
    ];

    return (
        <aside className="rc-sidebar">

            {/* BRAND */}
            <div className="rc-sidebar-brand">

                <div className="rc-brand-icon">
                    🩺
                </div>

                <div>
                    <div className="rc-brand-name">
                        RuralCareAI
                    </div>

                    <div className="rc-brand-subtitle">
                        AI Healthcare
                    </div>
                </div>

            </div>

            {/* SYSTEM STATUS */}
            <div className="rc-system-status">
                <span className="rc-status-dot"></span>

                <div>
                    <div className="rc-status-title">
                        System Online
                    </div>

                    <div className="rc-status-subtitle">
                        AI services active
                    </div>
                </div>
            </div>

            {/* NAVIGATION */}
            <div className="rc-nav-section">

                <div className="rc-nav-title">
                    WORKSPACE
                </div>

                <nav className="rc-sidebar-nav">

                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `rc-nav-link ${
                                    isActive ? "active" : ""
                                }`
                            }
                        >

                            <span className="rc-nav-icon">
                                {item.icon}
                            </span>

                            <span className="rc-nav-label">
                                {item.label}
                            </span>

                            <span className="rc-nav-arrow">
                                ›
                            </span>

                        </NavLink>
                    ))}

                </nav>

            </div>

            {/* BOTTOM */}
            <div className="rc-sidebar-bottom">

                <div className="rc-help-card">

                    <div className="rc-help-icon">
                        💡
                    </div>

                    <div>
                        <div className="rc-help-title">
                            AI Assistant
                        </div>

                        <div className="rc-help-text">
                            Healthcare support is ready.
                        </div>
                    </div>

                </div>

                <NavLink
                    to="/"
                    className="rc-logout"
                >
                    <span>🚪</span>
                    <span>Logout</span>
                </NavLink>

            </div>

        </aside>
    );
}

export default Sidebar;