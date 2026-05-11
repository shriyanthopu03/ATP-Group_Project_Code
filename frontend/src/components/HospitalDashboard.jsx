import React, { useMemo, useState } from "react";
import AdminDashboard from "./AdminDashboard";
import DoctorDashboard from "./DoctorDashboard";
import PatientDashboard from "./PatientDashboard";
import DashboardHeader from "./DashboardHeader";
import UpcomingAppointments from "./UpcomingAppointments";
import NavigationTabs from "./NavigationTabs";
import { loadHospitalState } from "../utils/hospitalState";

const HospitalDashboard = ({ user, onLogout }) => {
  const userRole = String(user?.role || "PATIENT").toUpperCase();
  const [state, setState] = useState(() => loadHospitalState());
  const [activeTab, setActiveTab] = useState(userRole === "ADMIN" ? "overview" : userRole === "DOCTOR" ? "schedule" : "book");

  const refreshState = () => {
    const newState = loadHospitalState();
    setState({ ...newState });
  };

  const currentUser = useMemo(() => {
    if (userRole === "PATIENT") {
      return state.patients.find((entry) => String(entry.id) === String(user.id)) || user;
    }
    if (userRole === "DOCTOR") {
      return state.doctors.find((entry) => String(entry.id) === String(user.id)) || user;
    }
    return user;
  }, [state, user, userRole]);

  const myAppointments = useMemo(() => {
    const userId = String(currentUser?.id || user?.id);
    if (userRole === "PATIENT") {
      return state.appointments.filter((entry) => String(entry.patientId) === userId);
    }
    if (userRole === "DOCTOR") {
      return state.appointments.filter((entry) => String(entry.doctorId) === userId);
    }
    return state.appointments;
  }, [state.appointments, user, currentUser, userRole]);

  const upcomingAppointments = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return [...myAppointments]
      .filter((entry) => entry.appointmentDate >= today)
      .sort((left, right) => {
        const leftDate = new Date(`${left.appointmentDate}T${left.appointmentTime || "00:00"}`);
        const rightDate = new Date(`${right.appointmentDate}T${right.appointmentTime || "00:00"}`);
        return leftDate - rightDate;
      })
      .slice(0, 4);
  }, [myAppointments]);

  const tabs =
    userRole === "ADMIN"
      ? ["overview", "patients", "doctors", "appointments", "search"]
      : userRole === "DOCTOR"
        ? ["schedule", "records", "search", "profile"]
        : ["book", "records", "profile"];

  return (
    <div className="min-h-screen bg-transparent text-slate-800 selection:bg-blue-500/10">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-blue-400/10 blur-[150px]" />
        <div className="absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-indigo-400/10 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <DashboardHeader 
          userRole={userRole} 
          currentUser={currentUser} 
          onLogout={onLogout} 
        />

        <UpcomingAppointments 
          upcomingAppointments={upcomingAppointments} 
          userRole={userRole} 
          setActiveTab={setActiveTab} 
          state={state} 
        />

        <NavigationTabs 
          tabs={tabs} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        {userRole === "ADMIN" && (
          <AdminDashboard activeTab={activeTab} state={state} setActiveTab={setActiveTab} refreshState={refreshState} />
        )}

        {userRole === "DOCTOR" && (
          <DoctorDashboard activeTab={activeTab} state={state} setActiveTab={setActiveTab} currentUser={currentUser} refreshState={refreshState} />
        )}

        {userRole === "PATIENT" && (
          <PatientDashboard activeTab={activeTab} state={state} user={user} currentUser={currentUser} refreshState={refreshState} />
        )}
      </div>
    </div>
  );
};

export default HospitalDashboard;
