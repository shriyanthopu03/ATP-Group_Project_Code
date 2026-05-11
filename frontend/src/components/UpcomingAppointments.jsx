import React from "react";

const AppointmentCard = ({ appointment, userRole, state }) => {
  const patient = state.patients.find((entry) => String(entry.id) === String(appointment.patientId));
  const doctor = state.doctors.find((entry) => String(entry.id) === String(appointment.doctorId));

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-800/20 p-4 transition-all hover:border-blue-500/30 hover:bg-slate-800/40">
      <div className="relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400">{appointment.appointmentDate}</p>
        <p className="mt-1 text-xl font-black text-white">{appointment.appointmentTime}</p>
        <p className="mt-2 text-sm font-bold text-white">
          {userRole === "PATIENT"
            ? (doctor ? ("Dr. " + doctor.firstName + " " + doctor.lastName) : "Specialist Assigned")
            : ((patient?.firstName || "Patient") + " " + (patient?.lastName || ""))}
        </p>
        <p className="mt-1 text-[11px] font-medium text-slate-400 truncate">{appointment.reason || "General Checkup"}</p>
      </div>
    </div>
  );
}

const UpcomingAppointments = ({ upcomingAppointments, userRole, setActiveTab, state }) => {
  return (
    <div className="mt-12">
      <div className="rounded-[2.5rem] border border-white bg-white/60 p-8 shadow-lg shadow-blue-500/5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black text-slate-800">
            <span className="bg-gradient-to-r from-slate-800 to-slate-900 bg-clip-text text-transparent">Upcoming appointments</span>
          </h2>
          {userRole === "PATIENT" && (
            <button 
              onClick={() => setActiveTab("book")} 
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105 hover:bg-blue-500 active:scale-95"
            >
              Book New
            </button>
          )}
        </div>
        
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => (
              <AppointmentCard 
                key={appointment.id} 
                appointment={appointment} 
                userRole={userRole} 
                state={state} 
              />
            ))
          ) : (
            <div className="flex min-h-[160px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-slate-900/40 text-sm font-bold text-white md:col-span-2 lg:col-span-4">
              <svg className="mb-2 text-blue-400" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="text-white drop-shadow-md">No upcoming schedules</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UpcomingAppointments;

