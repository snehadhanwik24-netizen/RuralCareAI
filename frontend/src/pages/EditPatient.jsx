import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";
import Sidebar from "../components/Sidebar";

function EditPatient() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [patient, setPatient] = useState({
        name: "",
        age: "",
        gender: "",
        phone: "",
        address: "",
    });

    useEffect(() => {
        fetchPatient();
    }, []);

    const fetchPatient = async () => {
        try {

            const response = await axios.get(
               `${API_URL}/api/patients/${id}/`,
                {
                    headers: {
                        Authorization:
                            "Bearer " + localStorage.getItem("access"),
                    },
                }
            );

            setPatient(response.data);

        } catch (error) {
            console.log(error);
        }
    };

    const handleChange = (e) => {
        setPatient({
            ...patient,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            await axios.put(
                `${API_URL}/api/patients/${id}/`,
                patient,
                {
                    headers: {
                        Authorization:
                            "Bearer " + localStorage.getItem("access"),
                    },
                }
            );

            alert("Patient Updated Successfully!");

            navigate("/patients");

        } catch (error) {
            console.log(error);
            alert("Unable to update patient.");
        }
    };

    return (
        <div className="d-flex">

            <Sidebar />

            <div className="container-fluid p-4">

                <h2 className="text-primary">
                    Edit Patient
                </h2>

                <hr />

                <div className="card shadow p-4">

                    <form onSubmit={handleSubmit}>

                        <div className="mb-3">
                            <label>Name</label>
                            <input
                                className="form-control"
                                name="name"
                                value={patient.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Age</label>
                            <input
                                className="form-control"
                                name="age"
                                value={patient.age}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Gender</label>
                            <input
                                className="form-control"
                                name="gender"
                                value={patient.gender}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Phone</label>
                            <input
                                className="form-control"
                                name="phone"
                                value={patient.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="mb-3">
                            <label>Address</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                name="address"
                                value={patient.address}
                                onChange={handleChange}
                            />
                        </div>

                        <button className="btn btn-success">
                            Update Patient
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default EditPatient;