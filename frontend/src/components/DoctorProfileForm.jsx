import React from 'react';

const DoctorProfileForm = ({ doctorProfileForm, setDoctorProfileForm, saveDoctorProfile, setIsEditingProfile, currentUser }) => {
  return (
    <form onSubmit={saveDoctorProfile} className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-black text-white">
            {(doctorProfileForm.firstName?.[0] || "D") + (doctorProfileForm.lastName?.[0] || "")}
          </div>
          <div>
            <p className="text-lg font-black text-slate-800">
              Dr. {doctorProfileForm.firstName || ""} {doctorProfileForm.lastName || ""}
            </p>
            <p className="text-sm font-bold text-slate-500">ID: {currentUser.id}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">First name</span>
          <input
            value={doctorProfileForm.firstName}
            onChange={(event) => setDoctorProfileForm((prev) => ({ ...prev, firstName: event.target.value }))}
            placeholder="First name"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none font-bold placeholder:font-normal placeholder:text-slate-400"
          />
        </label>
        <label className="space-y-1.5">
          <span className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">Last name</span>
          <input
            value={doctorProfileForm.lastName}
            onChange={(event) => setDoctorProfileForm((prev) => ({ ...prev, lastName: event.target.value }))}
            placeholder="Last name"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none font-bold placeholder:font-normal placeholder:text-slate-400"
          />
        </label>
        <label className="space-y-1.5">
          <span className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">Email</span>
          <input
            value={doctorProfileForm.email}
            readOnly
            placeholder="Email"
            className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-400 outline-none font-bold"
          />
        </label>
        <label className="space-y-1.5">
          <span className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">Address</span>
          <input
            value={doctorProfileForm.address}
            onChange={(event) => setDoctorProfileForm((prev) => ({ ...prev, address: event.target.value }))}
            placeholder="Address"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none font-bold placeholder:font-normal placeholder:text-slate-400"
          />
        </label>
        <label className="space-y-1.5">
          <span className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">Age</span>
          <input
            type="number"
            value={doctorProfileForm.age}
            onChange={(event) => setDoctorProfileForm((prev) => ({ ...prev, age: event.target.value }))}
            placeholder="Age"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none font-bold placeholder:font-normal placeholder:text-slate-400"
          />
        </label>
        <label className="space-y-1.5">
          <span className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">Experience</span>
          <input
            value={doctorProfileForm.experience}
            onChange={(event) => setDoctorProfileForm((prev) => ({ ...prev, experience: event.target.value }))}
            placeholder="Experience"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none font-bold placeholder:font-normal placeholder:text-slate-400"
          />
        </label>
        <label className="space-y-1.5">
          <span className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">Specialization</span>
          <input
            value={doctorProfileForm.specialization}
            onChange={(event) => setDoctorProfileForm((prev) => ({ ...prev, specialization: event.target.value }))}
            placeholder="Specialization"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none font-bold placeholder:font-normal placeholder:text-slate-400"
          />
        </label>
        <label className="space-y-1.5">
          <span className="ml-1 text-xs font-black uppercase tracking-widest text-slate-400">Degree</span>
          <input
            value={doctorProfileForm.degree}
            onChange={(event) => setDoctorProfileForm((prev) => ({ ...prev, degree: event.target.value }))}
            placeholder="Degree"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none font-bold placeholder:font-normal placeholder:text-slate-400"
          />
        </label>
        <div className="sm:col-span-2 flex items-center gap-3">
          <button type="submit" className="rounded-2xl bg-blue-600 px-8 py-3 text-sm font-black text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 active:scale-95 transition-all">
            Update
          </button>
          <button
            type="button"
            onClick={() => setIsEditingProfile(false)}
            className="rounded-2xl border border-slate-200 px-8 py-3 text-sm font-black text-slate-500 hover:bg-slate-50 active:scale-95 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}

export default DoctorProfileForm;

