import React, { useMemo, useState } from "react";
import AdminDashboard from "./AdminDashboard";
import DoctorDashboard from "./DoctorDashboard";
import PatientDashboard from "./PatientDashboard";
import { loadHospitalState } from "../utils/hospitalState";

function HospitalDashboard({ user, onLogout }) {
  const userRole = String(user?.role || "PATIENT").toUpperCase();
  const [state, setState] = useState(() => loadHospitalState());
  const [activeTab, setActiveTab] = useState(userRole === "ADMIN" ? "overview" : userRole === "DOCTOR" ? "schedule" : "book");

  const refreshState = () => setState(loadHospitalState());

  const currentUser = useMemo(() => {
    if (userRole === "PATIENT") {
      return state.patients.find((entry) => entry.id === user.id) || user;
    }
    if (userRole === "DOCTOR") {
      return state.doctors.find((entry) => entry.id === user.id) || user;
    }
    return user;
  }, [state, user, userRole]);

  const myAppointments = useMemo(() => {
    if (userRole === "PATIENT") {
      return state.appointments.filter((entry) => entry.patientId === user.id);
    }
    if (userRole === "DOCTOR") {
      return state.appointments.filter((entry) => entry.doctorId === user.id);
    }
    return state.appointments;
  }, [state.appointments, user, userRole]);

  const upcomingAppointments = useMemo(
    () =>
      [...myAppointments]
        .filter((entry) => entry.appointmentDate >= new Date().toISOString().slice(0, 10))
        .sort((left, right) => {
          const leftDate = new Date(`${left.appointmentDate}T${left.appointmentTime || "00:00"}`);
          const rightDate = new Date(`${right.appointmentDate}T${right.appointmentTime || "00:00"}`);
          return leftDate - rightDate;
        })
        .slice(0, 4),
    [myAppointments],
  );

  const tabs =
    userRole === "ADMIN"
      ? ["overview", "patients", "doctors", "appointments", "search"]
      : userRole === "DOCTOR"
        ? ["schedule", "records", "search", "profile"]
        : ["book", "records", "profile"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-4xl border border-white/10 bg-linear-to-r from-cyan-500/20 via-slate-900 to-emerald-500/20 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-blue-900">Hospital portal</p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                {currentUser.firstName || currentUser.email}, your {userRole.toLowerCase()} dashboard
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white">
                {userRole}
              </div>
              <button
                onClick={onLogout}
                className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">Upcoming appointments</h2>
                <p className="text-sm text-slate-400">Your next scheduled visits in one place.</p>
              </div>
              {userRole === "PATIENT" && (
                <button onClick={() => setActiveTab("book")} className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                  Book appointment
                </button>
              )}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => {
                  const patient = state.patients.find((entry) => entry.id === appointment.patientId);
                  const doctor = state.doctors.find((entry) => entry.id === appointment.doctorId);

                  return (
                    <div key={appointment.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-300">{appointment.appointmentDate}</p>
                      <p className="mt-1 text-lg font-bold text-white">{appointment.appointmentTime}</p>
                      <p className="mt-1 text-sm text-slate-300">
                        {userRole === "PATIENT"
                          ? doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : "Pending Doctor Assignment"
                          : `${patient?.firstName || "Patient"} ${patient?.lastName || ""}`}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">{appointment.reason || "No reason added"}</p>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400 md:col-span-2 xl:col-span-4">
                  No upcoming appointments yet.
                </div>
              )}
            </div>
          </div>
        </header>

        <nav className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-slate-900/80 p-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${activeTab === tab ? "bg-blue-900 text-white" : "text-slate-300 hover:bg-white/10"
                }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {userRole === "ADMIN" && (
          <AdminDashboard
            activeTab={activeTab}
            state={state}
            setActiveTab={setActiveTab}
            refreshState={refreshState}
          />
        )}

        {userRole === "DOCTOR" && (
          <DoctorDashboard
            activeTab={activeTab}
            state={state}
            setActiveTab={setActiveTab}
            currentUser={currentUser}
            refreshState={refreshState}
          />
        )}

        {userRole === "PATIENT" && (
          <PatientDashboard
            activeTab={activeTab}
            state={state}
            user={user}
            currentUser={currentUser}
            refreshState={refreshState}
          />
        )}
      </div>
    </div>
  );
}

export default HospitalDashboard;