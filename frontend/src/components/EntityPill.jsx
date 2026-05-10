import React from 'react';

function EntityPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
      <span className="font-semibold text-slate-500">{label}: </span>
      <span>{value}</span>
    </div>
  );
}

export default EntityPill;
