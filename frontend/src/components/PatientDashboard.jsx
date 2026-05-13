import React, { useState } from 'react';
import { loadHospitalState, mutateHospitalState, buildPatientProfileForm, emptyAppointment } from "../utils/hospitalState";
import { useAuth } from "../store/authStore";
import EntityPill from "./EntityPill";
import Appointment from "./appointment";
import HistoryCard from "./HistoryCard";
import PrescriptionCard from "./PrescriptionCard";
import PatientProfileForm from "./PatientProfileForm";

const PatientDashboard = ({ activeTab, state, user, currentUser, refreshState }) => {
  const [appointmentForm, setAppointmentForm] = useState({ ...emptyAppointment, patientId: user.id });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [patientProfileForm, setPatientProfileForm] = useState(() => buildPatientProfileForm(currentUser));
  const bookAppointment = useAuth((state) => state.bookAppointment);
  const updatePatient = useAuth((state) => state.updatePatient);

  const saveAppointment = async (event) => {
    event.preventDefault();
    if (!appointmentForm.doctorId) {
      alert("Please select a doctor.");
      return;
    }

    try {
      // Save to Database
      // Use currentUser._id specifically to ensure we send the real database ID
      const dbResponse = await bookAppointment({
        ...appointmentForm,
        patientId: currentUser?._id || user?.id
      });

      // Save to Local State
      mutateHospitalState((draft) => {
        const newAppointment = {
          ...appointmentForm,
          id: dbResponse.payload?._id || dbResponse.payload?.id || `${Date.now()}`,
          reminderSent: false,
          status: "scheduled"
        };
        draft.appointments.push(JSON.parse(JSON.stringify(newAppointment)));
        return draft;
      });
      
      setAppointmentForm({ ...emptyAppointment, patientId: user.id });
      refreshState();
      alert("Appointment booked successfully!");
    } catch (err) {
      console.error("Booking error:", err);
      alert("Failed to book appointment: " + err.message);
    }
  };

  const savePatientProfile = async (event) => {
    event.preventDefault();
    try {
      const patientId = currentUser?._id || user?.id;
      const payload = {
        firstName: patientProfileForm.firstName,
        lastName: patientProfileForm.lastName,
        phoneNumber: patientProfileForm.phoneNumber,
        age: Number(patientProfileForm.age) || undefined,
        address: patientProfileForm.address || undefined,
      };

      if (updatePatient) {
        await updatePatient(patientId, payload);
      }

      mutateHospitalState((draft) => {
        draft.patients = draft.patients.map((entry) =>
          entry.id === user.id
            ? { ...entry, firstName: payload.firstName, lastName: payload.lastName, phoneNumber: payload.phoneNumber, age: payload.age, address: payload.address }
            : entry,
        );

        draft.users = draft.users.map((entry) =>
          entry.id === user.id
            ? { ...entry, firstName: payload.firstName, lastName: payload.lastName }
            : entry,
        );
        return draft;
      });

      refreshState();
      setIsEditingProfile(false);
      alert("Profile updated successfully");
    } catch (err) {
      console.error("Failed to update patient profile:", err);
      alert("Failed to update patient profile: " + (err.message || err));
    }
  };

  return (
    <>
      {activeTab === "book" && (
        <Appointment
          saveAppointment={saveAppointment}
          appointmentForm={appointmentForm}
          setAppointmentForm={setAppointmentForm}
          state={state}
        />
      )}

      {activeTab === "records" && (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="rounded-4xl border border-white bg-white/70 p-8 shadow-xl backdrop-blur-xl text-slate-800">
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">Medical history</h2>
            <div className="mt-6 space-y-4">
              {state.histories.filter((entry) => String(entry.patientId) === String(user.id)).map((entry) => (
                <HistoryCard key={entry.id} history={entry} />
              ))}
            </div>
          </div>

          <div className="rounded-4xl border border-white bg-white/70 p-8 shadow-xl backdrop-blur-xl text-slate-800">
            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">Prescriptions</h2>
            <div className="mt-6 space-y-4">
              {state.prescriptions.filter((entry) => String(entry.patientId) === String(currentUser?._id || user?.id)).map((entry) => (
                <PrescriptionCard key={entry.id} prescription={entry} />
              ))}
              {state.prescriptions.filter((entry) => String(entry.patientId) === String(currentUser?._id || user?.id)).length === 0 && (
                <p className="text-slate-400 font-bold text-center py-4">No prescriptions found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="rounded-4xl border border-white bg-white/70 p-8 shadow-xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">Patient profile</h2>
              <p className="text-base font-bold text-slate-500 mt-1">Manage your health profile details.</p>
            </div>
          </div>

          { !isEditingProfile ? (
            <div className="mt-8 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col items-center">
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-4xl font-black text-white shadow-xl ring-4 ring-white">
                  {(currentUser.firstName?.[0] || "P") + (currentUser.lastName?.[0] || "")}
                </div>
                <h3 className="mt-6 text-2xl font-black text-slate-800">{currentUser.firstName} {currentUser.lastName}</h3>
                <p className="text-sm font-black uppercase tracking-widest text-blue-600 mt-1">Patient</p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <EntityPill label="First name" value={currentUser.firstName || "-"} />
                <EntityPill label="Last name" value={currentUser.lastName || "-"} />
                <EntityPill label="Email" value={currentUser.email || "-"} />
                <EntityPill label="Phone number" value={currentUser.phoneNumber || "-"} />
                <EntityPill label="Age" value={currentUser.age || "-"} />
                <EntityPill label="Address" value={currentUser.address || "-"} />
                <div className="sm:col-span-2 flex justify-end mt-4">
                  <button onClick={() => setIsEditingProfile(true)} className="rounded-2xl bg-blue-600 px-8 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:bg-blue-500 active:scale-95">Update profile</button>
                </div>
              </div>
            </div>
          ) : (
            <PatientProfileForm 
              patientProfileForm={patientProfileForm}
              setPatientProfileForm={setPatientProfileForm}
              savePatientProfile={savePatientProfile}
              setIsEditingProfile={setIsEditingProfile}
              currentUser={currentUser}
            />
          )}
        </div>
      )}
    </>
  );
};

export default PatientDashboard;
