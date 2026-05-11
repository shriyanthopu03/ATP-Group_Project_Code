import React from 'react';

function EntityPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
      <span className="font-black text-slate-400 uppercase tracking-wider text-[10px] block mb-1">{label}</span>
      <span className="font-black text-slate-800 text-base">{value}</span>
    </div>
  );
}

export default EntityPill;
