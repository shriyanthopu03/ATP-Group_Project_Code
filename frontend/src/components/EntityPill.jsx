import React from 'react';

function EntityPill({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
      <span className="font-black text-slate-400 uppercase tracking-wider text-[10px] block mb-1">{label}</span>
      <span className="font-black text-white brightness-200 text-base drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{value}</span>
    </div>
  );
}

export default EntityPill;
