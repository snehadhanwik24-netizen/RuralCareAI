import React, { useEffect, useState } from "react";
import { API_URL } from "../config";

function BloodReportAnalysis() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [language, setLanguage] = useState("en");
    const [patients, setPatients] = useState([]);
const [selectedPatient, setSelectedPatient] = useState("");

useEffect(() => {
    fetchPatients();
}, []);

const fetchPatients = async () => {
    try {
        const response = await fetch(
            `${API_URL}/api/patients/`,
            {
                headers: {
                    Authorization:
                        "Bearer " + localStorage.getItem("access"),
                },
            }
        );

        if (!response.ok) {
            throw new Error("Unable to load patients.");
        }

        const data = await response.json();
        setPatients(data);
    } catch (error) {
        console.error(error);
    }
};
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];

        if (!selectedFile) {
            return;
        }

        setFile(selectedFile);
        setResult(null);
        setError("");
    };

    const analyzeReport = async () => {
        if (!file) {
            setError("Please select a medical report first.");
            return;
        }
        if (!selectedPatient) {
    setError("Please select a patient first.");
    return;
}

        setLoading(true);
        setError("");
        setResult(null);

        try {
            const formData = new FormData();
formData.append("report", file);
formData.append("language", language);
formData.append("patient_id", selectedPatient);

            const response = await fetch(
                `${API_URL}/api/analyze-report/`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Unable to analyze report.");
            }

            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#061a2d",
                color: "#ffffff",
                padding: "30px",
            }}
        >
            <div
                style={{
                    maxWidth: "1100px",
                    margin: "0 auto",
                }}
            >
                {/* Header */}
                <div style={{ marginBottom: "25px" }}>
                    <div
                        style={{
                            fontSize: "12px",
                            color: "#25d9c8",
                            letterSpacing: "1px",
                            fontWeight: "600",
                        }}
                    >
                        CLINICAL ANALYSIS
                    </div>

                    <h1
                        style={{
                            fontSize: "30px",
                            margin: "5px 0",
                        }}
                    >
                       Medical Report Analysis
                    </h1>

                    <p
                        style={{
                            color: "#91a7bd",
                            margin: 0,
                        }}
                    >
                        Upload a medical report and get an easy-to-understand
summary of the information found in it.
                    </p>
                </div>

                {/* Upload Card */}
                <div
                    style={{
                        background: "#0a243b",
                        border: "1px solid #173b58",
                        borderRadius: "14px",
                        padding: "28px",
                        marginBottom: "20px",
                    }}
                >
                    <h3 style={{ marginTop: 0 }}>
    Upload Medical Report
</h3>

<p style={{ color: "#91a7bd" }}>
    Supports PDF, JPG, JPEG and PNG
</p>

                    <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        style={{
                            width: "100%",
                            padding: "15px",
                            background: "#071c30",
                            color: "#ffffff",
                            border: "1px dashed #26749c",
                            borderRadius: "10px",
                            marginBottom: "20px",
                        }}
                    />

                    {file && (
                        <div
                            style={{
                                color: "#25d9c8",
                                marginBottom: "15px",
                            }}
                        >
                            Selected: {file.name}
                        </div>
                    )}
                    <div style={{ marginBottom: "20px" }}>

    <label
        style={{
            display: "block",
            marginBottom: "8px",
            color: "#c5d5e3",
            fontWeight: "600",
        }}
    >
        🌐 Preferred Explanation Language
    </label>

    <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={{
            width: "100%",
            padding: "12px",
            background: "#071c30",
            color: "#ffffff",
            border: "1px solid #26749c",
            borderRadius: "8px",
        }}
    >
        <option value="en">🇬🇧 English</option>
        <option value="te">🇮🇳 Telugu</option>
        <option value="hi">🇮🇳 Hindi</option>
        <option value="kn">🇮🇳 Kannada</option>
        <option value="ta">🇮🇳 Tamil</option>
    </select>

</div>
<div style={{ marginBottom: "20px" }}>
    <label
        style={{
            display: "block",
            marginBottom: "8px",
            color: "#c5d5e3",
            fontWeight: "600",
        }}
    >
        👤 Select Patient
    </label>

    <select
        value={selectedPatient}
        onChange={(e) => setSelectedPatient(e.target.value)}
        style={{
            width: "100%",
            padding: "12px",
            background: "#071c30",
            color: "#ffffff",
            border: "1px solid #26749c",
            borderRadius: "8px",
        }}
    >
        <option value="">Select Patient</option>

        {patients.map((patient) => (
            <option key={patient.id} value={patient.id}>
                {patient.name} — ID: {patient.id}
            </option>
        ))}
    </select>
