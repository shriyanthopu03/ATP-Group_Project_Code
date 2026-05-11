import React, { useState, useMemo } from 'react';
import { useForm } from "react-hook-form";
import { 
  mutateHospitalState, 
  emptyPrescription, 
  emptyHistory, 
  formatMonthValue, 
  getMonthCells,
  buildReminderMailto,
  buildDoctorProfileForm
} from "../utils/hospitalState";
import EntityPill from "./EntityPill";
import CalendarCell from "./CalendarCell";
import AppointmentListItem from "./AppointmentListItem";
import DoctorProfileForm from "./DoctorProfileForm";

const DoctorDashboard = ({ activeTab, state, setActiveTab, currentUser, refreshState }) => {
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
    return (state.appointments || []).filter((entry) => String(entry.doctorId) === doctorId);
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
              {selectedMonthCells.map((cell, index) => (
                <CalendarCell 
                  key={cell ? cell.currentDate : `empty-${index}`} 
                  cell={cell} 
                  selectedDay={selectedDay} 
                  setSelectedDay={setSelectedDay} 
                />
              ))}
            </div>
          </div>

          <div className="rounded-4xl border border-white bg-white/70 p-8 shadow-xl backdrop-blur-xl">
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">Today's patients and records</h2>
            <div className="mt-6 space-y-4">
              {myAppointments.length > 0 ? (
                myAppointments.map((appointment) => (
                  <AppointmentListItem 
                    key={appointment.id} 
                    appointment={appointment} 
                    state={state} 
                    markCompleted={markCompleted} 
                    sendReminder={sendReminder} 
                    setPrescriptionValue={setPrescriptionValue} 
                    setHistoryValue={setHistoryValue} 
                    setActiveTab={setActiveTab} 
                  />
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
                    {state.patients.find(p => p.id === appointment.patientId)?.firstName || "Patient"} - {appointment.appointmentDate}
                  </option>
                ))}
              </select>
              <input {...registerHistory("condition")} placeholder="Condition" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              <input {...registerHistory("treatment")} placeholder="Treatment" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
              <textarea {...registerHistory("notes")} placeholder="Detailed Notes" className="min-h-24 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400" />
            </div>
            <button type="submit" className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all">{editingHistoryId ? "UPDATE LOG" : "SAVE LOG"}</button>
          </form>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="rounded-4xl border border-white bg-white/70 p-8 shadow-xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">Doctor profile</h2>
              <p className="text-base font-bold text-slate-500 mt-1">Manage your professional details.</p>
            </div>
          </div>

          { !isEditingProfile ? (
            <div className="mt-8 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col items-center">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-4xl font-black text-white shadow-xl ring-4 ring-white">
                  {(currentUser.firstName?.[0] || "D") + (currentUser.lastName?.[0] || "")}
                </div>
                <h3 className="mt-6 text-2xl font-black text-slate-800">Dr. {currentUser.firstName} {currentUser.lastName}</h3>
                <p className="text-sm font-black uppercase tracking-widest text-blue-600 mt-1">Specialist</p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <EntityPill label="First name" value={currentUser.firstName || "-"} />
                <EntityPill label="Last name" value={currentUser.lastName || "-"} />
                <EntityPill label="Email" value={currentUser.email || "-"} />
                <EntityPill label="Specialization" value={currentUser.specialization || "-"} />
                <EntityPill label="Degree" value={currentUser.degree || "-"} />
                <EntityPill label="Experience" value={currentUser.experience || "-"} />
                <div className="sm:col-span-2 flex justify-end mt-4">
                  <button onClick={() => setIsEditingProfile(true)} className="rounded-2xl bg-blue-600 px-8 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:bg-blue-500 active:scale-95">Update Profile</button>
                </div>
              </div>
            </div>
          ) : (
            <DoctorProfileForm 
              doctorProfileForm={doctorProfileForm}
              setDoctorProfileForm={setDoctorProfileForm}
              saveDoctorProfile={saveDoctorProfile}
              setIsEditingProfile={setIsEditingProfile}
              currentUser={currentUser}
            />
          )}
        </div>
      )}
    </>
  );
};

export default DoctorDashboard;
