import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import Sidebar from "../components/Sidebar";

function PredictionHistory() {

    const [predictions, setPredictions] = useState([]);

    useEffect(() => {
        fetchPredictions();
    }, []);

    const fetchPredictions = async () => {

        try {

            const response = await axios.get(
               `${API_URL}/api/predictions/`,
                {
                    headers: {
                        Authorization:
                            "Bearer " + localStorage.getItem("access"),
                    },
                }
            );

            setPredictions(response.data);

        } catch (error) {
            console.log(error);
        }

    };

    return (
        <div className="d-flex">

            <Sidebar />

            <div className="container-fluid p-4">

                <h2 className="text-primary">
                    📜 Prediction History
                </h2>

                <hr />

                <div className="card shadow p-4">

                    <table className="table table-bordered table-hover">

                        <thead className="table-primary">

                            <tr>
                                <th>Patient</th>
                                <th>Disease</th>
                                <th>Confidence</th>
                                <th>Doctor</th>
                                <th>Risk</th>
                                <th>Date</th>
                            </tr>

                        </thead>

                        <tbody>

                            {predictions.map((item) => (

                                <tr key={item.id}>

                                    <td>{item.patient_name}</td>

                                    <td>{item.disease}</td>

                                    <td>{item.confidence}</td>

                                    <td>{item.doctor}</td>

                                    <td>
                                        <span className="badge bg-warning text-dark">
                                            {item.risk}
                                        </span>
                                    </td>

                                    <td>
                                        {new Date(item.created_at).toLocaleString()}
                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}

export default PredictionHistory;