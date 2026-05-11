import React, { useMemo, useState } from "react";
import AdminDashboard from "./AdminDashboard";
import DoctorDashboard from "./DoctorDashboard";
import PatientDashboard from "./PatientDashboard";
import { loadHospitalState } from "../utils/hospitalState";

function HospitalDashboard({ user, onLogout }) {
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
        <header className="mb-10 overflow-hidden rounded-[3rem] border border-white bg-white/70 p-8 shadow-xl backdrop-blur-3xl">
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
                <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
                  {userRole === "DOCTOR" && (
                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
                      Dr.{" "}
                    </span>
                  )}
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
                    {currentUser.firstName || currentUser.lastName || "User"}
                  </span>
                </h1>
                <p className="mt-4 max-w-lg text-base font-bold leading-relaxed text-slate-600">
                  Access your personalized hospital dashboard. Track appointments, medical records, and health updates in real-time.
                </p>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-8 py-4 text-sm font-black text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95"
            >
              Logout
            </button>
          </div>

          <div className="mt-12">
            <div className="rounded-[2.5rem] border border-white bg-white/60 p-8 shadow-lg shadow-blue-500/5">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-black text-slate-800">
                  <span className="bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">Upcoming appointments</span>
                </h2>
                {userRole === "PATIENT" && (
                  <button 
                    onClick={() => setActiveTab("book")} 
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:bg-blue-500 active:scale-95"
                  >
                    Book New
                  </button>
                )}
              </div>
              
              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment) => {
                    const patient = state.patients.find((entry) => String(entry.id) === String(appointment.patientId));
                    const doctor = state.doctors.find((entry) => String(entry.id) === String(appointment.doctorId));
                    return (
                      <div key={appointment.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-800/20 p-4 transition-all hover:border-blue-500/30 hover:bg-slate-800/40">
                        <div className="relative z-10">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">{appointment.appointmentDate}</p>
                          <p className="mt-1 text-xl font-black text-white">{appointment.appointmentTime}</p>
                          <p className="mt-2 text-sm font-bold text-white">
                            {userRole === "PATIENT"
                              ? (doctor ? ("Dr. " + doctor.firstName + " " + doctor.lastName) : "Specialist Assigned")
                              : ((patient?.firstName || "Patient") + " " + (patient?.lastName || ""))}
                          </p>
                          <p className="mt-1 text-[11px] font-medium text-slate-400 truncate">{appointment.reason || "General Checkup"}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900/40 text-sm font-bold text-white md:col-span-2 lg:col-span-4">
                    <svg className="mb-2 text-blue-400" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span className="text-white drop-shadow-md">No upcoming schedules</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <nav className="sticky top-6 z-40 mb-8 flex flex-wrap gap-2 rounded-2xl border border-white bg-white/70 p-2 backdrop-blur-xl shadow-md shadow-blue-500/5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black capitalize transition ${
                activeTab === tab 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                  : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              <span className={activeTab === tab ? "drop-shadow-sm" : ""}>
                {tab}
              </span>
            </button>
          ))}
        </nav>

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
}

export default HospitalDashboard;
