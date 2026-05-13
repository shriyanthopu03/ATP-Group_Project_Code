import { useState, useMemo } from 'react';
import { useForm } from "react-hook-form";
import { 
  mutateHospitalState, 
  emptyPrescription, 
  formatMonthValue, 
  getMonthCells,
  buildDoctorProfileForm
} from "../utils/hospitalState";
import { useAuth } from "../store/authStore";
import EntityPill from "./EntityPill";
import CalendarCell from "./CalendarCell";
import AppointmentListItem from "./AppointmentListItem";
import DoctorProfileForm from "./DoctorProfileForm";

const DoctorDashboard = ({ activeTab, state, setActiveTab, currentUser, refreshState }) => {
  const [calendarMonth, setCalendarMonth] = useState(formatMonthValue(new Date()));
  const [selectedDay, setSelectedDay] = useState("");
  const [editingPrescriptionId, setEditingPrescriptionId] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [doctorProfileForm, setDoctorProfileForm] = useState(() => buildDoctorProfileForm(currentUser));
  const savePrescriptionApi = useAuth((state) => state.savePrescription);
  const updateAppointmentStatus = useAuth((state) => state.updateAppointmentStatus);
  const updateDoctor = useAuth((state) => state.updateDoctor);

  const { register: registerPrescription, handleSubmit: handleSubmitPrescription, reset: resetPrescription, setValue: setPrescriptionValue } = useForm({
    defaultValues: emptyPrescription
  });

  const myAppointments = useMemo(() => {
    const doctorId = String(currentUser?._id || currentUser?.id);
    return (state.appointments || []).filter((entry) => String(entry.doctorId) === doctorId);
  }, [state.appointments, currentUser?._id, currentUser?.id]);

  const completedAppointments = useMemo(() => {
    return myAppointments.filter(apt => apt.status === "completed");
  }, [myAppointments]);

  const selectedMonthCells = useMemo(() => getMonthCells(calendarMonth, myAppointments), [calendarMonth, myAppointments]);
  
  const selectedDayAppointments = useMemo(() => {
    if (!selectedDay) return [];
    return myAppointments.filter(apt => {
      const aptDate = String(apt.appointmentDate || "").split('T')[0];
      return aptDate === selectedDay;
    });
  }, [selectedDay, myAppointments]);

  const sendReminder = null;

  const markCompleted = async (appointmentId) => {
    try {
      await updateAppointmentStatus(appointmentId, "completed");
      mutateHospitalState((draft) => {
        draft.appointments = draft.appointments.map((entry) =>
          entry.id === appointmentId ? { ...entry, status: "completed", isActive: false } : entry,
        );
        return draft;
      });
      refreshState();
    } catch (err) {
      alert("Failed to mark appointment as completed: " + err.message);
    }
  };

  const onSavePrescription = async (data) => {
    try {
      const payload = {
        appointmentId: data.appointmentId,
        patient: data.patientId,
        doctor: currentUser?._id || currentUser?.id,
        diagnosis: data.diagnosis,
        medicines: data.medicineName ? [
          {
            name: data.medicineName,
            dosage: data.dosage,
            duration: data.duration,
            instructions: data.instructions,
          }
        ] : [],
        notes: data.notes,
        prescribedAt: new Date().toISOString()
      };

      const savedPrescriptionResponse = await savePrescriptionApi(payload);
      const savedPrescriptionId = savedPrescriptionResponse?.payload?._id || savedPrescriptionResponse?.payload?.id;

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
          id: savedPrescriptionId || `${Date.now()}`,
          appointmentId: data.appointmentId,
          patientId: data.patientId,
          doctorId: currentUser?._id || currentUser?.id,
          diagnosis: data.diagnosis,
          medicines,
          notes: data.notes,
          prescribedAt: new Date().toISOString(),
        });

        const lastPrescription = draft.prescriptions[draft.prescriptions.length - 1];
        draft.appointments = draft.appointments.map((entry) =>
          String(entry.id) === String(data.appointmentId)
            ? { ...entry, prescriptionId: savedPrescriptionId || lastPrescription?.id || entry.prescriptionId }
            : entry,
        );
        return draft;
      });
      
      refreshState();
      setEditingPrescriptionId(null);
      resetPrescription(emptyPrescription);
      alert("Prescription saved to database successfully!");
    } catch (err) {
      console.error("Prescription error:", err);
      alert("Failed to save prescription: " + err.message);
    }
  };

  const saveDoctorProfile = async (event) => {
    event.preventDefault();
    try {
      const doctorId = currentUser?._id || currentUser?.id;
      const payload = {
        firstName: doctorProfileForm.firstName,
        lastName: doctorProfileForm.lastName,
        phoneNumber: doctorProfileForm.phoneNumber,
        age: Number(doctorProfileForm.age) || undefined,
        address: doctorProfileForm.address || undefined,
      };

      if (updateDoctor) {
        await updateDoctor(doctorId, payload);
      }

      mutateHospitalState((draft) => {
        draft.doctors = draft.doctors.map((entry) =>
          entry.id === currentUser.id
            ? { ...entry, firstName: payload.firstName, lastName: payload.lastName, phoneNumber: payload.phoneNumber, age: payload.age, address: payload.address }
            : entry,
        );

        draft.users = draft.users.map((entry) =>
          entry.id === currentUser.id
            ? { ...entry, firstName: payload.firstName, lastName: payload.lastName }
            : entry,
        );
        return draft;
      });

      refreshState();
      setIsEditingProfile(false);
      alert("Profile updated successfully");
    } catch (err) {
      console.error("Failed to update profile:", err);
      alert("Failed to update profile: " + (err.message || err));
    }
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
            {/* Added legend to clarify count meanings */}
            <div className="mt-6 flex items-center gap-4 border-t border-slate-100 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-600 shadow-sm" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Number of Appointments</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full border border-blue-400 bg-blue-50" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Selected Day</span>
              </div>
            </div>
          </div>

          <div className="rounded-4xl border border-white bg-white/70 p-8 shadow-xl backdrop-blur-xl">
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
              {selectedDay ? `Appointments for ${selectedDay}` : "Today's patients and records"}
            </h2>
            <div className="mt-6 space-y-4">
              {(selectedDay ? selectedDayAppointments : myAppointments).length > 0 ? (
                (selectedDay ? selectedDayAppointments : myAppointments).map((appointment) => (
                  <AppointmentListItem 
                    key={appointment.id} 
                    appointment={appointment} 
                    state={state} 
                    markCompleted={markCompleted} 
                    sendReminder={sendReminder} 
                    setPrescriptionValue={setPrescriptionValue} 
                    setActiveTab={setActiveTab} 
                  />
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-base font-bold text-slate-400 text-center">
                  {selectedDay ? `No appointments found for ${selectedDay}.` : "No appointments found for your ID."}
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

          <div className="xl:col-span-2 rounded-4xl border border-white bg-white/70 p-8 shadow-xl backdrop-blur-xl">
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">Previous appointments</h2>
            <div className="mt-6 space-y-4">
              {completedAppointments.length > 0 ? (
                completedAppointments.map((appointment) => {
                  const patient = state.patients.find((entry) => String(entry.id) === String(appointment.patientId));

                  return (
                    <div key={appointment.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                      <p className="font-black text-slate-800 text-lg">
                        {patient?.firstName || "Patient"} {patient?.lastName || ""}
                      </p>
                      <p className="text-base font-bold text-slate-500 mt-1">
                        {appointment.appointmentDate} at {appointment.appointmentTime || "--:--"}
                      </p>
                      <p className="text-sm font-bold text-slate-600 mt-1 truncate">
                        {appointment.reason || "No reason provided"}
                      </p>
                      <p className="mt-2 text-xs font-black uppercase text-emerald-600">Completed</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm font-bold text-slate-400">No completed appointments yet.</p>
              )}
            </div>
          </div>
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
