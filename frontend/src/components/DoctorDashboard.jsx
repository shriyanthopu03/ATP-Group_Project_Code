import React, { useState, useMemo } from 'react';
import { useForm } from "react-hook-form";
import { 
  mutateHospitalState, 
  emptyPrescription, 
  emptyHistory, 
  formatDate, 
  formatMonthValue, 
  getMonthCells,
  buildReminderMailto,
  buildDoctorProfileForm,
  loadHospitalState
} from "../utils/hospitalState";
import EntityPill from "./EntityPill";

function DoctorDashboard({ activeTab, state, setActiveTab, currentUser, refreshState }) {
  const [calendarMonth, setCalendarMonth] = useState(formatMonthValue(new Date()));
  const [selectedDay, setSelectedDay] = useState("");
  const [editingPrescriptionId, setEditingPrescriptionId] = useState(null);
  const [editingHistoryId, setEditingHistoryId] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [doctorProfileForm, setDoctorProfileForm] = useState(() => buildDoctorProfileForm(currentUser));

  const { register: registerPrescription, handleSubmit: handleSubmitPrescription, reset: resetPrescription, setValue: setPrescriptionValue } = useForm({
    defaultValues: emptyPrescription
  });

  const { register: registerHistory, handleSubmit: handleSubmitHistory, reset: resetHistory, setValue: setHistoryValue } = useForm({
    defaultValues: emptyHistory
  });

  const myAppointments = useMemo(() => {
    const doctorId = String(currentUser?.id);
    const filtered = (state.appointments || []).filter((entry) => String(entry.doctorId) === doctorId);
    return filtered;
  }, [state.appointments, currentUser?.id]);

  const completedAppointments = useMemo(() => {
    return myAppointments.filter(apt => apt.status === "completed");
  }, [myAppointments]);

  const selectedMonthCells = useMemo(() => getMonthCells(calendarMonth, myAppointments), [calendarMonth, myAppointments]);
  
  const sendReminder = (appointment) => {
    const mailto = buildReminderMailto(appointment, state);
    mutateHospitalState((draft) => {
      draft.appointments = draft.appointments.map((entry) =>
        entry.id === appointment.id ? { ...entry, reminderSent: true } : entry,
      );
      return draft;
    });
    refreshState();
    window.location.href = mailto;
  };

  const markCompleted = (appointmentId) => {
    mutateHospitalState((draft) => {
      draft.appointments = draft.appointments.map((entry) =>
        entry.id === appointmentId ? { ...entry, status: "completed" } : entry,
      );
      return draft;
    });
    refreshState();
  };

  const onSavePrescription = (data) => {
    mutateHospitalState((draft) => {
      const medicines = data.medicineName
        ? [
          {
            name: data.medicineName,
            dosage: data.dosage,
            duration: data.duration,
            instructions: data.instructions,
          },
        ]
        : [];

      if (editingPrescriptionId) {
        draft.prescriptions = draft.prescriptions.map((entry) =>
          entry.id === editingPrescriptionId
            ? { ...entry, diagnosis: data.diagnosis, medicines, notes: data.notes }
            : entry,
        );
        return draft;
      }

      draft.prescriptions.push({
        id: `${Date.now()}`,
        appointmentId: data.appointmentId,
        patientId: data.patientId,
        doctorId: currentUser.id,
        diagnosis: data.diagnosis,
        medicines,
        notes: data.notes,
        prescribedAt: new Date().toISOString(),
      });
      return draft;
    });
    refreshState();
    setEditingPrescriptionId(null);
    resetPrescription(emptyPrescription);
  };

  const onSaveHistory = (data) => {
    mutateHospitalState((draft) => {
      if (editingHistoryId) {
        draft.histories = draft.histories.map((entry) => (entry.id === editingHistoryId ? { ...entry, ...data } : entry));
        return draft;
      }

      draft.histories.push({
        id: `${Date.now()}`,
        ...data,
        doctorId: currentUser.id,
        visitDate: new Date().toISOString(),
      });
      return draft;
    });
    refreshState();
    setEditingHistoryId(null);
    resetHistory(emptyHistory);
  };

  const saveDoctorProfile = (event) => {
    event.preventDefault();
    mutateHospitalState((draft) => {
      draft.doctors = draft.doctors.map((entry) =>
        entry.id === currentUser.id
          ? {
            ...entry,
            firstName: doctorProfileForm.firstName,
            lastName: doctorProfileForm.lastName,
            password: doctorProfileForm.password || entry.password,
            age: Number(doctorProfileForm.age),
            phoneNumber: doctorProfileForm.phoneNumber,
            experience: doctorProfileForm.experience,
            specialization: doctorProfileForm.specialization,
            degree: doctorProfileForm.degree,
            profileImageUrl: doctorProfileForm.profileImageUrl,
          }
          : entry,
      );

      draft.users = draft.users.map((entry) =>
        entry.id === currentUser.id
          ? {
            ...entry,
            firstName: doctorProfileForm.firstName,
            lastName: doctorProfileForm.lastName,
            password: doctorProfileForm.password || entry.password,
          }
          : entry,
      );
      return draft;
    });
    refreshState();
    setIsEditingProfile(false);
  };

  return (
    <>
      {activeTab === "schedule" && (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-4xl border border-white bg-white/70 p-6 shadow-xl backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">My schedule</h2>
                <p className="text-sm font-bold text-slate-500">Month-based calendar with appointment counts.</p>
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
                      {cell.dayAppointments.length > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white shadow-lg shadow-blue-500/30">
                          {cell.dayAppointments.length}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-col gap-1 overflow-hidden">
                      {cell.dayAppointments.slice(0, 2).map((apt) => (
                        <div key={apt.id} className="truncate text-[9px] font-bold text-slate-500">
                          • {apt.appointmentTime}
                        </div>
                      ))}
                    </div>
                  </button>
                ) : (
                  <div key={`empty-${index}`} className="min-h-[5rem] rounded-2xl border border-transparent" />
                ),
              )}
            </div>
          </div>

          <div className="rounded-4xl border border-white bg-white/70 p-8 shadow-xl backdrop-blur-xl">
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">Today's patients and records</h2>
            <div className="mt-6 space-y-4">
              {myAppointments.length > 0 ? (
                myAppointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-2xl border border-slate-100 bg-white p-5 hover:bg-slate-50 transition-colors shadow-sm">
                    <p className="font-black text-slate-800 text-lg">
                      {state.patients.find((entry) => String(entry.id) === String(appointment.patientId))?.firstName || "Patient"} - {appointment.reason}
                    </p>
                    <p className="text-base font-bold text-slate-500 mt-1">{appointment.appointmentDate} at {appointment.appointmentTime}</p>
                    <p className="text-xs font-black uppercase text-blue-600 mt-1">{appointment.status}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      {appointment.status !== "completed" && (
                        <button onClick={() => markCompleted(appointment.id)} className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-black text-white shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">
                          MARK COMPLETED
                        </button>
                      )}
                      <button onClick={() => {
                        setPrescriptionValue("appointmentId", appointment.id);
                        setPrescriptionValue("patientId", appointment.patientId);
                        setHistoryValue("appointmentId", appointment.id);
                        setHistoryValue("patientId", appointment.patientId);
                        setActiveTab("records");
                      }} className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-black text-white shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">
                        ADD RECORD
                      </button>
                      <button onClick={() => sendReminder(appointment)} className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-2 text-xs font-black text-slate-600 hover:bg-slate-100 transition-all">
                        REMINDER
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-base font-bold text-slate-400 text-center">
                  No appointments found for your ID.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "records" && (
        <div className="grid gap-6 xl:grid-cols-2">
          <form onSubmit={handleSubmitPrescription(onSavePrescription)} className="rounded-4xl border border-white bg-white/70 p-8 shadow-xl backdrop-blur-xl">
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">Prescriptions</h2>
            <div className="mt-6 grid gap-3">
              <select {...registerPrescription("patientId")} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none">
                <option value="">Select patient</option>
                {state.patients.map((patient) => (
                  <option key={patient.id} value={patient.id} className="text-slate-900">{patient.firstName} {patient.lastName}</option>
                ))}
              </select>
              <select {...registerPrescription("appointmentId")} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none">
                <option value="">Select appointment</option>
                {myAppointments.map((appointment) => (
                  <option key={appointment.id} value={appointment.id} className="text-slate-900">
                    {state.patients.find(p => p.id === appointment.patientId)?.firstName || "Patient"} - {appointment.appointmentDate} {appointment.appointmentTime}
                  </option>
                ))}
              </select>
              <input {...registerPrescription("diagnosis")} placeholder="Diagnosis" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              <input {...registerPrescription("medicineName")} placeholder="Medicine name" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input {...registerPrescription("dosage")} placeholder="Dosage" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
                <input {...registerPrescription("duration")} placeholder="Duration" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              </div>
              <input {...registerPrescription("instructions")} placeholder="Instructions" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              <textarea {...registerPrescription("notes")} placeholder="Notes" className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            </div>
            <button type="submit" className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all">{editingPrescriptionId ? "UPDATE PRESCRIPTION" : "SAVE PRESCRIPTION"}</button>
          </form>

          <form onSubmit={handleSubmitHistory(onSaveHistory)} className="rounded-4xl border border-white bg-white/70 p-8 shadow-xl backdrop-blur-xl">
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">Medical history logs</h2>
            <div className="mt-6 grid gap-3">
              <select {...registerHistory("patientId")} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none">
                <option value="">Select patient</option>
                {state.patients.map((patient) => (
                  <option key={patient.id} value={patient.id} className="text-slate-900">{patient.firstName} {patient.lastName}</option>
                ))}
              </select>
              <select {...registerHistory("appointmentId")} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none">
                <option value="">Select appointment</option>
                {completedAppointments.map((appointment) => (
                  <option key={appointment.id} value={appointment.id} className="text-slate-900">
                    {state.patients.find(p => p.id === appointment.patientId)?.firstName || "Patient"} - {appointment.appointmentDate} {appointment.appointmentTime}
                  </option>
                ))}
              </select>
              <input {...registerHistory("condition")} placeholder="Condition" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              <textarea {...registerHistory("symptoms")} placeholder="Symptoms" className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              <textarea {...registerHistory("treatment")} placeholder="Treatment" className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              <textarea {...registerHistory("notes")} placeholder="Notes" className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            </div>
            <button type="submit" className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all">{editingHistoryId ? "UPDATE HISTORY" : "SAVE HISTORY"}</button>
          </form>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="rounded-4xl border border-white bg-white/70 p-8 shadow-xl backdrop-blur-xl">
          <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">Doctor profile</h2>
          {!isEditingProfile ? (
            <div className="mt-8 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-3xl bg-slate-50 border border-slate-100 p-6 flex flex-col items-center shadow-sm">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-blue-600 text-4xl font-black text-white shadow-xl shadow-blue-500/30 ring-4 ring-white">
                  {(currentUser.firstName?.[0] || "D") + (currentUser.lastName?.[0] || "")}
                </div>
                <h3 className="mt-6 text-2xl font-black text-slate-800">{currentUser.firstName} {currentUser.lastName}</h3>
                <p className="text-sm font-black uppercase tracking-widest text-blue-600 mt-1">{currentUser.specialization}</p>
                <div className="mt-6 w-full space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-400 uppercase tracking-tighter">Experience</span>
                    <span className="font-black text-slate-700">{currentUser.experience} Years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-slate-400 uppercase tracking-tighter">Degree</span>
                    <span className="font-black text-slate-700">{currentUser.degree}</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <EntityPill label="First name" value={currentUser.firstName || "-"} />
                <EntityPill label="Last name" value={currentUser.lastName || "-"} />
                <EntityPill label="Email" value={currentUser.email || "-"} />
                <EntityPill label="Phone number" value={currentUser.phoneNumber || "-"} />
                <EntityPill label="Age" value={currentUser.age || "-"} />
                <EntityPill label="Specialization" value={currentUser.specialization || "-"} />
                <div className="sm:col-span-2 flex justify-end mt-4">
                  <button onClick={() => setIsEditingProfile(true)} className="rounded-2xl bg-blue-600 px-8 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:bg-blue-500 active:scale-95">Update profile</button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={saveDoctorProfile} className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-black text-white">
                    {(doctorProfileForm.firstName?.[0] || "D") + (doctorProfileForm.lastName?.[0] || "")}
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-800">{doctorProfileForm.firstName || "Doctor"} {doctorProfileForm.lastName || ""}</p>
                    <p className="text-sm font-bold text-slate-500">ID: {currentUser.id}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={doctorProfileForm.firstName}
                  onChange={(event) => setDoctorProfileForm((prev) => ({ ...prev, firstName: event.target.value }))}
                  placeholder="First name"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none font-bold"
                />
                <input
                  value={doctorProfileForm.lastName}
                  onChange={(event) => setDoctorProfileForm((prev) => ({ ...prev, lastName: event.target.value }))}
                  placeholder="Last name"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none font-bold"
                />
                <input
                  value={doctorProfileForm.email}
                  readOnly
                  placeholder="Email"
                  className="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-400 outline-none font-bold"
                />
                <input
                  type="password"
                  value={doctorProfileForm.password}
                  onChange={(event) => setDoctorProfileForm((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="Password"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none font-bold"
                />
                <input
                  type="number"
                  value={doctorProfileForm.age}
                  onChange={(event) => setDoctorProfileForm((prev) => ({ ...prev, age: event.target.value }))}
                  placeholder="Age"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none font-bold"
                />
                <input
                  value={doctorProfileForm.phoneNumber}
                  onChange={(event) => setDoctorProfileForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                  placeholder="Phone number"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none font-bold"
                />
                 <input
                  value={doctorProfileForm.experience}
                  onChange={(event) => setDoctorProfileForm((prev) => ({ ...prev, experience: event.target.value }))}
                  placeholder="Experience"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none font-bold"
                />
                 <input
                  value={doctorProfileForm.specialization}
                  onChange={(event) => setDoctorProfileForm((prev) => ({ ...prev, specialization: event.target.value }))}
                  placeholder="Specialization"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none font-bold"
                />
                 <input
                  value={doctorProfileForm.degree}
                  onChange={(event) => setDoctorProfileForm((prev) => ({ ...prev, degree: event.target.value }))}
                  placeholder="Degree"
                  className="sm:col-span-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none font-bold"
                />

                <div className="sm:col-span-2 flex items-center gap-3">
                  <button type="submit" className="rounded-2xl bg-blue-600 px-8 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500">
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const stored = loadHospitalState().doctors.find((entry) => entry.id === currentUser.id) || currentUser;
                      setDoctorProfileForm(buildDoctorProfileForm(stored));
                      setIsEditingProfile(false);
                    }}
                    className="rounded-2xl border border-slate-200 px-8 py-3 text-sm font-black text-slate-500 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}

export default DoctorDashboard;
