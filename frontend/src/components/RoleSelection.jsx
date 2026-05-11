

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
    <div className="relative overflow-hidden mx-auto w-full max-w-6xl rounded-[3rem] border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8 lg:p-12">
      {/* Dynamic Background Glows */}
      <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-500/10 blur-[100px]" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-[100px]" />

      <div className="relative grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <section>
          <div className="inline-block rounded-full bg-blue-900/30 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 border border-blue-500/20">
            Next-Gen Portal
          </div>
          <h1 className="mt-6 text-5xl font-black tracking-tight text-white sm:text-6xl xl:text-7xl leading-tight">
            Hospital <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Management</span>
          </h1>
          <p className="mt-6 text-lg text-slate-400 font-medium max-w-md leading-relaxed">
            Professional healthcare administration platform. Streamline appointments, records, and staff coordination.
          </p>

          <div className="mt-10">
            <button 
              onClick={onLogin} 
              className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-white px-8 py-4 text-lg font-bold text-slate-950 transition-all hover:scale-105 active:scale-95"
            >
              <span>Login to Account</span>
              <div className="rounded-full bg-slate-950/10 p-1 group-hover:translate-x-1 transition-transform">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
              </div>
            </button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:gap-6">
          {cards.map((card) => (
            <button
              key={card.role}
              onClick={() => onSelectRole(card.role)}
              className={`group relative overflow-hidden rounded-[2rem] border border-white/5 bg-slate-800/40 p-6 text-left transition-all duration-300 hover:-translate-y-2 hover:bg-slate-800/60 hover:border-white/20 ${card.shadow}`}
            >
              {/* Animated Gradient Border */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 dark:opacity-5 bg-gradient-to-br ${card.color} transition-opacity`} />
              
              <div className="relative z-10">
                <div className={`inline-flex rounded-xl bg-gradient-to-br ${card.color} p-3 text-white shadow-lg`}>
                  {card.role === "DOCTOR" && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M12 5v14"/><path d="M5 12h14"/></svg>}
                  {card.role === "PATIENT" && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                  {card.role === "ADMIN" && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>}
                </div>
                
                <h3 className="mt-6 text-2xl font-black text-white">{card.title}</h3>
                <p className="mt-2 text-sm text-slate-400 font-medium leading-snug">Tap to set up your profile and join the portal.</p>
                
                <div className="mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                  <span>Register Now</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
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