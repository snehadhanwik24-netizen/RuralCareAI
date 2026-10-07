import { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import Sidebar from "../components/Sidebar";

function AddPatient() {
    const [patient, setPatient] = useState({
        name: "",
        age: "",
        gender: "",
        phone: "",
        address: "",
    });

    const handleChange = (e) => {
        setPatient({
            ...patient,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await axios.post(
                `${API_URL}/api/patients/`,
                patient,
                {
                    headers: {
                        Authorization:
                            "Bearer " + localStorage.getItem("access"),
                    },
                }
            );

            alert("Patient Added Successfully!");

            setPatient({
                name: "",
                age: "",
                gender: "",
                phone: "",
                address: "",
            });

        } catch (error) {
            console.error(error);
            alert("Failed to Add Patient");
        }
    };

    return (
        <div className="d-flex">
            <Sidebar />

            <div className="container-fluid p-4">
                <h2 className="text-primary">Add Patient</h2>

                <hr />

                <div className="card shadow p-4">
                    <form onSubmit={handleSubmit}>

                        <div className="mb-3">
                            <label>Name</label>
                            <input
                                type="text"
                                name="name"
                                className="form-control"
                                value={patient.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label>Age</label>
                            <input
                                type="number"
                                name="age"
                                className="form-control"
                                value={patient.age}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label>Gender</label>
                            <select
                                name="gender"
                                className="form-control"
                                value={patient.gender}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label>Phone</label>
                            <input
                                type="text"
                                name="phone"
                                className="form-control"
                                value={patient.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label>Address</label>
                            <textarea
                                name="address"
                                className="form-control"
                                value={patient.address}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary">
                            Save Patient
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddPatient;