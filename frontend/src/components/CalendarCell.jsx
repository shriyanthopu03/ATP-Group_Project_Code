import React from 'react';

const CalendarCell = ({ cell, selectedDay, setSelectedDay }) => {
  if (!cell) {
    return <div className="min-h-[5rem] rounded-2xl border border-transparent" />;
  }

  return (
    <button
      onClick={() => setSelectedDay(cell.currentDate)}
      className={`min-h-[5rem] rounded-2xl border p-2 text-left transition ${
        selectedDay === cell.currentDate 
          ? "border-blue-400 bg-blue-50 shadow-inner" 
          : "border-slate-100 bg-white hover:bg-slate-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-sm font-black ${selectedDay === cell.currentDate ? "text-blue-600" : "text-slate-800"}`}>
          {cell.day}
        </span>
        {cell.dayAppointments.length > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white shadow-lg shadow-blue-500/30">
            {cell.dayAppointments.length}
          </span>
        )}
      </div>
      <div className="mt-1 flex flex-col gap-1 overflow-hidden">
        {cell.dayAppointments.slice(0, 2).map((apt) => (
          <div key={apt.id} className="truncate text-[9px] font-bold text-slate-500">
            â€¢ {apt.appointmentTime}
          </div>
        ))}
      </div>
    </button>
  );
}

export default CalendarCell;

