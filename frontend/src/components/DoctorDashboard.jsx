import React, { useState, useMemo, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { 
  mutateHospitalState, 
  emptyPrescription, 
  emptyHistory, 
  formatDate, 
  formatMonthValue, 
  getMonthCells,
  searchHospitalEntities,
  buildReminderMailto
} from "../utils/hospitalState";
import EntityPill from "./EntityPill";
import SearchPanel from "./SearchPanel";

function DoctorDashboard({ activeTab, state, setActiveTab, currentUser, refreshState }) {
  const [calendarMonth, setCalendarMonth] = useState(formatMonthValue(new Date()));
  const [selectedDay, setSelectedDay] = useState("");
  const [editingPrescriptionId, setEditingPrescriptionId] = useState(null);
  const [editingHistoryId, setEditingHistoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { register: registerPrescription, handleSubmit: handleSubmitPrescription, reset: resetPrescription, setValue: setPrescriptionValue } = useForm({
    defaultValues: emptyPrescription
  });

  const { register: registerHistory, handleSubmit: handleSubmitHistory, reset: resetHistory, setValue: setHistoryValue } = useForm({
    defaultValues: emptyHistory
  });

  const myAppointments = useMemo(() => {
    // String cast BOTH IDs to ensure absolute matching
    const doctorId = String(currentUser?.id);
    const filtered = (state.appointments || []).filter((entry) => String(entry.doctorId) === doctorId);
    console.log("DoctorDashboard: Filtered appointments for ID", doctorId, filtered);
    return filtered;
  }, [state.appointments, currentUser?.id]);

  const selectedMonthCells = useMemo(() => getMonthCells(calendarMonth, myAppointments), [calendarMonth, myAppointments]);
  
  const filteredSearch = useMemo(() => searchHospitalEntities(state, searchQuery), [state, searchQuery]);

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
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">Today&apos;s patients and records</h2>
            <div className="mt-6 space-y-4">
              {myAppointments.length > 0 ? (
                myAppointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-2xl border border-slate-100 bg-white p-5 hover:bg-slate-50 transition-colors shadow-sm">
                    <p className="font-black text-slate-800 text-lg">
                      {state.patients.find((entry) => String(entry.id) === String(appointment.patientId))?.firstName || "Patient"} - {appointment.reason}
                    </p>
                    <p className="text-base font-bold text-slate-500 mt-1">{appointment.appointmentDate} at {appointment.appointmentTime}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button onClick={() => setActiveTab("records")} className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-black text-white shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">
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
                {state.appointments.map((appointment) => (
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
                {state.appointments.map((appointment) => (
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

          <div className="rounded-4xl border border-white bg-white/70 p-6 xl:col-span-2 shadow-xl backdrop-blur-xl">
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">Prescription and history log book</h2>
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <div className="space-y-3">
                {state.prescriptions.filter(p => p.doctorId === currentUser.id).map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-slate-100 bg-white p-4 flex justify-between items-start shadow-sm">
                    <div>
                      <p className="font-black text-slate-800">{entry.diagnosis}</p>
                      <p className="text-sm font-bold text-slate-500">{entry.medicines[0]?.name || "No medicines"}</p>
                    </div>
                    <button 
                      onClick={() => {
                        mutateHospitalState((draft) => {
                          draft.prescriptions = draft.prescriptions.filter((p) => p.id !== entry.id);
                          return draft;
                        });
                        refreshState();
                      }}
                      className="rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-600 hover:bg-rose-100 transition"
                      title="Delete prescription"
                    >
                      DELETE
                    </button>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {state.histories.filter(h => h.doctorId === currentUser.id).map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-slate-100 bg-white p-4 flex justify-between items-start shadow-sm">
                    <div>
                      <p className="font-black text-slate-800">{entry.condition}</p>
                      <p className="text-sm font-bold text-slate-500">{entry.treatment}</p>
                    </div>
                    <button 
                      onClick={() => {
                        mutateHospitalState((draft) => {
                          draft.histories = draft.histories.filter((h) => h.id !== entry.id);
                          return draft;
                        });
                        refreshState();
                      }}
                      className="rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-600 hover:bg-rose-100 transition"
                      title="Delete log"
                    >
                      DELETE
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "search" && (
        <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
          <h2 className="text-2xl font-black">Search</h2>
          <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search patients, doctors, appointments" className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <SearchPanel title="Patients" items={filteredSearch.patients} renderItem={(item) => `${item.firstName} ${item.lastName}`} />
            <SearchPanel title="Doctors" items={filteredSearch.doctors} renderItem={(item) => `Dr. ${item.firstName} ${item.lastName}`} />
            <SearchPanel title="Appointments" items={filteredSearch.appointments} renderItem={(item) => `${item.appointmentDate} ${item.reason}`} />
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
          <h2 className="text-2xl font-black">Doctor profile</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <EntityPill label="Name" value={`${currentUser.firstName} ${currentUser.lastName}`} />
            <EntityPill label="Specialization" value={currentUser.specialization} />
            <EntityPill label="Degree" value={currentUser.degree} />
          </div>
        </div>
      )}
    </>
  );
}

export default DoctorDashboard;