import React, { useState, useMemo } from 'react';
import { useForm } from "react-hook-form";
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
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { register: registerPatient, handleSubmit: handleSubmitPatient, reset: resetPatient, setValue: setPatientValue } = useForm({
    defaultValues: emptyPatient
  });

  const { register: registerDoctor, handleSubmit: handleSubmitDoctor, reset: resetDoctor, setValue: setDoctorValue } = useForm({
    defaultValues: emptyDoctor
  });

  const { register: registerAppointment, handleSubmit: handleSubmitAppointment, reset: resetAppointment, setValue: setAppointmentValue } = useForm({
    defaultValues: emptyAppointment
  });

  const resetPatientForm = () => {
    setEditingPatientId(null);
    resetPatient(emptyPatient);
  };

  const resetDoctorForm = () => {
    setEditingDoctorId(null);
    resetDoctor(emptyDoctor);
  };

  const resetAppointmentForm = () => {
    setEditingAppointmentId(null);
    resetAppointment(emptyAppointment);
  };

  const onSavePatient = (data) => {
    mutateHospitalState((draft) => {
      if (editingPatientId) {
        draft.patients = draft.patients.map((entry) =>
          entry.id === editingPatientId ? { ...entry, ...data, age: Number(data.age), isPatientActive: entry.isPatientActive } : entry,
        );
        draft.users = draft.users.map((entry) =>
          entry.id === editingPatientId ? { ...entry, ...data, password: data.password || entry.password, role: "PATIENT" } : entry,
        );
        return draft;
      }

      const nextId = `${Date.now()}`;
      draft.patients.push({
        id: nextId,
        ...data,
        age: Number(data.age),
        isPatientActive: true,
      });
      draft.users.push({
        id: nextId,
        role: "PATIENT",
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      return draft;
    });
    refreshState();
    resetPatientForm();
  };

  const onSaveDoctor = (data) => {
    mutateHospitalState((draft) => {
      if (editingDoctorId) {
        draft.doctors = draft.doctors.map((entry) =>
          entry.id === editingDoctorId ? { ...entry, ...data, age: Number(data.age), experience: Number(data.experience) } : entry,
        );
        draft.users = draft.users.map((entry) =>
          entry.id === editingDoctorId ? { ...entry, ...data, password: data.password || entry.password, role: "DOCTOR" } : entry,
        );
        return draft;
      }

      const nextId = `${Date.now()}`;
      draft.doctors.push({
        id: nextId,
        ...data,
        age: Number(data.age),
        experience: Number(data.experience),
        isDoctorActive: true,
      });
      draft.users.push({
        id: nextId,
        role: "DOCTOR",
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      return draft;
    });
    refreshState();
    resetDoctorForm();
  };

  const onSaveAppointment = (data) => {
    mutateHospitalState((draft) => {
      if (editingAppointmentId) {
        draft.appointments = draft.appointments.map((entry) => (entry.id === editingAppointmentId ? { ...entry, ...data } : entry));
        return draft;
      }
      draft.appointments.push({
        id: `${Date.now()}`,
        ...data,
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
          <div className="rounded-4xl border border-white bg-white/70 p-8 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">System overview</h2>
                <p className="text-base font-bold text-slate-500 mt-1">Latest activity across patients, doctors, and scheduling.</p>
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

          <div className="rounded-4xl border border-white bg-white/70 p-8 shadow-xl backdrop-blur-xl">
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">Recent appointments</h2>
            <div className="mt-6 space-y-4">
              {state.appointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="rounded-2xl border border-slate-100 bg-white p-5 hover:bg-slate-50 transition-colors shadow-sm">
                  <p className="font-black text-slate-800 text-lg">
                    {state.patients.find((entry) => String(entry.id) === String(appointment.patientId))?.firstName || "Patient"} with{" "}
                    {state.doctors.find((entry) => String(entry.id) === String(appointment.doctorId))?.firstName || "Doctor"}
                  </p>
                  <p className="text-base font-bold text-slate-500 mt-1">
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
          <form onSubmit={handleSubmitPatient(onSavePatient)} className="rounded-4xl border border-white bg-white/70 p-6 shadow-xl backdrop-blur-xl">
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">{editingPatientId ? "Edit patient" : "Add patient"}</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <input {...registerPatient("firstName")} placeholder="First Name" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              <input {...registerPatient("lastName")} placeholder="Last Name" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              <input {...registerPatient("email")} type="email" placeholder="Email" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              <input {...registerPatient("password")} type="password" placeholder="Password" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              <input {...registerPatient("phoneNumber")} placeholder="Phone Number" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              <input {...registerPatient("age")} type="number" placeholder="Age" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              <input {...registerPatient("address")} placeholder="Address" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 sm:col-span-2" />
            </div>
            <div className="mt-6 flex gap-3">
              <button className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all font-semibold text-white hover:bg-blue-800" type="submit">
                {editingPatientId ? "UPDATE PATIENT" : "CREATE PATIENT"}
              </button>
              {editingPatientId && (
                <button type="button" onClick={resetPatientForm} className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-black text-slate-600 hover:bg-slate-100 transition-all">
                  CANCEL
                </button>
              )}
            </div>
          </form>

          <div className="rounded-4xl border border-white bg-white/70 p-6 shadow-xl backdrop-blur-xl">
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">Patients</h2>
            <div className="mt-6 space-y-3">
              {state.patients.map((patient) => (
                <div key={patient.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-800">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-sm font-bold text-slate-500">{patient.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingPatientId(patient.id);
                          Object.entries(patient).forEach(([k, v]) => setPatientValue(k, v));
                          setPatientValue("password", "");
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-600 hover:bg-slate-50 transition"
                      >
                        EDIT
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
                        className="rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-600 hover:bg-rose-100 transition"
                        title="Delete patient"
                      >
                        DELETE
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
          <form onSubmit={handleSubmitDoctor(onSaveDoctor)} className="rounded-4xl border border-white bg-white/70 p-6 shadow-xl backdrop-blur-xl">
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">{editingDoctorId ? "Edit doctor" : "Add doctor"}</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <input {...registerDoctor("firstName")} placeholder="First Name" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              <input {...registerDoctor("lastName")} placeholder="Last Name" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              <input {...registerDoctor("email")} type="email" placeholder="Email" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              <input {...registerDoctor("password")} type="password" placeholder="Password" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              <input {...registerDoctor("specialization")} placeholder="Specialization" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              <input {...registerDoctor("degree")} placeholder="Degree" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              <input {...registerDoctor("experience")} type="number" placeholder="Experience" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            </div>
            <div className="mt-6 flex gap-3">
              <button className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all font-semibold text-white hover:bg-blue-800" type="submit">
                {editingDoctorId ? "UPDATE DOCTOR" : "CREATE DOCTOR"}
              </button>
              {editingDoctorId && (
                <button type="button" onClick={resetDoctorForm} className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-black text-slate-600 hover:bg-slate-100 transition-all">
                  CANCEL
                </button>
              )}
            </div>
          </form>

          <div className="rounded-4xl border border-white bg-white/70 p-6 shadow-xl backdrop-blur-xl">
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">Specialization management</h2>
            <div className="mt-6 space-y-3">
              {state.doctors.map((doctor) => (
                <div key={doctor.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-800">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </p>
                      <p className="text-sm font-bold text-slate-500">{doctor.specialization}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingDoctorId(doctor.id);
                          Object.entries(doctor).forEach(([k, v]) => setDoctorValue(k, v));
                          setDoctorValue("password", "");
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-600 hover:bg-slate-50 transition"
                      >
                        EDIT
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
                        className="rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-600 hover:bg-rose-100 transition"
                        title="Delete doctor"
                      >
                        DELETE
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
          <form onSubmit={handleSubmitAppointment(onSaveAppointment)} className="rounded-4xl border border-white bg-white/70 p-6 shadow-xl backdrop-blur-xl">
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">{editingAppointmentId ? "Edit appointment" : "Schedule appointment"}</h2>
            <div className="mt-6 grid gap-3">
              <select
                {...registerAppointment("patientId")}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
              >
                <option value="">Select patient</option>
                {state.patients.map((patient) => (
                  <option key={patient.id} value={patient.id} className="text-slate-900">
                    {patient.firstName} {patient.lastName}
                  </option>
                ))}
              </select>
              <select
                {...registerAppointment("doctorId")}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
              >
                <option value="">Select doctor</option>
                {state.doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id} className="text-slate-900">
                    Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                  </option>
                ))}
              </select>
              <input
                type="date"
                {...registerAppointment("appointmentDate")}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
              />
              <input
                type="time"
                {...registerAppointment("appointmentTime")}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
              />
              <input
                type="text"
                placeholder="Reason"
                {...registerAppointment("reason")}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              <textarea
                placeholder="Notes"
                {...registerAppointment("notes")}
                className="min-h-28 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all font-semibold text-white hover:bg-blue-800" type="submit">
                {editingAppointmentId ? "UPDATE APPOINTMENT" : "CREATE APPOINTMENT"}
              </button>
              {editingAppointmentId && (
                <button type="button" onClick={resetAppointmentForm} className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-black text-slate-600 hover:bg-slate-100 transition-all">
                  CANCEL
                </button>
              )}
            </div>
          </form>

          <div className="rounded-4xl border border-white bg-white/70 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">Appointment calendar</h2>
                <p className="text-sm font-bold text-slate-500">Click a day to filter the schedule.</p>
              </div>
              <input
                type="month"
                value={calendarMonth}
                onChange={(event) => setCalendarMonth(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none"
              />
            </div>

            <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-black uppercase tracking-widest text-slate-400">
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
                    className={`min-h-[5rem] rounded-2xl border p-2 text-left transition ${selectedDay === cell.currentDate ? "border-blue-400 bg-blue-50 shadow-inner" : "border-slate-100 bg-white hover:bg-slate-50"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-black ${selectedDay === cell.currentDate ? "text-blue-600" : "text-slate-800"}`}>{cell.day}</span>
                      <span className="text-[11px] font-bold text-slate-400">{cell.dayAppointments.length}</span>
                    </div>
                    <div className="mt-2 space-y-1 text-[11px] font-bold text-slate-500">
                      {cell.dayAppointments.slice(0, 1).map((appointment) => (
                        <div key={appointment.id} className="rounded-lg bg-slate-50 px-2 py-1 truncate border border-slate-100">
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
                <div key={appointment.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-slate-800">
                        {state.patients.find((entry) => entry.id === appointment.patientId)?.firstName || "Patient"} with{" "}
                        {state.doctors.find((entry) => entry.id === appointment.doctorId)?.firstName || "Doctor"}
                      </p>
                      <p className="text-sm font-bold text-slate-500">
                        {formatDate(appointment.appointmentDate)} at {appointment.appointmentTime} - {appointment.reason}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => sendReminder(appointment)} className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/20">
                        REMINDER
                      </button>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-600 hover:bg-slate-50 transition"
                      >
                        COMPLETE
                      </button>
                      <button
                        onClick={() => {
                          mutateHospitalState((draft) => {
                            draft.appointments = draft.appointments.filter((a) => a.id !== appointment.id);
                            return draft;
                          });
                          refreshState();
                        }}
                        className="rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-600 hover:bg-rose-100 transition"
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
