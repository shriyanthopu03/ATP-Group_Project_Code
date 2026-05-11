import React, { useState } from 'react';
import { loadHospitalState, mutateHospitalState, buildPatientProfileForm, emptyAppointment } from "../utils/hospitalState";
import EntityPill from "./EntityPill";
import Appointment from "./appointment";

function PatientDashboard({ activeTab, state, user, currentUser, refreshState }) {
  const [appointmentForm, setAppointmentForm] = useState({ ...emptyAppointment, patientId: user.id });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [patientProfileForm, setPatientProfileForm] = useState(() => buildPatientProfileForm(currentUser));

  const saveAppointment = (event) => {
    event.preventDefault();
    console.log("Saving appointment with form data:", appointmentForm);
    
    if (!appointmentForm.doctorId) {
      alert("Please select a doctor.");
      return;
    }

    mutateHospitalState((draft) => {
      // Create new appointment object FIRST
      const newAppointment = {
        ...appointmentForm,
        id: `${Date.now()}`,
        reminderSent: false,
        status: "scheduled"
      };

      console.log("Adding appointment to draft:", newAppointment);

      // Push a CLONE to ensure no reference issues
      draft.appointments.push(JSON.parse(JSON.stringify(newAppointment)));
      return draft;
    });
    
    console.log("Mutation complete, triggering refreshState");
    setAppointmentForm({ ...emptyAppointment, patientId: user.id });
    refreshState();
  };

  const savePatientProfile = (event) => {
    event.preventDefault();
    mutateHospitalState((draft) => {
      draft.patients = draft.patients.map((entry) =>
        entry.id === user.id
          ? {
            ...entry,
            firstName: patientProfileForm.firstName,
            lastName: patientProfileForm.lastName,
            password: patientProfileForm.password || entry.password,
            age: Number(patientProfileForm.age),
            phoneNumber: patientProfileForm.phoneNumber,
            address: patientProfileForm.address,
            profileImageUrl: patientProfileForm.profileImageUrl,
          }
          : entry,
      );

      draft.users = draft.users.map((entry) =>
        entry.id === user.id
          ? {
            ...entry,
            firstName: patientProfileForm.firstName,
            lastName: patientProfileForm.lastName,
            password: patientProfileForm.password || entry.password,
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
          <div className="rounded-4xl border border-white bg-white/70 p-8 shadow-xl backdrop-blur-xl">
            <h2 className="text-2xl font-black bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">Medical history</h2>
            <div className="mt-6 space-y-4">
              {state.histories.filter((entry) => entry.patientId === user.id).map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-slate-100 bg-white p-5 hover:bg-slate-50 transition-colors shadow-sm">
                  <p className="font-black text-slate-800 text-lg">{entry.condition}</p>
                  <p className="text-base font-bold text-slate-500 mt-1">{entry.treatment}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-4xl border border-white bg-white/70 p-8 shadow-xl backdrop-blur-xl">
            <h2 className="text-2xl font-black bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">Prescriptions</h2>
            <div className="mt-6 space-y-4">
              {state.prescriptions.filter((entry) => entry.patientId === user.id).map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-slate-100 bg-white p-5 hover:bg-slate-50 transition-colors shadow-sm">
                  <p className="font-black text-slate-800 text-lg">{entry.diagnosis}</p>
                  <p className="text-base font-bold text-slate-500 mt-1">{entry.medicines[0]?.name || "No medicine listed"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="rounded-4xl border border-white bg-white/70 p-8 shadow-xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">Patient profile</h2>
              <p className="text-base font-bold text-slate-500 mt-1">Edit your patient details here. Email stays read-only.</p>
            </div>
            <div className="rounded-full bg-blue-100 border border-blue-200 px-6 py-2 text-sm font-black text-blue-600">
              {currentUser.isPatientActive ? "ACTIVE" : "INACTIVE"}
            </div>
          </div>

          { !isEditingProfile ? (
            <div className="mt-8 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-3xl font-black text-white shadow-lg ring-4 ring-white">
                    {(currentUser.firstName?.[0] || "P") + (currentUser.lastName?.[0] || "")}
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">{currentUser.firstName} {currentUser.lastName}</p>
                    <p className="text-base font-bold text-slate-400">Patient ID: {currentUser.id}</p>
                  </div>
                </div>

                {currentUser.profileImageUrl ? (
                  <img src={currentUser.profileImageUrl} alt={`${currentUser.firstName} ${currentUser.lastName}`} className="mt-6 h-64 w-full rounded-3xl object-cover shadow-md ring-1 ring-slate-100" />
                ) : (
                  <div className="mt-6 flex h-64 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-base font-bold text-slate-400">
                    No profile image provided.
                  </div>
                )}
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
          <form onSubmit={savePatientProfile} className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-900 text-2xl font-black text-white">
                  {(patientProfileForm.firstName?.[0] || "P") + (patientProfileForm.lastName?.[0] || "")}
                </div>
                <div>
                  <p className="text-lg font-bold text-white">{patientProfileForm.firstName || "Patient"} {patientProfileForm.lastName || ""}</p>
                  <p className="text-sm text-slate-400">Patient ID: {currentUser.id}</p>
                </div>
              </div>

              {patientProfileForm.profileImageUrl ? (
                <img src={patientProfileForm.profileImageUrl} alt={`${patientProfileForm.firstName} ${patientProfileForm.lastName}`} className="mt-5 h-56 w-full rounded-3xl object-cover" />
              ) : (
                <div className="mt-5 flex h-56 items-center justify-center rounded-3xl border border-dashed border-white/10 text-sm text-slate-400">Add a profile image URL to preview it here.</div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={patientProfileForm.firstName}
                onChange={(event) => setPatientProfileForm((prev) => ({ ...prev, firstName: event.target.value }))}
                placeholder="First name"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
              />
              <input
                value={patientProfileForm.lastName}
                onChange={(event) => setPatientProfileForm((prev) => ({ ...prev, lastName: event.target.value }))}
                placeholder="Last name"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
              />
              <input
                value={patientProfileForm.email}
                readOnly
                placeholder="Email"
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-400 outline-none"
              />
              <input
                type="password"
                value={patientProfileForm.password}
                onChange={(event) => setPatientProfileForm((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="Password"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
              />
              <input
                type="number"
                value={patientProfileForm.age}
                onChange={(event) => setPatientProfileForm((prev) => ({ ...prev, age: event.target.value }))}
                placeholder="Age"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
              />
              <input
                value={patientProfileForm.phoneNumber}
                onChange={(event) => setPatientProfileForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                placeholder="Phone number"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
              />
              <input
                value={patientProfileForm.address}
                onChange={(event) => setPatientProfileForm((prev) => ({ ...prev, address: event.target.value }))}
                placeholder="Address"
                className="sm:col-span-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
              />
              <input
                value={patientProfileForm.profileImageUrl}
                onChange={(event) => setPatientProfileForm((prev) => ({ ...prev, profileImageUrl: event.target.value }))}
                placeholder="Profile image URL"
                className="sm:col-span-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
              />

              <div className="sm:col-span-2 flex items-center gap-3">
                <button type="submit" className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                  Update
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // revert draft to persisted values
                    const stored = loadHospitalState().patients.find((entry) => entry.id === user.id) || currentUser;
                    setPatientProfileForm(buildPatientProfileForm(stored));
                    setIsEditingProfile(false);
                  }}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200"
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

export default PatientDashboard;