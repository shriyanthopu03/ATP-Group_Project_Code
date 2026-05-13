import React from "react";

const NavigationTabs = ({ tabs, activeTab, setActiveTab, tabLabels = {} }) => {
  return (
    <nav className="mb-10 flex flex-wrap gap-3 rounded-2xl border border-white bg-white/70 p-3 backdrop-blur-xl shadow-md shadow-blue-500/5">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-black capitalize transition ${
            activeTab === tab 
              ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <span className={activeTab === tab ? "drop-shadow-sm" : ""}>
            {tabLabels[tab] || tab}
          </span>
        </button>
      ))}
    </nav>
  );
}

export default NavigationTabs;

