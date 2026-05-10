import { loadHospitalState, buildPatientProfileForm } from "./HospitalDashboard";
import EntityPill from "./EntityPill";
import Appointment from "./Appointment";

function PatientDashboard({
  activeTab,
  state,
  user,
  currentUser,
  appointmentForm,
  setAppointmentForm,
  saveAppointment,
  isEditingProfile,
  setIsEditingProfile,
  patientProfileForm,
  setPatientProfileForm,
  savePatientProfile,
}) {
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
          <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
            <h2 className="text-2xl font-black">Medical history</h2>
            <div className="mt-4 space-y-3">
              {state.histories.filter((entry) => entry.patientId === user.id).map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold text-white">{entry.condition}</p>
                  <p className="text-sm text-slate-300">{entry.treatment}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
            <h2 className="text-2xl font-black">Prescriptions</h2>
            <div className="mt-4 space-y-3">
              {state.prescriptions.filter((entry) => entry.patientId === user.id).map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold text-white">{entry.diagnosis}</p>
                  <p className="text-sm text-slate-300">{entry.medicines[0]?.name || "No medicine listed"}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">Patient profile</h2>
              <p className="text-sm text-slate-400">Edit your patient details here. Email stays read-only.</p>
            </div>
            <div className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white">
              {currentUser.isPatientActive ? "Active" : "Inactive"}
            </div>
          </div>

          { !isEditingProfile ? (
            <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-900 text-2xl font-black text-white">
                    {(currentUser.firstName?.[0] || "P") + (currentUser.lastName?.[0] || "")}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{currentUser.firstName} {currentUser.lastName}</p>
                    <p className="text-sm text-slate-400">Patient ID: {currentUser.id}</p>
                  </div>
                </div>

                {currentUser.profileImageUrl ? (
                  <img src={currentUser.profileImageUrl} alt={`${currentUser.firstName} ${currentUser.lastName}`} className="mt-5 h-56 w-full rounded-3xl object-cover" />
                ) : (
                  <div className="mt-5 flex h-56 items-center justify-center rounded-3xl border border-dashed border-white/10 text-sm text-slate-400">
                    No profile image provided.
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <EntityPill label="First name" value={currentUser.firstName || "-"} />
                <EntityPill label="Last name" value={currentUser.lastName || "-"} />
                <EntityPill label="Email" value={currentUser.email || "-"} />
                <EntityPill label="Phone number" value={currentUser.phoneNumber || "-"} />
                <EntityPill label="Age" value={currentUser.age || "-"} />
                <EntityPill label="Address" value={currentUser.address || "-"} />
                <div className="sm:col-span-2 flex justify-end">
                  <button onClick={() => setIsEditingProfile(true)} className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Update profile</button>
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

export default PatientDashboard