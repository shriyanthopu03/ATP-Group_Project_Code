import React from "react";

const DashboardHeader = ({ userRole, currentUser, onLogout }) => {
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

        <button
          onClick={onLogout}
          className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-8 py-4 text-sm font-black text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;

