import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PredictionHistory from "./pages/PredictionHistory";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddPatient from "./pages/AddPatient";
import PatientList from "./pages/PatientList";
import Prediction from "./pages/Prediction";
import Reports from "./pages/Reports";
import EditPatient from "./pages/EditPatient";
import BloodReportAnalysis from "./pages/BloodReportAnalysis";

function App() {
    const isLoggedIn = !!localStorage.getItem("access");

    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Login />} />

                <Route
                    path="/dashboard"
                    element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />}
                />

                <Route
                    path="/add-patient"
                    element={isLoggedIn ? <AddPatient /> : <Navigate to="/" />}
                />

                <Route
                    path="/patients"
                    element={isLoggedIn ? <PatientList /> : <Navigate to="/" />}
                />

                <Route
                    path="/prediction"
                    element={isLoggedIn ? <Prediction /> : <Navigate to="/" />}
                />

                <Route
    path="/reports"
    element={isLoggedIn ? <Reports /> : <Navigate to="/" />}
/>

<Route
    path="/blood-report"
    element={
        isLoggedIn ? (
            <BloodReportAnalysis />
        ) : (
            <Navigate to="/" />
        )
    }
/>


                <Route
                    path="/edit-patient/:id"
                    element={isLoggedIn ? <EditPatient /> : <Navigate to="/" />}
                />
                <Route
                    path="/prediction-history"
                    element={isLoggedIn ? <PredictionHistory /> : <Navigate to="/" />}
/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;