import React from 'react';

function SearchPanel({ title, items, renderItem }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
      <h3 className="text-lg font-black text-white">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-400">No matches yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/60 p-3 text-sm text-slate-200">
              {renderItem(item)}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default SearchPanel;
