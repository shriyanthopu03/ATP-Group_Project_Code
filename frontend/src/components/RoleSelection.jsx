

function RoleSelection({ onSelectRole, onLogin }) {
  const cards = [
    { 
      role: "DOCTOR", 
      title: "Doctor access", 
      color: "from-blue-600 to-cyan-500",
      shadow: "shadow-blue-500/20"
    },
    { 
      role: "PATIENT", 
      title: "Patient access", 
      color: "from-emerald-600 to-teal-500",
      shadow: "shadow-emerald-500/20"
    },
    { 
      role: "ADMIN", 
      title: "Admin access", 
      color: "from-purple-600 to-indigo-500",
      shadow: "shadow-purple-500/20"
    },
  ];

  return (
    <div className="relative overflow-hidden mx-auto w-full max-w-6xl rounded-4xl border border-white bg-white/70 p-6 shadow-2xl backdrop-blur-xl sm:p-8 lg:p-12">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-[100px]" />

      <div className="relative grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <section>
          <h1 className="mt-6 text-5xl font-black tracking-tight text-slate-900 sm:text-6xl xl:text-7xl leading-tight">
            Hospital <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">Management</span>
          </h1>
          <p className="mt-6 text-lg text-slate-600 font-bold max-w-md leading-relaxed">
            Professional healthcare administration platform. Streamline appointments, records, and staff coordination.
          </p>

          <div className="mt-10">
            <button 
              onClick={onLogin} 
              className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-blue-600 px-8 py-4 text-lg font-black text-white transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-500/20"
            >
              <span>Login to Account</span>
            </button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:gap-6">
          {cards.map((card) => (
            <button
              key={card.role}
              onClick={() => onSelectRole(card.role)}
              className={`group relative overflow-hidden rounded-4xl border border-slate-100 bg-white p-6 text-left transition-all duration-300 hover:-translate-y-2 hover:bg-slate-50 hover:border-slate-200 shadow-sm ${card.shadow}`}
            >
              {/* Animated Gradient Background on Hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-linear-to-br ${card.color} transition-opacity`} />
              
              <div className="relative z-10">
                <h3 className="mt-2 text-2xl font-black text-slate-800">{card.title}</h3>
                <p className="mt-2 text-sm text-slate-500 font-bold leading-snug">Tap to set up your profile and join the portal.</p>
                
                <div className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-blue-600 transition-colors">
                  <span>Register Now</span>
                </div>
              </div>
            </button>
          ))}
        </section>
      </div>
    </div>
  );
}

export default RoleSelection;