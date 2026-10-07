import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import Sidebar from "../components/Sidebar";

function Reports() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await axios.get(
                `${API_URL}/api/medical-reports/`,
                {
                    headers: {
                        Authorization:
                            "Bearer " + localStorage.getItem("access"),
                    },
                }
            );

            setReports(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="d-flex">

            <Sidebar />

            <div className="container-fluid p-4">

                <h2 className="text-primary">
                    Reports
                </h2>

                <hr />

                <div className="card shadow p-4">

                    <h4>Generated Medical Reports</h4>

                    {loading ? (
                        <p>Loading reports...</p>
                    ) : (
                        <table className="table table-bordered table-hover">

                            <thead className="table-primary">
                                <tr>
                                    <th>ID</th>
                                    <th>Patient</th>
                                    <th>Report</th>
                                    <th>Report Type</th>
                                    <th>Date</th>
                                </tr>
                            </thead>

                            <tbody>

                                {reports.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            className="text-center"
                                        >
                                            No Reports Yet
                                        </td>
                                    </tr>
                                ) : (
                                    reports.map((report) => (
                                        <tr key={report.id}>

                                            <td>
                                                {report.id}
                                            </td>

                                            <td>
                                                {report.patient_name}
                                            </td>

                                            <td>
                                                {report.report_name}
                                            </td>

                                            <td>
                                                {report.report_type}
                                            </td>

                                            <td>
                                                {new Date(
                                                    report.created_at
                                                ).toLocaleString()}
                                            </td>

                                        </tr>
                                    ))
                                )}

                            </tbody>

                        </table>
                    )}

                </div>

            </div>

        </div>
    );
}

export default Reports;