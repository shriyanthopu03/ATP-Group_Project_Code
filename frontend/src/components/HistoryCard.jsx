import React from 'react';

const HistoryCard = ({ history }) => {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 hover:bg-slate-50 transition-colors shadow-sm">
      <p className="font-black text-slate-800 text-lg">{history.condition}</p>
      <p className="text-base font-bold text-slate-500 mt-1">{history.treatment}</p>
      {history.notes && <p className="text-sm font-bold text-slate-400 mt-2">Notes: {history.notes}</p>}
    </div>
  );
}

export default HistoryCard;