</div>
                    <button
                        onClick={analyzeReport}
                        disabled={loading}
                        style={{
                            background:
                                "linear-gradient(90deg, #0878e8, #12a8d8)",
                            border: "none",
                            color: "white",
                            padding: "13px 25px",
                            borderRadius: "8px",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontWeight: "600",
                        }}
                    >
                        {loading ? "Analyzing..." : "Analyze Report"}
                    </button>

                    {error && (
                        <div
                            style={{
                                marginTop: "20px",
                                padding: "12px",
                                background: "#3a1720",
                                border: "1px solid #8d3045",
                                borderRadius: "8px",
                                color: "#ff9aaa",
                            }}
                        >
                            {error}
                        </div>
                    )}
                </div>

                {/* Results */}
                {result && (
                    <div
                        style={{
                            background: "#0a243b",
                            border: "1px solid #173b58",
                            borderRadius: "14px",
                            padding: "28px",
                        }}
                    >
                        <h2 style={{ marginTop: 0 }}>
                            Analysis Result
                        </h2>

                        <div
                            style={{
                                padding: "18px",
                                background: "#071c30",
                                borderRadius: "10px",
                                marginBottom: "20px",
                            }}
                        >
                            <div style={{ color: "#91a7bd", fontSize: "13px" }}>
                                Report Type
                            </div>

                            <div
                                style={{
                                    fontSize: "20px",
                                    color: "#ffffff",
                                    marginTop: "6px",
                                    fontWeight: "600",
                                }}
                            >
                                {result.report_type || "Medical Report"}
                            </div>

                            <div
                                style={{
                                    marginTop: "16px",
                                    color: "#91a7bd",
                                    fontSize: "13px",
                                }}
                            >
                                Overall Status
                            </div>

                            <div
                                style={{
                                    fontSize: "20px",
                                    color: "#25d9c8",
                                    marginTop: "5px",
                                }}
                            >
                                {result.overall_status || "Analysis completed"}
                            </div>
                        </div>

                        {result.values && result.values.length > 0 && (
                            <div>
                                <h3>Detected Medical Values</h3>

                                <div
                                    style={{
                                        overflowX: "auto",
                                    }}
                                >
                                    <table
                                        style={{
                                            width: "100%",
                                            borderCollapse: "collapse",
                                        }}
                                    >
                                        <thead>
                                            <tr>
                                                <th style={cellStyle}>Test</th>
                                                <th style={cellStyle}>Value</th>
                                                <th style={cellStyle}>Reference Range</th>
                                                <th style={cellStyle}>Status</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {result.values.map((item, index) => (
                                                <tr key={index}>
                                                    <td style={cellStyle}>
                                                        {item.parameter || item.test || "Not available"}
                                                    </td>

                                                    <td style={cellStyle}>
                                                        {item.value ?? "Not available"}{" "}
                                                        {item.unit || ""}
                                                    </td>

                                                    <td style={cellStyle}>
                                                        {item.reference_range || "Not provided"}
                                                    </td>

                                                    <td
                                                        style={{
                                                            ...cellStyle,
                                                            color:
                                                                item.status === "Normal"
                                                                    ? "#25d9c8"
                                                                    : item.status === "Not determined"
                                                                    ? "#91a7bd"
                                                                    : "#ffb347",
                                                            fontWeight: "600",
                                                        }}
                                                    >
                                                        {item.status || "Not determined"}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {result.easy_explanations &&
                            result.easy_explanations.length > 0 && (
                                <div style={{ marginTop: "25px" }}>
                                    <h3>Easy Explanation</h3>

                                    {result.easy_explanations.map((item, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                marginBottom: "12px",
                                                padding: "14px",
                                                background: "#071c30",
                                                borderRadius: "8px",
                                                color: "#b8c9d8",
                                                lineHeight: "1.7",
                                            }}
                                        >
                                            {typeof item === "string"
    ? item
    : item.text || item.easy_explanation || item.explanation || ""}
                                        </div>
                                    ))}
                                </div>
                            )}

                        {result.sections &&
                            Object.entries(result.sections).some(
                                ([, value]) => value && String(value).trim()
                            ) && (
                                <div style={{ marginTop: "25px" }}>
                                    <h3>Important Report Details</h3>

                                    {Object.entries(result.sections).map(
                                        ([title, value]) =>
                                            value &&
                                            String(value).trim() && (
                                                <div
                                                    key={title}
                                                    style={{
                                                        marginBottom: "15px",
                                                        padding: "14px",
                                                        background: "#071c30",
                                                        borderRadius: "8px",
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            color: "#25d9c8",
                                                            fontWeight: "600",
                                                            marginBottom: "6px",
                                                        }}
                                                    >
                                                        {title}
                                                    </div>

                                                    <div
                                                        style={{
                                                            color: "#b8c9d8",
                                                            lineHeight: "1.7",
                                                        }}
                                                    >
                                                        {value}
                                                    </div>
                                                </div>
                                            )
                                    )}
                                </div>
                            )}

                        {result.summary && (
                            <div style={{ marginTop: "25px" }}>
                                <h3>Summary</h3>

                                <p
                                    style={{
                                        color: "#b8c9d8",
                                        lineHeight: "1.7",
                                    }}
                                >
                                    {result.summary}
                                </p>
                            </div>
                        )}

                        <div
                            style={{
                                marginTop: "25px",
                                padding: "15px",
                                background: "#2d2414",
                                border: "1px solid #665020",
                                borderRadius: "8px",
                                color: "#e6c978",
                                fontSize: "13px",
                            }}
                        >
                            ⚠ This analysis is for informational purposes only
                            and should not replace evaluation by a qualified
                            healthcare professional.
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const cellStyle = {
    borderBottom: "1px solid #173b58",
    padding: "14px",
    textAlign: "left",
    color: "#c5d5e3",
};

export default BloodReportAnalysis;
