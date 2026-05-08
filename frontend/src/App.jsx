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

  const handleBack = () => {
    setCurrentStep("roleSelection");
    setRegistrationSuccess(null);
  };

  const handleSuccess = (response) => {
    setRegistrationSuccess(response);
    setTimeout(() => {
      setCurrentStep("success");
    }, 500);
  };

  if (registrationSuccess) {
    return (
      <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <h1>Registration Successful!</h1>
        <p>Your account has been created successfully.</p>
        <p>You will be redirected to login shortly...</p>
        <button onClick={handleBack} style={{ padding: "10px", fontSize: "16px" }}>
          Back to Registration
        </button>
      </div>
    );
  }

  return (
    <>
      {currentStep === "roleSelection" && (
        <RoleSelection onSelectRole={handleSelectRole} />
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
    </>
  );
}
