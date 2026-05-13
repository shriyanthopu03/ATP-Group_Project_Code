import React from "react";

const DashboardHeader = ({ userRole, currentUser, onLogout, setActiveTab, activeTab }) => {
  const homeTab = userRole === "ADMIN" ? "overview" : userRole === "DOCTOR" ? "schedule" : "book";

  return (
    <header className="mb-10 overflow-hidden rounded-[3rem] border border-white bg-white/70 p-8 shadow-xl backdrop-blur-3xl">
      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
            {userRole === "DOCTOR" && (
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
                Dr.{" "}
              </span>
            )}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
              {currentUser.firstName || currentUser.lastName || "User"}
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab(homeTab)}
            className={`flex items-center gap-3 rounded-2xl border px-8 py-4 text-sm font-black transition-all active:scale-95 ${
              activeTab === homeTab
                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            Home
          </button>

          {userRole !== "ADMIN" && (
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 rounded-2xl border px-8 py-4 text-sm font-black transition-all active:scale-95 ${
                activeTab === "profile"
                  ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
              }`}
            >
              Profile
            </button>
          )}

          <button
            onClick={onLogout}
            className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-8 py-4 text-sm font-black text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;

