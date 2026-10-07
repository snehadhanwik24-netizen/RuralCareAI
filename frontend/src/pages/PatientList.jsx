import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import Sidebar from "../components/Sidebar";

function PatientList() {
    const [patients, setPatients] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPatients();
    }, []);

    const fetchPatients = async () => {
        try {
            const response = await axios.get(
               `${API_URL}/api/patients/`,
                {
                    headers: {
                        Authorization:
                            "Bearer " + localStorage.getItem("access"),
                    },
                }
            );

            setPatients(response.data);

        } catch (error) {
            console.log(error);
        }
    };

    const deletePatient = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this patient?"
        );

        if (!confirmDelete) return;

        try {

            await axios.delete(
                `${API_URL}/api/patients/${id}/`,
                {
                    headers: {
                        Authorization:
                            "Bearer " + localStorage.getItem("access"),
                    },
                }
            );

            alert("Patient Deleted Successfully!");
            fetchPatients();

        } catch (error) {
            console.log(error);
            alert("Unable to delete patient.");
        }
    };

    return (
        <div className="d-flex">

            <Sidebar />

            <div className="container-fluid p-4">

                <h2 className="text-primary">
                    Patient List
                </h2>

                <hr />

                <div className="card shadow p-4">

                    <table className="table table-bordered table-hover">

                        <thead className="table-primary">
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Age</th>
                                <th>Gender</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody>

                            {patients.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center">
                                        No Patients Found
                                    </td>
                                </tr>
                            ) : (
                                patients.map((patient) => (
                                    <tr key={patient.id}>
                                        <td>{patient.id}</td>
                                        <td>{patient.name}</td>
                                        <td>{patient.age}</td>
                                        <td>{patient.gender}</td>
                                        <td>{patient.phone}</td>
                                        <td>{patient.address}</td>

                                        <td>

                                            <button
                                                className="btn btn-warning btn-sm me-2"
                                                onClick={() =>
                                                    navigate(`/edit-patient/${patient.id}`)
                                                }
                                            >
                                                ✏ Edit
                                            </button>

                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() =>
                                                    deletePatient(patient.id)
                                                }
                                            >
                                                🗑 Delete
                                            </button>

                                        </td>

                                    </tr>
                                ))
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}

export default PatientList;