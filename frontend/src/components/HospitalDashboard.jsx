import React, { useMemo, useState } from "react";
import AdminDashboard from "./AdminDashboard";
import DoctorDashboard from "./DoctorDashboard";
import PatientDashboard from "./PatientDashboard";
import { loadHospitalState } from "../utils/hospitalState";
import { LogOut } from "lucide-react";

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
    <div className="min-h-screen bg-[#0b1120] text-slate-100 selection:bg-blue-500/30">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[130px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-10 overflow-hidden rounded-[3rem] border border-white/10 bg-[#111827]/80 p-8 shadow-2xl backdrop-blur-3xl">
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 border border-blue-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Live Portal
              </div>
                <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-6xl">
                  {userRole === "DOCTOR" && (
                    <span className="bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                      Dr.{" "}
                    </span>
                  )}
                  <span className="bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                    {currentUser.firstName || currentUser.lastName || "User"}
                  </span>
                </h1>
                <p className="mt-4 max-w-lg text-base font-bold leading-relaxed bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                  Access your personalized hospital dashboard. Track appointments, medical records, and health updates in real-time.
                </p>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 px-8 py-4 text-sm font-black text-white transition-all hover:bg-white/10 hover:border-white/20 active:scale-95 bg-gradient-to-r from-white via-blue-50 to-white bg-clip-text text-transparent"
            >
              <LogOut size={20} className="text-white brightness-200" />
              Logout
            </button>
          </div>

          <div className="mt-12">
            <div className="rounded-[2.5rem] border border-white/5 bg-[#0f172a]/60 p-8 shadow-inner">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/40">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  </div>
                  <span className="bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(255,255,255,0.3)] brightness-150">Upcoming appointments</span>
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

        <nav className="sticky top-6 z-40 mb-8 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-slate-900/60 p-2 backdrop-blur-xl">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black capitalize transition ${
                activeTab === tab 
                  ? "bg-blue-600/40 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                  : "text-slate-300 hover:bg-white/10"
              }`}
            >
              <span className={activeTab === tab ? "bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : ""}>
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
