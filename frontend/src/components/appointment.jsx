

function Appointment({ saveAppointment, appointmentForm, setAppointmentForm, state }) {
  return (
    <div className="max-w-2xl">
      <form onSubmit={saveAppointment} className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
        <h2 className="text-2xl font-black">Book appointment</h2>
        <div className="mt-4 grid gap-3">
          <select 
            value={appointmentForm.doctorId} 
            onChange={(event) => {
              console.log("Selected Doctor ID:", event.target.value);
              setAppointmentForm((prev) => ({ ...prev, doctorId: event.target.value }));
            }} 
            className="rounded-2xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white outline-none appearance-none"
            style={{ backgroundColor: '#1e293b', color: 'white' }}
            required
          >
            <option value="" style={{ color: 'white', backgroundColor: '#1e293b' }}>Select doctor</option>
            {state.doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id} style={{ color: 'white', backgroundColor: '#1e293b' }}>
                Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
              </option>
            ))}
          </select>
          <input type="date" value={appointmentForm.appointmentDate} onChange={(event) => setAppointmentForm((prev) => ({ ...prev, appointmentDate: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" required />
          <input type="time" value={appointmentForm.appointmentTime} onChange={(event) => setAppointmentForm((prev) => ({ ...prev, appointmentTime: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none" />
          <input type="text" placeholder="Reason" value={appointmentForm.reason} onChange={(event) => setAppointmentForm((prev) => ({ ...prev, reason: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500" />
          <textarea placeholder="Notes" value={appointmentForm.notes} onChange={(event) => setAppointmentForm((prev) => ({ ...prev, notes: event.target.value }))} className="min-h-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500" />
        </div>
        <button type="submit" className="mt-4 rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Book now</button>
      </form>
    </div>
  )
}

export default Appointment