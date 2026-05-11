import React from 'react';

const MedicineItem = ({ medicine }) => {
  return (
    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
      <p className="text-base font-black text-blue-600">{medicine.name}</p>
      <p className="text-sm font-bold text-slate-600">{medicine.dosage} - {medicine.duration}</p>
      {medicine.instructions && <p className="text-xs font-bold text-slate-400 italic mt-1">{medicine.instructions}</p>}
    </div>
  );
}

const PrescriptionCard = ({ prescription }) => {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 hover:bg-slate-50 transition-colors shadow-sm">
      <p className="font-black text-slate-800 text-lg">{prescription.diagnosis}</p>
      <div className="mt-3 space-y-2">
        {prescription.medicines.map((med, idx) => (
          <MedicineItem key={idx} medicine={med} />
        ))}
      </div>
      {prescription.notes && (
        <p className="text-sm font-bold text-slate-400 mt-3 pt-3 border-t border-slate-50">
          Notes: {prescription.notes}
        </p>
      )}
    </div>
  );
}

export default PrescriptionCard;

