export default function RoleSelection({ onSelectRole, onLogin }) {
  const cards = [
    { role: "DOCTOR", title: "Doctor access", description: "Manage schedule, prescriptions, and medical history." },
    { role: "PATIENT", title: "Patient access", description: "Book appointments, view records, and track care." },
    { role: "ADMIN", title: "Admin access", description: "Oversee users, appointments, and search across records." },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-cyan-950/20 sm:p-8 lg:p-10">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <section>
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/70">Hospital management</p>
          <h1 className="mt-3 text-4xl font-black text-white sm:text-5xl">One frontend for patients, doctors, and admins</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Register, sign in, and jump straight into role-specific dashboards with appointments, records, search, and reminders.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={onLogin} className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
              Login
            </button>
            <div className="rounded-full border border-white/10 px-5 py-3 text-sm text-slate-300">
              Demo accounts are seeded for each role
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 lg:justify-self-end">
          {cards.map((card) => (
            <button
              key={card.role}
              onClick={() => onSelectRole(card.role)}
              className="group rounded-[1.75rem] border border-white/10 bg-white/5 p-5 text-left transition hover:-translate-y-1 hover:bg-white/10"
            >
              <div className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200/70">{card.role}</div>
              <div className="mt-3 text-lg font-black text-white">{card.title}</div>
              <p className="mt-2 text-sm leading-6 text-slate-300">{card.description}</p>
              <div className="mt-4 text-sm font-semibold text-cyan-200 transition group-hover:text-cyan-100">Register now</div>
            </button>
          ))}
        </section>
      </div>
    </div>
  );
}