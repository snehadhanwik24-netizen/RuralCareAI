import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Tooltip,
    Legend
);

function DashboardCharts({ stats }) {

    const barData = {
        labels: [
            "Patients",
            "Predictions",
            "Reports",
            "High Risk",
        ],
        datasets: [
            {
                label: "Hospital Statistics",
                data: [
                    stats.patients,
                    stats.predictions,
                    stats.reports,
                    stats.high_risk,
                ],
                backgroundColor: [
                    "#0d6efd",
                    "#198754",
                    "#ffc107",
                    "#dc3545",
                ],
            },
        ],
    };

    const pieData = {
        labels: [
            "Patients",
            "Predictions",
            "Reports",
            "High Risk",
        ],
        datasets: [
            {
                data: [
                    stats.patients,
                    stats.predictions,
                    stats.reports,
                    stats.high_risk,
                ],
                backgroundColor: [
                    "#0d6efd",
                    "#198754",
                    "#ffc107",
                    "#dc3545",
                ],
            },
        ],
    };

   return (

    <div className="row mt-4">

        <div className="col-lg-8">

            <div className="card shadow p-4">

                <h4 className="mb-4">
                    📊 Hospital Analytics
                </h4>

                <div style={{ height: "400px" }}>
                    <Bar
                        data={barData}
                        options={{
                            maintainAspectRatio: false,
                            responsive: true,
                        }}
                    />
                </div>

            </div>

        </div>

        <div className="col-lg-4">

            <div className="card shadow p-4">

                <h4 className="mb-4">
                    🥧 Statistics
                </h4>

                <div style={{ height: "400px" }}>
                    <Pie
                        data={pieData}
                        options={{
                            maintainAspectRatio: false,
                            responsive: true,
                        }}
                    />
                </div>

            </div>

        </div>

    </div>

);
}

export default DashboardCharts;