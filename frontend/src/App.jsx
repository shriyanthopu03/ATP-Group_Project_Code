import { useEffect } from "react";
import axios from "axios";
import { createBrowserRouter, Navigate, Outlet, RouterProvider, useNavigate } from "react-router";
import { create } from "zustand";
import { io } from "socket.io-client";
import RoleSelection from "./components/RoleSelection";
import DoctorRegistration from "./components/DoctorRegistration";
import PatientRegistration from "./components/PatientRegistration";
import AdminRegistration from "./components/AdminRegistration";
import Login from "./components/Login";
import HospitalDashboard from "./components/HospitalDashboard";
import { config } from "dotenv";
config()
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000/api";
const SOCKET_URL = process.env.SOCKET_URL || "http://localhost:5000";

const useAppStore = create((set) => ({
  selectedRole: "PATIENT",
  activeUser: null,
  setSelectedRole: (role) => set({ selectedRole: role }),
  setActiveUser: (user) => set({ activeUser: user }),
  clearActiveUser: () => set({ activeUser: null }),
}));

function AppLayout() {
  useEffect(() => {
    axios.get(`${BACKEND_URL}/status`, { withCredentials: true }).catch(() => {
      // The app can still run in local mock mode if backend is unavailable.
    });
  }, []);

  return (
    <div className="light-theme min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  );
}

function RoleSelectionPage() {
  const navigate = useNavigate();
  const setSelectedRole = useAppStore((state) => state.setSelectedRole);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    navigate(`/${role.toLowerCase()}`);
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return <RoleSelection onSelectRole={handleSelectRole} onLogin={handleLogin} />;
}

function DoctorRegistrationPage() {
  const navigate = useNavigate();
  const clearActiveUser = useAppStore((state) => state.clearActiveUser);
  const setActiveUser = useAppStore((state) => state.setActiveUser);

  const handleBack = () => {
    clearActiveUser();
    navigate("/");
  };

  const handleSuccess = (response) => {
    setActiveUser({ ...response.payload, role: "DOCTOR" });
    navigate("/dashboard");
  };

  return <DoctorRegistration onBack={handleBack} onSuccess={handleSuccess} />;
}

function PatientRegistrationPage() {
  const navigate = useNavigate();
  const clearActiveUser = useAppStore((state) => state.clearActiveUser);
  const setActiveUser = useAppStore((state) => state.setActiveUser);

  const handleBack = () => {
    clearActiveUser();
    navigate("/");
  };

  const handleSuccess = (response) => {
    setActiveUser({ ...response.payload, role: "PATIENT" });
    navigate("/dashboard");
  };

  return <PatientRegistration onBack={handleBack} onSuccess={handleSuccess} />;
}

function AdminRegistrationPage() {
  const navigate = useNavigate();
  const clearActiveUser = useAppStore((state) => state.clearActiveUser);
  const setActiveUser = useAppStore((state) => state.setActiveUser);

  const handleBack = () => {
    clearActiveUser();
    navigate("/");
  };

  const handleSuccess = (response) => {
    setActiveUser({ ...response.payload, role: "ADMIN" });
    navigate("/dashboard");
  };

  return <AdminRegistration onBack={handleBack} onSuccess={handleSuccess} />;
}

function LoginPage() {
  const navigate = useNavigate();
  const selectedRole = useAppStore((state) => state.selectedRole);
  const clearActiveUser = useAppStore((state) => state.clearActiveUser);
  const setActiveUser = useAppStore((state) => state.setActiveUser);

  const handleLoginSuccess = (response) => {
    setActiveUser({ ...response.payload, role: response.role || selectedRole || response.payload?.role || "PATIENT" });
    navigate("/dashboard");
  };

  const handleBack = () => {
    clearActiveUser();
    navigate("/");
  };

  return <Login onBack={handleBack} onSuccess={handleLoginSuccess} defaultRole={selectedRole} />;
}

function DashboardPage() {
  const navigate = useNavigate();
  const activeUser = useAppStore((state) => state.activeUser);
  const clearActiveUser = useAppStore((state) => state.clearActiveUser);

  const handleLogout = () => {
    clearActiveUser();
    navigate("/");
  };

  if (!activeUser) {
    return <Navigate to="/login" replace />;
  }

  return <HospitalDashboard user={activeUser} onLogout={handleLogout} />;
}

const routerObj = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <RoleSelectionPage />,
      },
      {
        path: "doctor",
        element: <DoctorRegistrationPage />,
      },
      {
        path: "patient",
        element: <PatientRegistrationPage />,
      },
      {
        path: "admin",
        element: <AdminRegistrationPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={routerObj} />;
}

export default App;
