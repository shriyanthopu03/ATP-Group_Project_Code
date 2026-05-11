import React, { useState, useMemo } from 'react';
import { Trash2 } from "lucide-react";
import { mutateHospitalState, emptyPatient, emptyDoctor, emptyAppointment, formatDate } from "../utils/hospitalState";
import EntityPill from "./EntityPill";
import SearchPanel from "./SearchPanel";

function AdminDashboard({
  activeTab,
  state,
  setActiveTab,
  refreshState,
  calendarMonth,
  setCalendarMonth,
  selectedMonthCells,
  setSelectedDay,
  selectedDay,
  calendarAppointments,
  sendReminder,
  updateAppointmentStatus
}) {
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [patientForm, setPatientForm] = useState(emptyPatient);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [doctorForm, setDoctorForm] = useState(emptyDoctor);
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);
  const [appointmentForm, setAppointmentForm] = useState(emptyAppointment);
  const [searchQuery, setSearchQuery] = useState("");

  const resetPatientForm = () => {
    setEditingPatientId(null);
    setPatientForm(emptyPatient);
  };

  const resetDoctorForm = () => {
    setEditingDoctorId(null);
    setDoctorForm(emptyDoctor);
  };

  const resetAppointmentForm = () => {
    setEditingAppointmentId(null);
    setAppointmentForm(emptyAppointment);
  };

  const savePatient = (event) => {
    event.preventDefault();
    mutateHospitalState((draft) => {
      if (editingPatientId) {
        draft.patients = draft.patients.map((entry) =>
          entry.id === editingPatientId ? { ...entry, ...patientForm, age: Number(patientForm.age), isPatientActive: entry.isPatientActive } : entry,
        );
        draft.users = draft.users.map((entry) =>
          entry.id === editingPatientId ? { ...entry, ...patientForm, password: patientForm.password || entry.password, role: "PATIENT" } : entry,
        );
        return draft;
      }

      const nextId = `${Date.now()}`;
      draft.patients.push({
        id: nextId,
        ...patientForm,
        age: Number(patientForm.age),
        isPatientActive: true,
      });
      draft.users.push({
        id: nextId,
        role: "PATIENT",
        email: patientForm.email,
        password: patientForm.password,
        firstName: patientForm.firstName,
        lastName: patientForm.lastName,
      });
      return draft;
    });
    refreshState();
    resetPatientForm();
  };

  const saveDoctor = (event) => {
    event.preventDefault();
    mutateHospitalState((draft) => {
      if (editingDoctorId) {
        draft.doctors = draft.doctors.map((entry) =>
          entry.id === editingDoctorId ? { ...entry, ...doctorForm, age: Number(doctorForm.age), experience: Number(doctorForm.experience) } : entry,
        );
        draft.users = draft.users.map((entry) =>
          entry.id === editingDoctorId ? { ...entry, ...doctorForm, password: doctorForm.password || entry.password, role: "DOCTOR" } : entry,
        );
        return draft;
      }

      const nextId = `${Date.now()}`;
      draft.doctors.push({
        id: nextId,
        ...doctorForm,
        age: Number(doctorForm.age),
        experience: Number(doctorForm.experience),
        isDoctorActive: true,
      });
      draft.users.push({
        id: nextId,
        role: "DOCTOR",
        email: doctorForm.email,
        password: doctorForm.password,
        firstName: doctorForm.firstName,
        lastName: doctorForm.lastName,
      });
      return draft;
    });
    refreshState();
    resetDoctorForm();
  };

  const saveAppointment = (event) => {
    event.preventDefault();
    mutateHospitalState((draft) => {
      if (editingAppointmentId) {
        draft.appointments = draft.appointments.map((entry) => (entry.id === editingAppointmentId ? { ...entry, ...appointmentForm } : entry));
        return draft;
      }
      draft.appointments.push({
        id: `${Date.now()}`,
        ...appointmentForm,
        reminderSent: false,
      });
      return draft;
    });
    refreshState();
    resetAppointmentForm();
  };

  const searchHospitalEntities = (state, query) => {
    const normalizedQuery = String(query || "").trim().toLowerCase();
    if (!normalizedQuery) {
      return { patients: [], doctors: [], appointments: [] };
    }
    const contains = (value) => String(value || "").toLowerCase().includes(normalizedQuery);
    const patients = state.patients.filter((patient) =>
      [patient.firstName, patient.lastName, patient.email, patient.phoneNumber, patient.address].some(contains),
    );
    const doctors = state.doctors.filter((doctor) =>
      [doctor.firstName, doctor.lastName, doctor.email, doctor.phoneNumber, doctor.specialization, doctor.degree].some(contains),
    );
    const appointments = state.appointments.filter((appointment) =>
      [appointment.reason, appointment.notes, appointment.status, appointment.appointmentDate, appointment.appointmentTime].some(contains),
    );
    return { patients, doctors, appointments };
  };

  const filteredSearch = useMemo(() => searchHospitalEntities(state, searchQuery), [state, searchQuery]);

  return (
    <>
      {activeTab === "overview" && (
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-3xl font-black bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">System overview</h2>
                <p className="text-base font-bold text-slate-300 mt-1">Latest activity across patients, doctors, and scheduling.</p>
              </div>
              <button 
                onClick={() => setActiveTab("appointments")} 
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-black text-white shadow-lg shadow-blue-500/30 hover:scale-105 transition-all"
              >
                SCHEDULE
              </button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <EntityPill label="Active patients" value={state.patients.filter((entry) => entry.isPatientActive).length} />
              <EntityPill label="Active doctors" value={state.doctors.filter((entry) => entry.isDoctorActive).length} />
              <EntityPill label="Prescriptions" value={state.prescriptions.length} />
              <EntityPill label="Medical logs" value={state.histories.length} />
            </div>
          </div>

          <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
            <h2 className="text-2xl font-black bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Recent appointments</h2>
            <div className="mt-6 space-y-4">
              {state.appointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="rounded-2xl border border-white/5 bg-white/5 p-5 hover:bg-white/10 transition-colors">
                  <p className="font-black text-white brightness-150 text-lg">
                    {state.patients.find((entry) => String(entry.id) === String(appointment.patientId))?.firstName || "Patient"} with{" "}
                    {state.doctors.find((entry) => String(entry.id) === String(appointment.doctorId))?.firstName || "Doctor"}
                  </p>
                  <p className="text-base font-bold text-slate-300 mt-1">
                    {appointment.appointmentDate} at {appointment.appointmentTime} - {appointment.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "patients" && (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <form onSubmit={savePatient} className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
            <h2 className="text-2xl font-black">{editingPatientId ? "Edit patient" : "Add patient"}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {Object.entries(patientForm).map(([key, value]) => (
                <input
                  key={key}
                  type={key === "age" ? "number" : key.includes("password") ? "password" : key === "profileImageUrl" ? "url" : "text"}
                  placeholder={key.replace(/([A-Z])/g, " $1")}
                  value={value}
                  onChange={(event) => setPatientForm((prev) => ({ ...prev, [key]: event.target.value }))}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-300"
                />
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800" type="submit">
                {editingPatientId ? "Update patient" : "Create patient"}
              </button>
              {editingPatientId && (
                <button type="button" onClick={resetPatientForm} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200">
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
            <h2 className="text-2xl font-black">Patients</h2>
            <div className="mt-4 space-y-3">
              {state.patients.map((patient) => (
                <div key={patient.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-sm text-slate-300">{patient.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingPatientId(patient.id);
                          setPatientForm({ ...patient, password: patient.password || "" });
                        }}
                        className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          mutateHospitalState((draft) => {
                            draft.patients = draft.patients.filter((entry) => entry.id !== patient.id);
                            draft.users = draft.users.filter((entry) => entry.id !== patient.id);
                            draft.appointments = draft.appointments.filter((entry) => entry.patientId !== patient.id);
                            draft.prescriptions = draft.prescriptions.filter((entry) => entry.patientId !== patient.id);
                            draft.histories = draft.histories.filter((entry) => entry.patientId !== patient.id);
                            return draft;
                          });
                          refreshState();
                        }}
                        className="rounded-full bg-rose-500/10 p-2 text-rose-500 hover:bg-rose-500 hover:text-white transition"
                        title="Delete patient"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <EntityPill label="Age" value={patient.age} />
                    <EntityPill label="Status" value={patient.isPatientActive ? "Active" : "Inactive"} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "doctors" && (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <form onSubmit={saveDoctor} className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
            <h2 className="text-2xl font-black">{editingDoctorId ? "Edit doctor" : "Add doctor"}</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {Object.entries(doctorForm).map(([key, value]) => (
                <input
                  key={key}
                  type={key === "age" || key === "experience" ? "number" : key.includes("password") ? "password" : key === "profileImageUrl" ? "url" : "text"}
                  placeholder={key.replace(/([A-Z])/g, " $1")}
                  value={value}
                  onChange={(event) => setDoctorForm((prev) => ({ ...prev, [key]: event.target.value }))}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-300"
                />
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800" type="submit">
                {editingDoctorId ? "Update doctor" : "Create doctor"}
              </button>
              {editingDoctorId && (
                <button type="button" onClick={resetDoctorForm} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200">
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
            <h2 className="text-2xl font-black">Specialization management</h2>
            <div className="mt-4 space-y-3">
              {state.doctors.map((doctor) => (
                <div key={doctor.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </p>
                      <p className="text-sm text-slate-300">{doctor.specialization}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingDoctorId(doctor.id);
                          setDoctorForm({ ...doctor, password: doctor.password || "" });
                        }}
                        className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          mutateHospitalState((draft) => {
                            draft.doctors = draft.doctors.filter((entry) => entry.id !== doctor.id);
                            draft.users = draft.users.filter((entry) => entry.id !== doctor.id);
                            draft.appointments = draft.appointments.filter((entry) => entry.doctorId !== doctor.id);
                            draft.prescriptions = draft.prescriptions.filter((entry) => entry.doctorId !== doctor.id);
                            draft.histories = draft.histories.filter((entry) => entry.doctorId !== doctor.id);
                            return draft;
                          });
                          refreshState();
                        }}
                        className="rounded-full bg-rose-500/10 p-2 text-rose-500 hover:bg-rose-500 hover:text-white transition"
                        title="Delete doctor"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <EntityPill label="Experience" value={`${doctor.experience} years`} />
                    <EntityPill label="Degree" value={doctor.degree} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "appointments" && (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <form onSubmit={saveAppointment} className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
            <h2 className="text-2xl font-black">{editingAppointmentId ? "Edit appointment" : "Schedule appointment"}</h2>
            <div className="mt-4 grid gap-3">
              <select
                value={appointmentForm.patientId}
                onChange={(event) => setAppointmentForm((prev) => ({ ...prev, patientId: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none"
              >
                <option value="">Select patient</option>
                {state.patients.map((patient) => (
                  <option key={patient.id} value={patient.id} className="text-slate-950">
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
              <select
                value={appointmentForm.doctorId}
                onChange={(event) => setAppointmentForm((prev) => ({ ...prev, doctorId: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none"
              >
                <option value="">Select doctor</option>
                {state.doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id} className="text-slate-950">
                    Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={appointmentForm.appointmentDate}
                onChange={(event) => setAppointmentForm((prev) => ({ ...prev, appointmentDate: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
              />
              <input
                type="time"
                value={appointmentForm.appointmentTime}
                onChange={(event) => setAppointmentForm((prev) => ({ ...prev, appointmentTime: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
              />
              <input
                type="text"
                placeholder="Reason"
                value={appointmentForm.reason}
                onChange={(event) => setAppointmentForm((prev) => ({ ...prev, reason: event.target.value }))}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
              />
              <textarea
                placeholder="Notes"
                value={appointmentForm.notes}
                onChange={(event) => setAppointmentForm((prev) => ({ ...prev, notes: event.target.value }))}
                className="min-h-28 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
              />
            </div>
            <div className="mt-4 flex gap-3">
              <button className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800" type="submit">
                {editingAppointmentId ? "Update appointment" : "Create appointment"}
              </button>
              {editingAppointmentId && (
                <button type="button" onClick={resetAppointmentForm} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200">
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">Appointment calendar</h2>
                <p className="text-sm text-slate-400">Click a day to filter the schedule.</p>
              </div>
              <input
                type="month"
                value={calendarMonth}
                onChange={(event) => setCalendarMonth(event.target.value)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none"
              />
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day}>{day}</div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-7 gap-2">
              {selectedMonthCells.map((cell, index) =>
                cell ? (
                  <button
                    key={cell.currentDate}
                    onClick={() => setSelectedDay(cell.currentDate)}
                    className={`min-h-[5rem] rounded-2xl border p-2 text-left transition ${selectedDay === cell.currentDate ? "border-blue-300 bg-blue-900/20" : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{cell.day}</span>
                      <span className="text-[11px] text-slate-400">{cell.dayAppointments.length}</span>
                    </div>
                    <div className="mt-2 space-y-1 text-[11px] text-slate-300">
                      {cell.dayAppointments.slice(0, 1).map((appointment) => (
                        <div key={appointment.id} className="rounded-full bg-white/10 px-2 py-1 truncate">
                          {appointment.appointmentTime} {appointment.reason}
                        </div>
                      ))}
                    </div>
                  </button>
                ) : (
                  <div key={`empty-${index}`} className="min-h-[5rem] rounded-2xl border border-transparent" />
                ),
              )}
            </div>

            <div className="mt-6 space-y-3">
              {calendarAppointments.map((appointment) => (
                <div key={appointment.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">
                        {state.patients.find((entry) => entry.id === appointment.patientId)?.firstName || "Patient"} with{" "}
                        {state.doctors.find((entry) => entry.id === appointment.doctorId)?.firstName || "Doctor"}
                      </p>
                      <p className="text-sm text-slate-300">
                        {formatDate(appointment.appointmentDate)} at {appointment.appointmentTime} - {appointment.reason}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => sendReminder(appointment)} className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                        Email reminder
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                        className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => {
                          mutateHospitalState((draft) => {
                            draft.appointments = draft.appointments.filter((a) => a.id !== appointment.id);
                            return draft;
                          });
                          refreshState();
                        }}
                        className="rounded-full bg-rose-500/10 p-2 text-rose-500 hover:bg-rose-500 hover:text-white transition"
                        title="Delete appointment"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingAppointmentId(appointment.id);
                          setAppointmentForm({
                            patientId: appointment.patientId,
                            doctorId: appointment.doctorId,
                            appointmentDate: appointment.appointmentDate,
                            appointmentTime: appointment.appointmentTime,
                            reason: appointment.reason,
                            notes: appointment.notes || "",
                            status: appointment.status,
                          });
                        }}
                        className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "search" && (
        <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
          <h2 className="text-2xl font-black">Search patients, doctors, appointments</h2>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by name, email, specialization, or reason"
            className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
          />

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <SearchPanel title="Patients" items={filteredSearch.patients} renderItem={(item) => `${item.firstName} ${item.lastName} - ${item.email}`} />
            <SearchPanel title="Doctors" items={filteredSearch.doctors} renderItem={(item) => `Dr. ${item.firstName} ${item.lastName} - ${item.specialization}`} />
            <SearchPanel title="Appointments" items={filteredSearch.appointments} renderItem={(item) => `${item.appointmentDate} ${item.appointmentTime} - ${item.reason}`} />
          </div>
        </div>
      )}
    </>
  );
}

export default AdminDashboard;
