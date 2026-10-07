import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";


function Dashboard() {

    const [stats, setStats] = useState({
        patients: 0,
        predictions: 0,
        reports: 0,
        high_risk: 0,
    });

    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        loadDashboard();
    }, []);


    const loadDashboard = async () => {

        try {

            const token = localStorage.getItem("access");

            const headers = {
                Authorization: "Bearer " + token,
            };


            const statsResponse = await axios.get(
                `${API_URL}/api/dashboard/`,
                { headers }
            );

            setStats(statsResponse.data);


            const trendResponse = await axios.get(
               `${API_URL}/api/prediction-trend/`,
                { headers }
            );


            const formatted = trendResponse.data.map((item) => {

                const parts = item.date.split("-");

                return {
                    date:
                        parts.length === 3
                            ? `${parts[2]}/${parts[1]}`
                            : item.date,
                    predictions: item.count,
                };

            });


            setTrendData(formatted);

        } catch (error) {

            console.log("Dashboard error:", error);

        } finally {

            setLoading(false);

        }

    };


    const statCards = [

        {
            title: "ACTIVE PATIENTS",
            value: stats.patients,
            description: "Registered patients",
            icon: "👥",
            color: "#2dd4bf",
            link: "/patients",
        },

        {
            title: "AI PREDICTIONS",
            value: stats.predictions,
            description: "Predictions completed",
            icon: "🧠",
            color: "#60a5fa",
            link: "/prediction",
        },

        {
            title: "REPORTS GENERATED",
            value: stats.reports,
            description: "Medical reports",
            icon: "📄",
            color: "#a78bfa",
            link: "/reports",
        },

        {
            title: "HIGH-RISK CASES",
            value: stats.high_risk,
            description: "Requires attention",
            icon: "⚠️",
            color: stats.high_risk > 0 ? "#fb7185" : "#34d399",
            link: "/patients",
        },

    ];


    const services = [

        {
            icon: "🧠",
            title: "AI Disease Prediction",
            description:
                "Enter symptoms and get an AI-assisted disease prediction.",
            link: "/prediction",
            accent: "#2dd4bf",
        },

        {
            icon: "📋",
            title: "Medical Report Analysis",
            description:
                "Upload a medical report and extract useful health information.",
            link: "/blood-report",
            accent: "#60a5fa",
        },

        {
            icon: "👥",
            title: "Patient Management",
            description:
                "View, manage and update registered patients.",
            link: "/patients",
            accent: "#a78bfa",
        },

    ];


    return (

        <div
            style={{
                minHeight: "100vh",
                width: "100%",
                background:
                    "linear-gradient(135deg, #061426 0%, #081d35 55%, #062c40 100%)",
                color: "#ffffff",
                overflowX: "hidden",
            }}
        >

            <div
                style={{
                    display: "flex",
                    width: "100%",
                    minHeight: "100vh",
                }}
            >

                {/* SIDEBAR */}

                <Sidebar />


                {/* MAIN AREA */}

                <main
                    style={{
                        flex: 1,
                        minWidth: 0,
                        background:
                            "linear-gradient(135deg, #07182b 0%, #09223b 60%, #062b3d 100%)",
                    }}
                >


                    {/* TOP BAR */}

                    <header
                        style={{
                            height: "72px",
                            padding: "0 30px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderBottom:
                                "1px solid rgba(148,163,184,0.12)",
                            background:
                                "rgba(5,18,34,0.72)",
                            boxSizing: "border-box",
                        }}
                    >

                        <div>

                            <div
                                style={{
                                    fontSize: "12px",
                                    color: "#6f8da8",
                                    marginBottom: "5px",
                                }}
                            >
                                RuralCareAI / Dashboard
                            </div>

                            <h1
                                style={{
                                    margin: 0,
                                    fontSize: "21px",
                                    fontWeight: 700,
                                    color: "#f8fafc",
                                }}
                            >
                                Clinical Overview
                            </h1>

                        </div>


                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "9px",
                                padding: "9px 15px",
                                borderRadius: "24px",
                                background:
                                    "rgba(16,185,129,0.10)",
                                border:
                                    "1px solid rgba(16,185,129,0.30)",
                                color: "#34d399",
                                fontSize: "12px",
                                fontWeight: 600,
                            }}
                        >

                            <span
                                style={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    background: "#34d399",
                                    boxShadow:
                                        "0 0 10px rgba(52,211,153,0.8)",
                                }}
                            />

                            System Operational

                        </div>

                    </header>


                    {/* CONTENT */}

                    <div
                        style={{
                            width: "100%",
                            padding: "28px 30px 36px",
                            boxSizing: "border-box",
                        }}
                    >


                        {/* HERO */}

                        <section
                            style={{
                                position: "relative",
                                overflow: "hidden",
                                borderRadius: "18px",
                                padding: "30px 34px",
                                marginBottom: "22px",
                                minHeight: "135px",
                                boxSizing: "border-box",
                                background:
                                    "linear-gradient(120deg, #0b294b 0%, #075985 50%, #087f8c 100%)",
                                border:
                                    "1px solid rgba(96,165,250,0.25)",
                                boxShadow:
                                    "0 12px 35px rgba(0,0,0,0.25)",
                            }}
                        >

                            <div
                                style={{
                                    position: "absolute",
                                    width: "280px",
                                    height: "280px",
                                    borderRadius: "50%",
                                    right: "-90px",
                                    top: "-150px",
                                    background:
                                        "rgba(45,212,191,0.13)",
                                }}
                            />

                            <div
                                style={{
                                    position: "relative",
                                    zIndex: 1,
                                }}
                            >

                                <div
                                    style={{
                                        fontSize: "12px",
                                        color: "#67e8f9",
                                        fontWeight: 700,
                                        letterSpacing: "1px",
                                        textTransform: "uppercase",
                                        marginBottom: "8px",
                                    }}
                                >
                                    Healthcare Intelligence
                                </div>

                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize: "30px",
                                        fontWeight: 750,
                                        color: "#ffffff",
                                    }}
                                >
                                    AI-assisted clinical care.
                                </h2>

                                <p
                                    style={{
                                        margin: "9px 0 0",
                                        color: "#d1edf5",
                                        fontSize: "14px",
                                        lineHeight: 1.5,
                                        maxWidth: "760px",
                                    }}
                                >
                                    Monitor patients, review AI disease
                                    predictions and track clinical activity
                                    from one professional workspace.
                                </p>

                            </div>

                        </section>


                        {/* STATISTICS */}

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "repeat(4, minmax(0, 1fr))",
                                gap: "16px",
                                marginBottom: "24px",
                            }}
                        >

                            {statCards.map((card, index) => (

                                <Link
                                    key={index}
                                    to={card.link}
                                    style={{
                                        textDecoration: "none",
                                        color: "inherit",
                                    }}
                                >

                                    <div
                                        className="dashboard-stat-card"
                                        style={{
                                            minHeight: "145px",
                                            padding: "20px",
                                            borderRadius: "16px",
                                            boxSizing: "border-box",
                                            background:
                                                "rgba(11,31,52,0.94)",
                                            border:
                                                `1px solid ${card.color}33`,
                                            boxShadow:
                                                "0 8px 25px rgba(0,0,0,0.18)",
                                            transition:
                                                "all 0.2s ease",
                                        }}
                                    >

                                        <div
                                            style={{
                                                display: "flex",
                                                justifyContent:
                                                    "space-between",
                                                alignItems: "center",
                                            }}
                                        >

                                            <span
                                                style={{
                                                    fontSize: "12px",
                                                    fontWeight: 700,
                                                    letterSpacing:
                                                        "0.8px",
                                                    color: "#8eabc4",
                                                }}
                                            >
                                                {card.title}
                                            </span>


                                            <div
                                                style={{
                                                    width: "38px",
                                                    height: "38px",
                                                    borderRadius: "11px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent:
                                                        "center",
                                                    background:
                                                        `${card.color}18`,
                                                    fontSize: "19px",
                                                }}
                                            >
                                                {card.icon}
                                            </div>

                                        </div>


                                        <div
                                            style={{
                                                marginTop: "12px",
                                                fontSize: "34px",
                                                lineHeight: 1,
                                                fontWeight: 750,
                                                color: card.color,
                                            }}
                                        >
                                            {loading
                                                ? "—"
                                                : card.value}
                                        </div>


                                        <div
                                            style={{
                                                marginTop: "8px",
                                                fontSize: "12px",
                                                color: "#6686a3",
                                            }}
                                        >
                                            {card.description}
                                        </div>

                                    </div>

                                </Link>

                            ))}

                        </div>


                        {/* SERVICES */}

                        <section style={{ marginBottom: "24px" }}>

                            <div style={{ marginBottom: "13px" }}>

                                <div
                                    style={{
                                        fontSize: "11px",
                                        color: "#5eead4",
                                        fontWeight: 700,
                                        letterSpacing: "1px",
                                        textTransform: "uppercase",
                                        marginBottom: "5px",
                                    }}
                                >
                                    Quick Actions
                                </div>

                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize: "21px",
                                        fontWeight: 750,
                                        color: "#f8fafc",
                                    }}
                                >
                                    RuralCareAI Services
                                </h2>

                                <p
                                    style={{
                                        margin: "4px 0 0",
                                        fontSize: "12px",
                                        color: "#6f8da8",
                                    }}
                                >
                                    Choose an AI-assisted healthcare
                                    service to continue.
                                </p>

                            </div>


                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns:
                                        "repeat(3, minmax(0, 1fr))",
                                    gap: "16px",
                                }}
                            >

                                {services.map((service, index) => (

                                    <Link
                                        key={index}
                                        to={service.link}
                                        style={{
                                            textDecoration: "none",
                                            color: "inherit",
                                        }}
                                    >

                                        <div
                                            className="dashboard-service-card"
                                            style={{
                                                minHeight: "145px",
                                                padding: "20px",
                                                borderRadius: "16px",
                                                boxSizing:
                                                    "border-box",
                                                background:
                                                    "rgba(8,29,48,0.94)",
                                                border:
                                                    `1px solid ${service.accent}35`,
                                                boxShadow:
                                                    "0 8px 25px rgba(0,0,0,0.18)",
                                                transition:
                                                    "all 0.2s ease",
                                            }}
                                        >

                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
                                                    alignItems:
                                                        "flex-start",
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        width: "42px",
                                                        height: "42px",
                                                        borderRadius:
                                                            "12px",
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            "center",
                                                        background:
                                                            `${service.accent}18`,
                                                        fontSize: "21px",
                                                    }}
                                                >
                                                    {service.icon}
                                                </div>

                                                <span
                                                    style={{
                                                        color:
                                                            service.accent,
                                                        fontSize: "22px",
                                                    }}
                                                >
                                                    →
                                                </span>

                                            </div>


                                            <h3
                                                style={{
                                                    margin:
                                                        "14px 0 6px",
                                                    fontSize: "17px",
                                                    fontWeight: 700,
                                                    color: "#f8fafc",
                                                }}
                                            >
                                                {service.title}
                                            </h3>


                                            <p
                                                style={{
                                                    margin: 0,
                                                    fontSize: "12px",
                                                    lineHeight: 1.5,
                                                    color: "#7090aa",
                                                }}
                                            >
                                                {service.description}
                                            </p>

                                        </div>

                                    </Link>

                                ))}

                            </div>

                        </section>


                        {/* ANALYTICS */}

                        <section
                            style={{
                                background:
                                    "rgba(7,25,43,0.96)",
                                border:
                                    "1px solid rgba(96,165,250,0.16)",
                                borderRadius: "17px",
                                padding: "22px 24px 18px",
                                boxShadow:
                                    "0 10px 30px rgba(0,0,0,0.22)",
                            }}
                        >

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    alignItems: "flex-start",
                                    marginBottom: "10px",
                                }}
                            >

                                <div>

                                    <div
                                        style={{
                                            fontSize: "11px",
                                            color: "#5eead4",
                                            fontWeight: 700,
                                            letterSpacing: "1px",
                                            textTransform:
                                                "uppercase",
                                            marginBottom: "5px",
                                        }}
                                    >
                                        Clinical Analytics
                                    </div>

                                    <h2
                                        style={{
                                            margin: 0,
                                            fontSize: "22px",
                                            fontWeight: 750,
                                            color: "#f8fafc",
                                        }}
                                    >
                                        AI Prediction Trend
                                    </h2>

                                    <p
                                        style={{
                                            margin: "4px 0 0",
                                            fontSize: "12px",
                                            color: "#6f8da8",
                                        }}
                                    >
                                        Daily AI-assisted disease
                                        predictions
                                    </p>

                                </div>


                                <div
                                    style={{
                                        padding: "7px 12px",
                                        borderRadius: "8px",
                                        background:
                                            "rgba(45,212,191,0.08)",
                                        border:
                                            "1px solid rgba(45,212,191,0.22)",
                                        color: "#5eead4",
                                        fontSize: "11px",
                                        fontWeight: 700,
                                    }}
                                >
                                    ● LIVE DATA
                                </div>

                            </div>


                            <div
                                style={{
                                    width: "100%",
                                    height: "310px",
                                }}
                            >

                                {trendData.length > 0 ? (

                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >

                                        <LineChart
                                            data={trendData}
                                            margin={{
                                                top: 15,
                                                right: 15,
                                                left: 0,
                                                bottom: 10,
                                            }}
                                        >

                                            <CartesianGrid
                                                stroke="rgba(148,163,184,0.10)"
                                                strokeDasharray="3 3"
                                                vertical={false}
                                            />

                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                    fill: "#7892aa",
                                                    fontSize: 12,
                                                }}
                                            />

                                            <YAxis
                                                allowDecimals={false}
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{
                                                    fill: "#7892aa",
                                                    fontSize: 12,
                                                }}
                                            />

                                            <Tooltip
                                                contentStyle={{
                                                    background:
                                                        "#0b1f35",
                                                    border:
                                                        "1px solid rgba(45,212,191,0.30)",
                                                    borderRadius:
                                                        "10px",
                                                    color: "#ffffff",
                                                    boxShadow:
                                                        "0 8px 25px rgba(0,0,0,0.35)",
                                                }}
                                                labelStyle={{
                                                    color: "#93c5fd",
                                                    fontWeight: 600,
                                                }}
                                                itemStyle={{
                                                    color: "#5eead4",
                                                }}
                                            />

                                            <Line
                                                type="monotone"
                                                dataKey="predictions"
                                                name="AI Predictions"
                                                stroke="#2dd4bf"
                                                strokeWidth={3}
                                                dot={{
                                                    r: 4,
                                                    fill: "#07182b",
                                                    stroke: "#2dd4bf",
                                                    strokeWidth: 2,
                                                }}
                                                activeDot={{
                                                    r: 7,
                                                    fill: "#2dd4bf",
                                                    stroke: "#ffffff",
                                                    strokeWidth: 2,
                                                }}
                                            />

                                        </LineChart>

                                    </ResponsiveContainer>

                                ) : (

                                    <div
                                        style={{
                                            height: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent:
                                                "center",
                                            color: "#607e99",
                                            fontSize: "14px",
                                        }}
                                    >
                                        No prediction activity
                                        available yet.
                                    </div>

                                )}

                            </div>


                            {/* ANALYTICS FOOTER */}

                            <div
                                style={{
                                    borderTop:
                                        "1px solid rgba(255,255,255,0.06)",
                                    paddingTop: "13px",
                                    display: "flex",
                                    justifyContent:
                                        "space-between",
                                    color: "#59758e",
                                    fontSize: "11px",
                                }}
                            >

                                <span>
                                    RuralCareAI Clinical Analytics
                                </span>

                                <span>
                                    Connected to prediction service
                                </span>

                            </div>

                        </section>


                        {/* FOOTER */}

                        <div
                            style={{
                                textAlign: "center",
                                marginTop: "18px",
                                color: "#45627c",
                                fontSize: "11px",
                            }}
                        >
                            © 2026 RuralCareAI · AI-Assisted Healthcare
                            System
                        </div>

                    </div>

                </main>

            </div>


            {/* HOVER EFFECTS */}

            <style>
                {`
                    .dashboard-stat-card:hover,
                    .dashboard-service-card:hover {
                        transform: translateY(-4px);
                        box-shadow:
                            0 14px 35px rgba(0,0,0,0.30) !important;
                        border-color:
                            rgba(45,212,191,0.45) !important;
                    }

                    @media (max-width: 1100px) {
                        .dashboard-stat-card {
                            min-height: 135px !important;
                        }
                    }

                    @media (max-width: 850px) {
                        main {
                            width: 100%;
                        }
                    }

                    @media (max-width: 700px) {
                        .dashboard-stat-card,
                        .dashboard-service-card {
                            min-height: 120px !important;
                        }
                    }
                `}
            </style>

        </div>

    );
}


export default Dashboard;