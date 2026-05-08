import { useState } from "react";
import RoleSelection from "./components/RoleSelection";
import DoctorRegistration from "./components/DoctorRegistration";
import PatientRegistration from "./components/PatientRegistration";
import AdminRegistration from "./components/AdminRegistration";
import Login from "./components/Login";
import HospitalDashboard from "./components/HospitalDashboard";

export default function App() {
  const [currentStep, setCurrentStep] = useState("roleSelection");
  const [selectedRole, setSelectedRole] = useState("PATIENT");
  const [activeUser, setActiveUser] = useState(null);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setCurrentStep(role.toLowerCase());
  };

  const handleLogin = () => {
    setCurrentStep("login");
  };

  const handleBack = () => {
    setCurrentStep("roleSelection");
    setActiveUser(null);
  };

  const handleSuccess = (response) => {
    setActiveUser(response.payload);
    setCurrentStep("dashboard");
  };

  const handleLoginSuccess = (response) => {
    setActiveUser(response.payload);
    setCurrentStep("dashboard");
  };

  const handleLogout = () => {
    setActiveUser(null);
    setCurrentStep("roleSelection");
  };

  return (
    <div className="light-theme min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
        {currentStep === "dashboard" && activeUser && (
          <HospitalDashboard user={activeUser} onLogout={handleLogout} />
        )}

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
          <AdminRegistration onBack={handleBack} onSuccess={handleSuccess} />
        )}

        {currentStep === "login" && (
          <Login onBack={handleBack} onSuccess={handleLoginSuccess} defaultRole={selectedRole} />
        )}
      </div>
    </div>
  );
}
