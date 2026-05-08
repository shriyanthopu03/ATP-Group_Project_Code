import { useState } from "react";
import RoleSelection from "./components/RoleSelection";
import DoctorRegistration from "./components/DoctorRegistration";
import PatientRegistration from "./components/PatientRegistration";
import AdminRegistration from "./components/AdminRegistration";
import Login from "./components/Login";

export default function App() {
  const [currentStep, setCurrentStep] = useState("roleSelection");
  const [registrationSuccess, setRegistrationSuccess] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(null);

  const handleSelectRole = (role) => {
    setCurrentStep(role.toLowerCase());
  };

  const handleLogin = () => {
    setCurrentStep("login");
  };

  const handleBack = () => {
    setCurrentStep("roleSelection");
    setRegistrationSuccess(null);
    setLoginSuccess(null);
  };

  const handleSuccess = (response) => {
    setRegistrationSuccess(response);
    setTimeout(() => {
      setCurrentStep("success");
    }, 500);
  };

  const handleLoginSuccess = (response) => {
    setLoginSuccess(response);
    console.log("Login successful:", response);
    setTimeout(() => {
      setCurrentStep("home");
    }, 500);
  };

  const handleLogout = () => {
    setLoginSuccess(null);
    setCurrentStep("roleSelection");
  };

  if (registrationSuccess) {
    return (
      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <h1>Registration Successful!</h1>
        <p>Your account has been created successfully.</p>
        <p>You will be redirected to login shortly...</p>
        <button onClick={handleBack} style={{ padding: "10px", fontSize: "16px" }}>
          Back to Home
        </button>
      </div>
    );
  }

  if (loginSuccess && currentStep === "home") {
    return (
      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <h1>Welcome, {loginSuccess.payload?.firstName || loginSuccess.payload?.email}!</h1>
        <div style={{ marginBottom: "20px", padding: "10px", backgroundColor: "#f0f0f0", borderRadius: "8px" }}>
          <p><strong>Role:</strong> {loginSuccess.payload?.role}</p>
          <p><strong>Email:</strong> {loginSuccess.payload?.email}</p>
          {loginSuccess.payload?.firstName && (
            <p><strong>Name:</strong> {loginSuccess.payload?.firstName} {loginSuccess.payload?.lastName || ""}</p>
          )}
        </div>
        <button 
          onClick={handleLogout} 
          style={{ 
            padding: "10px 20px", 
            fontSize: "16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <>
      {currentStep === "roleSelection" && (
        <RoleSelection onSelectRole={handleSelectRole} onLogin={handleLogin} />
      )}

      {currentStep === "doctor" && (
        <DoctorRegistration onBack={handleBack} onSuccess={handleSuccess} />
      )}

      {currentStep === "patient" && (
        <PatientRegistration onBack={handleBack} onSuccess={handleSuccess} />
      )}

      {currentStep === "admin" && (
        <AdminRegistration onBack={handleBack} />
      )}

      {currentStep === "login" && (
        <Login onBack={handleBack} onSuccess={handleLoginSuccess} />
      )}
    </>
  );
}
