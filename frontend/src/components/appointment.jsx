import React from 'react';

const Appointment = ({ saveAppointment, appointmentForm, setAppointmentForm, state }) => {
  return (
    <div className="rounded-4xl border border-white bg-white/70 p-8 shadow-xl backdrop-blur-xl">
      <form onSubmit={saveAppointment}>
        <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">Book appointment</h2>
        <p className="text-base font-bold text-slate-500 mt-1 mb-6">Schedule your visit with our specialists.</p>
        
        <div className="grid gap-4">
          <div className="relative">
            <select 
              value={appointmentForm.doctorId} 
              onChange={(event) => {
                setAppointmentForm((prev) => ({ ...prev, doctorId: event.target.value }));
              }} 
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/5 transition-all appearance-none"
              required
            >
              <option value="" className="text-slate-400">Select doctor</option>
              {state.doctors.map((doctor) => {
                const doctorId = doctor._id || doctor.id;
                return (
                  <option key={doctorId} value={doctorId} className="text-slate-900">
                    Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                  </option>
                );
              })}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Date</label>
              <input 
                type="date" 
                value={appointmentForm.appointmentDate} 
                onChange={(event) => setAppointmentForm((prev) => ({ ...prev, appointmentDate: event.target.value }))} 
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-400 transition-all" 
                required 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Time</label>
              <input 
                type="time" 
                value={appointmentForm.appointmentTime} 
                onChange={(event) => setAppointmentForm((prev) => ({ ...prev, appointmentTime: event.target.value }))} 
                className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-400 transition-all" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Reason for visit</label>
            <input 
              type="text" 
              placeholder="e.g. Annual Checkup" 
              value={appointmentForm.reason} 
              onChange={(event) => setAppointmentForm((prev) => ({ ...prev, reason: event.target.value }))} 
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-400 transition-all placeholder:text-slate-300 placeholder:font-normal" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Additional Notes</label>
            <textarea 
              placeholder="Any specific symptoms or information..." 
              value={appointmentForm.notes} 
              onChange={(event) => setAppointmentForm((prev) => ({ ...prev, notes: event.target.value }))} 
              className="w-full min-h-[120px] rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-400 transition-all placeholder:text-slate-300 placeholder:font-normal" 
            />
          </div>
        </div>

        <button 
          type="submit" 
          className="mt-8 w-full rounded-2xl bg-blue-600 py-4 text-sm font-extrabold text-white shadow-xl shadow-blue-500/25 hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Confirm Appointment
        </button>
      </form>
    </div>
  );
};

export default Appointment;
