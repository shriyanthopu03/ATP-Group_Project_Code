

const AppointmentListItem = ({ appointment, state, markCompleted, sendReminder, setPrescriptionValue, setHistoryValue, setActiveTab }) => {
  const patient = state.patients.find((entry) => String(entry.id) === String(appointment.patientId));
  
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 hover:bg-slate-50 transition-colors shadow-sm">
      <p className="font-black text-slate-800 text-lg">
        {patient?.firstName || "Patient"} - {appointment.reason}
      </p>
      <p className="text-base font-bold text-slate-500 mt-1">
        {appointment.appointmentDate} at {appointment.appointmentTime}
      </p>
      <p className="text-xs font-black uppercase text-blue-600 mt-1">{appointment.status}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        {appointment.status !== "completed" && (
          <button 
            onClick={() => markCompleted(appointment.id)} 
            className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-black text-white shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
          >
            MARK COMPLETED
          </button>
        )}
        <button 
          onClick={() => {
            setPrescriptionValue?.("appointmentId", appointment.id);
            setPrescriptionValue?.("patientId", appointment.patientId);
            setHistoryValue?.("appointmentId", appointment.id);
            setHistoryValue?.("patientId", appointment.patientId);
            setActiveTab("records");
          }} 
          className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-black text-white shadow-lg shadow-blue-500/20 hover:scale-105 transition-all"
        >
          ADD RECORD
        </button>
        <button 
          onClick={() => sendReminder?.(appointment)} 
          className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-2 text-xs font-black text-slate-600 hover:bg-slate-100 transition-all"
        >
          REMINDER
        </button>
      </div>
    </div>
  );
}

export default AppointmentListItem;

