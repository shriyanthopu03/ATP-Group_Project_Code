import React, { useState, useMemo } from 'react';
import { Trash2 } from "lucide-react";
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
  const [prescriptionForm, setPrescriptionForm] = useState(emptyPrescription);
  const [editingHistoryId, setEditingHistoryId] = useState(null);
  const [historyForm, setHistoryForm] = useState(emptyHistory);
  const [searchQuery, setSearchQuery] = useState("");

  const myAppointments = useMemo(() => {
    // String cast BOTH IDs to ensure absolute matching
    const doctorId = String(currentUser?.id);
    const filtered = (state.appointments || []).filter((entry) => String(entry.doctorId) === doctorId);
    console.log("DoctorDashboard: Filtered appointments for ID", doctorId, filtered);
    return filtered;
  }, [state.appointments, currentUser.id]);

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

  const savePrescription = (event) => {
    event.preventDefault();
    mutateHospitalState((draft) => {
      const medicines = prescriptionForm.medicineName
        ? [
          {
            name: prescriptionForm.medicineName,
            dosage: prescriptionForm.dosage,
            duration: prescriptionForm.duration,
            instructions: prescriptionForm.instructions,
          },
        ]
        : [];

      if (editingPrescriptionId) {
        draft.prescriptions = draft.prescriptions.map((entry) =>
          entry.id === editingPrescriptionId
            ? { ...entry, diagnosis: prescriptionForm.diagnosis, medicines, notes: prescriptionForm.notes }
            : entry,
        );
        return draft;
      }

      draft.prescriptions.push({
        id: `${Date.now()}`,
        appointmentId: prescriptionForm.appointmentId,
        patientId: prescriptionForm.patientId,
        doctorId: currentUser.id,
        diagnosis: prescriptionForm.diagnosis,
        medicines,
        notes: prescriptionForm.notes,
        prescribedAt: new Date().toISOString(),
      });
      return draft;
    });
    refreshState();
    setEditingPrescriptionId(null);
    setPrescriptionForm(emptyPrescription);
  };

  const saveHistory = (event) => {
    event.preventDefault();
    mutateHospitalState((draft) => {
      if (editingHistoryId) {
        draft.histories = draft.histories.map((entry) => (entry.id === editingHistoryId ? { ...entry, ...historyForm } : entry));
        return draft;
      }

      draft.histories.push({
        id: `${Date.now()}`,
        ...historyForm,
        doctorId: currentUser.id,
        visitDate: new Date().toISOString(),
      });
      return draft;
    });
    refreshState();
    setEditingHistoryId(null);
    setHistoryForm(emptyHistory);
  };

  return (
    <>
      {activeTab === "schedule" && (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">My schedule</h2>
                <p className="text-sm text-slate-400">Month-based calendar with appointment counts.</p>
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
                      {cell.dayAppointments.length > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                          {cell.dayAppointments.length}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-col gap-1 overflow-hidden">
                      {cell.dayAppointments.slice(0, 2).map((apt) => (
                        <div key={apt.id} className="truncate text-[9px] text-zinc-400">
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

          <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
            <h2 className="text-2xl font-black bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Today&apos;s patients and records</h2>
            <div className="mt-6 space-y-4">
              {myAppointments.length > 0 ? (
                myAppointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-2xl border border-white/5 bg-white/5 p-5 transition-hover hover:bg-white/10">
                    <p className="font-black text-white brightness-150 text-lg">
                      {state.patients.find((entry) => String(entry.id) === String(appointment.patientId))?.firstName || "Patient"} - {appointment.reason}
                    </p>
                    <p className="text-base font-bold text-slate-300 mt-1">{appointment.appointmentDate} at {appointment.appointmentTime}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button onClick={() => setActiveTab("records")} className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-black text-white shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">
                        ADD RECORD
                      </button>
                      <button onClick={() => sendReminder(appointment)} className="rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-xs font-black text-slate-200 hover:bg-white/10 transition-all">
                        REMINDER
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-base font-bold text-slate-500 text-center">
                  No appointments found for your ID.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "records" && (
        <div className="grid gap-6 xl:grid-cols-2">
          <form onSubmit={savePrescription} className="rounded-4xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
            <h2 className="text-2xl font-black bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Prescriptions</h2>
            <div className="mt-4 grid gap-3">
              <select value={prescriptionForm.patientId} onChange={(event) => setPrescriptionForm((prev) => ({ ...prev, patientId: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none">
                <option value="">Select patient</option>
                {state.patients.map((patient) => (
                  <option key={patient.id} value={patient.id} className="text-slate-950">{patient.firstName} {patient.lastName}</option>
                ))}
              </select>
              <select value={prescriptionForm.appointmentId} onChange={(event) => setPrescriptionForm((prev) => ({ ...prev, appointmentId: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none">
                <option value="">Select appointment</option>
                {state.appointments.map((appointment) => (
                  <option key={appointment.id} value={appointment.id} className="text-slate-950">
                    {state.patients.find(p => p.id === appointment.patientId)?.firstName || "Patient"} - {appointment.appointmentDate} {appointment.appointmentTime}
                  </option>
                ))}
              </select>
              <input value={prescriptionForm.diagnosis} onChange={(event) => setPrescriptionForm((prev) => ({ ...prev, diagnosis: event.target.value }))} placeholder="Diagnosis" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
              <input value={prescriptionForm.medicineName} onChange={(event) => setPrescriptionForm((prev) => ({ ...prev, medicineName: event.target.value }))} placeholder="Medicine name" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={prescriptionForm.dosage} onChange={(event) => setPrescriptionForm((prev) => ({ ...prev, dosage: event.target.value }))} placeholder="Dosage" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
                <input value={prescriptionForm.duration} onChange={(event) => setPrescriptionForm((prev) => ({ ...prev, duration: event.target.value }))} placeholder="Duration" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
              </div>
              <input value={prescriptionForm.instructions} onChange={(event) => setPrescriptionForm((prev) => ({ ...prev, instructions: event.target.value }))} placeholder="Instructions" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
              <textarea value={prescriptionForm.notes} onChange={(event) => setPrescriptionForm((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Notes" className="min-h-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
            </div>
            <button type="submit" className="mt-4 rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">{editingPrescriptionId ? "Update prescription" : "Save prescription"}</button>
          </form>

          <form onSubmit={saveHistory} className="rounded-4xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
            <h2 className="text-2xl font-black bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Medical history logs</h2>
            <div className="mt-4 grid gap-3">
              <select value={historyForm.patientId} onChange={(event) => setHistoryForm((prev) => ({ ...prev, patientId: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none">
                <option value="">Select patient</option>
                {state.patients.map((patient) => (
                  <option key={patient.id} value={patient.id} className="text-slate-950">{patient.firstName} {patient.lastName}</option>
                ))}
              </select>
              <select value={historyForm.appointmentId} onChange={(event) => setHistoryForm((prev) => ({ ...prev, appointmentId: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none">
                <option value="">Select appointment</option>
                {state.appointments.map((appointment) => (
                  <option key={appointment.id} value={appointment.id} className="text-slate-950">
                    {state.patients.find(p => p.id === appointment.patientId)?.firstName || "Patient"} - {appointment.appointmentDate} {appointment.appointmentTime}
                  </option>
                ))}
              </select>
              <input value={historyForm.condition} onChange={(event) => setHistoryForm((prev) => ({ ...prev, condition: event.target.value }))} placeholder="Condition" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
              <textarea value={historyForm.symptoms} onChange={(event) => setHistoryForm((prev) => ({ ...prev, symptoms: event.target.value }))} placeholder="Symptoms" className="min-h-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
              <textarea value={historyForm.treatment} onChange={(event) => setHistoryForm((prev) => ({ ...prev, treatment: event.target.value }))} placeholder="Treatment" className="min-h-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
              <textarea value={historyForm.notes} onChange={(event) => setHistoryForm((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Notes" className="min-h-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
            </div>
            <button type="submit" className="mt-4 rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">{editingHistoryId ? "Update history" : "Save history"}</button>
          </form>

          <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6 xl:col-span-2">
            <h2 className="text-2xl font-black">Prescription and history log book</h2>
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <div className="space-y-3">
                {state.prescriptions.filter(p => p.doctorId === currentUser.id).map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-white">{entry.diagnosis}</p>
                      <p className="text-sm text-slate-300">{entry.medicines[0]?.name || "No medicines"}</p>
                    </div>
                    <button 
                      onClick={() => {
                        mutateHospitalState((draft) => {
                          draft.prescriptions = draft.prescriptions.filter((p) => p.id !== entry.id);
                          return draft;
                        });
                        refreshState();
                      }}
                      className="rounded-full bg-rose-500/10 p-2 text-rose-500 hover:bg-rose-500 hover:text-white transition"
                      title="Delete prescription"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {state.histories.filter(h => h.doctorId === currentUser.id).map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-white">{entry.condition}</p>
                      <p className="text-sm text-slate-300">{entry.treatment}</p>
                    </div>
                    <button 
                      onClick={() => {
                        mutateHospitalState((draft) => {
                          draft.histories = draft.histories.filter((h) => h.id !== entry.id);
                          return draft;
                        });
                        refreshState();
                      }}
                      className="rounded-full bg-rose-500/10 p-2 text-rose-500 hover:bg-rose-500 hover:text-white transition"
                      title="Delete log"
                    >
                      <Trash2 size={14} />
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