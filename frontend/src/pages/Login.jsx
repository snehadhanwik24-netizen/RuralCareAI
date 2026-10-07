import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../config";

function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            const response = await axios.post(
                `${API_URL}/api/token/`,
                {
                    username: username,
                    password: password,
                }
            );

            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);
            window.location.href = "/dashboard";
            alert("Login Successful!");

            // Redirect to Dashboard
          //  navigate("/dashboard");

        } catch (error) {
    console.log("Full Error:", error);

    if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", error.response.data);
        alert(JSON.stringify(error.response.data));
    } else {
        console.log("Message:", error.message);
        alert(error.message);
    }
}
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-4">
                    <div className="card shadow p-4">

                        <h2 className="text-center text-primary">
                            RuralCareAI
                        </h2>

                        <h5 className="text-center mb-4">
                            Login
                        </h5>

                        <input
                            type="text"
                            className="form-control mb-3"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />

                        <input
                            type="password"
                            className="form-control mb-3"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <button
                            className="btn btn-primary w-100"
                            onClick={handleLogin}
                        >
                            Login
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;