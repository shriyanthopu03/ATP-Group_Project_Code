import { useMemo, useState } from "react";
import {
  buildReminderMailto,
  loadHospitalState,
  mutateHospitalState,
  searchHospitalEntities,
} from "../lib/hospitalStore";

const emptyPatient = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  age: "",
  phoneNumber: "",
  address: "",
  profileImageUrl: "",
};

const emptyDoctor = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  age: "",
  phoneNumber: "",
  experience: "",
  specialization: "General Medicine",
  degree: "",
  profileImageUrl: "",
};

const emptyAppointment = {
  patientId: "",
  doctorId: "",
  appointmentDate: new Date().toISOString().slice(0, 10),
  appointmentTime: "09:00",
  reason: "",
  notes: "",
  status: "scheduled",
};

const emptyPrescription = {
  appointmentId: "",
  patientId: "",
  doctorId: "",
  diagnosis: "",
  medicineName: "",
  dosage: "",
  duration: "",
  instructions: "",
  notes: "",
};

const emptyHistory = {
  patientId: "",
  doctorId: "",
  appointmentId: "",
  condition: "",
  symptoms: "",
  treatment: "",
  notes: "",
};

const formatDate = (dateValue) =>
  new Date(dateValue).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

const formatMonthValue = (dateValue) => {
  const month = String(dateValue.getMonth() + 1).padStart(2, "0");
  return `${dateValue.getFullYear()}-${month}`;
};

const getMonthCells = (monthValue, appointments) => {
  const [yearText, monthText] = monthValue.split("-");
  const year = Number(yearText);
  const month = Number(monthText) - 1;
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const firstDay = start.getDay();
  const totalDays = end.getDate();
  const cells = [];

  for (let index = 0; index < firstDay; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const currentDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayAppointments = appointments.filter((entry) => entry.appointmentDate === currentDate);
    cells.push({ day, currentDate, dayAppointments });
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
};

const EntityPill = ({ label, value }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
    <span className="font-semibold text-slate-500">{label}: </span>
    <span>{value}</span>
  </div>
);

function HospitalDashboard({ user, onLogout }) {
  const [state, setState] = useState(() => loadHospitalState());
  const [activeTab, setActiveTab] = useState(user.role === "ADMIN" ? "overview" : user.role === "DOCTOR" ? "schedule" : "book");
  const [searchQuery, setSearchQuery] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(formatMonthValue(new Date()));
  const [selectedDay, setSelectedDay] = useState("");
  const [editingPatientId, setEditingPatientId] = useState(null);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);
  const [editingPrescriptionId, setEditingPrescriptionId] = useState(null);
  const [editingHistoryId, setEditingHistoryId] = useState(null);
  const [patientForm, setPatientForm] = useState(emptyPatient);
  const [doctorForm, setDoctorForm] = useState(emptyDoctor);
  const [appointmentForm, setAppointmentForm] = useState({ ...emptyAppointment, patientId: user.role === "PATIENT" ? user.id : "" });
  const [prescriptionForm, setPrescriptionForm] = useState(emptyPrescription);
  const [historyForm, setHistoryForm] = useState(emptyHistory);

  const refreshState = () => setState(loadHospitalState());

  const currentUser = useMemo(() => {
    if (user.role === "PATIENT") {
      return state.patients.find((entry) => entry.id === user.id) || user;
    }

    if (user.role === "DOCTOR") {
      return state.doctors.find((entry) => entry.id === user.id) || user;
    }

    return user;
  }, [state, user]);

  const filteredSearch = useMemo(() => searchHospitalEntities(state, searchQuery), [state, searchQuery]);

  const myAppointments = useMemo(() => {
    if (user.role === "PATIENT") {
      return state.appointments.filter((entry) => entry.patientId === user.id);
    }

    if (user.role === "DOCTOR") {
      return state.appointments.filter((entry) => entry.doctorId === user.id);
    }

    return state.appointments;
  }, [state.appointments, user]);

  const calendarAppointments = useMemo(() => {
    const monthAppointments = myAppointments.filter((entry) => entry.appointmentDate.startsWith(calendarMonth));
    return selectedDay ? monthAppointments.filter((entry) => entry.appointmentDate === selectedDay) : monthAppointments;
  }, [calendarMonth, myAppointments, selectedDay]);

  const stats = useMemo(
    () => [
      { label: "Patients", value: state.patients.length },
      { label: "Doctors", value: state.doctors.length },
      { label: "Appointments", value: state.appointments.length },
      { label: "Records", value: state.prescriptions.length + state.histories.length },
    ],
    [state],
  );

  const resetPatientForm = () => {
    setEditingPatientId(null);
    setPatientForm(emptyPatient);
  };

  const resetDoctorForm = () => {
    setEditingDoctorId(null);
    setDoctorForm(emptyDoctor);
  };

  const resetAppointmentForm = () => {
    setEditingAppointmentId(null);
    setAppointmentForm({ ...emptyAppointment, patientId: user.role === "PATIENT" ? user.id : "" });
  };

  const resetPrescriptionForm = () => {
    setEditingPrescriptionId(null);
    setPrescriptionForm(emptyPrescription);
  };

  const resetHistoryForm = () => {
    setEditingHistoryId(null);
    setHistoryForm(emptyHistory);
  };

  const savePatient = (event) => {
    event.preventDefault();

    mutateHospitalState((draft) => {
      if (editingPatientId) {
        draft.patients = draft.patients.map((entry) =>
          entry.id === editingPatientId ? { ...entry, ...patientForm, age: Number(patientForm.age), isPatientActive: entry.isPatientActive } : entry,
        );
        draft.users = draft.users.map((entry) =>
          entry.id === editingPatientId ? { ...entry, ...patientForm, password: patientForm.password || entry.password, role: "PATIENT" } : entry,
        );
        return draft;
      }

      const nextId = `${Date.now()}`;
      draft.patients.push({
        id: nextId,
        ...patientForm,
        age: Number(patientForm.age),
        isPatientActive: true,
      });
      draft.users.push({
        id: nextId,
        role: "PATIENT",
        email: patientForm.email,
        password: patientForm.password,
        firstName: patientForm.firstName,
        lastName: patientForm.lastName,
      });
      return draft;
    });

    refreshState();
    resetPatientForm();
  };

  const saveDoctor = (event) => {
    event.preventDefault();

    mutateHospitalState((draft) => {
      if (editingDoctorId) {
        draft.doctors = draft.doctors.map((entry) =>
          entry.id === editingDoctorId ? { ...entry, ...doctorForm, age: Number(doctorForm.age), experience: Number(doctorForm.experience) } : entry,
        );
        draft.users = draft.users.map((entry) =>
          entry.id === editingDoctorId ? { ...entry, ...doctorForm, password: doctorForm.password || entry.password, role: "DOCTOR" } : entry,
        );
        return draft;
      }

      const nextId = `${Date.now()}`;
      draft.doctors.push({
        id: nextId,
        ...doctorForm,
        age: Number(doctorForm.age),
        experience: Number(doctorForm.experience),
        isDoctorActive: true,
      });
      draft.users.push({
        id: nextId,
        role: "DOCTOR",
        email: doctorForm.email,
        password: doctorForm.password,
        firstName: doctorForm.firstName,
        lastName: doctorForm.lastName,
      });
      return draft;
    });

    refreshState();
    resetDoctorForm();
  };

  const saveAppointment = (event) => {
    event.preventDefault();

    mutateHospitalState((draft) => {
      if (editingAppointmentId) {
        draft.appointments = draft.appointments.map((entry) => (entry.id === editingAppointmentId ? { ...entry, ...appointmentForm } : entry));
        return draft;
      }

      draft.appointments.push({
        id: `${Date.now()}`,
        ...appointmentForm,
        reminderSent: false,
      });
      return draft;
    });

    refreshState();
    resetAppointmentForm();
  };

  const savePrescription = (event) => {
    event.preventDefault();

    mutateHospitalState((draft) => {
      const medicines = prescriptionForm.medicineName
        ? [
            {
              name: prescriptionForm.medicineName,
              dosage: prescriptionForm.dosage,
              duration: prescriptionForm.duration,
              instructions: prescriptionForm.instructions,
            },
          ]
        : [];

      if (editingPrescriptionId) {
        draft.prescriptions = draft.prescriptions.map((entry) =>
          entry.id === editingPrescriptionId
            ? { ...entry, diagnosis: prescriptionForm.diagnosis, medicines, notes: prescriptionForm.notes }
            : entry,
        );
        return draft;
      }

      draft.prescriptions.push({
        id: `${Date.now()}`,
        appointmentId: prescriptionForm.appointmentId,
        patientId: prescriptionForm.patientId,
        doctorId: prescriptionForm.doctorId,
        diagnosis: prescriptionForm.diagnosis,
        medicines,
        notes: prescriptionForm.notes,
        prescribedAt: new Date().toISOString(),
      });
      return draft;
    });

    refreshState();
    resetPrescriptionForm();
  };

  const saveHistory = (event) => {
    event.preventDefault();

    mutateHospitalState((draft) => {
      if (editingHistoryId) {
        draft.histories = draft.histories.map((entry) => (entry.id === editingHistoryId ? { ...entry, ...historyForm } : entry));
        return draft;
      }

      draft.histories.push({
        id: `${Date.now()}`,
        ...historyForm,
        visitDate: new Date().toISOString(),
      });
      return draft;
    });

    refreshState();
    resetHistoryForm();
  };

  const updateAppointmentStatus = (appointmentId, status) => {
    mutateHospitalState((draft) => {
      draft.appointments = draft.appointments.map((entry) => (entry.id === appointmentId ? { ...entry, status } : entry));
      return draft;
    });
    refreshState();
  };

  const sendReminder = (appointment) => {
    const mailto = buildReminderMailto(appointment, state);
    mutateHospitalState((draft) => {
      draft.appointments = draft.appointments.map((entry) =>
        entry.id === appointment.id ? { ...entry, reminderSent: true } : entry,
      );
      return draft;
    });
    refreshState();
    window.location.href = mailto;
  };

  const tabs =
    user.role === "ADMIN"
      ? ["overview", "patients", "doctors", "appointments", "search"]
      : user.role === "DOCTOR"
        ? ["schedule", "records", "search", "profile"]
        : ["book", "records", "search", "profile"];

  const selectedMonthCells = getMonthCells(calendarMonth, myAppointments);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-[2rem] border border-white/10 bg-gradient-to-r from-cyan-500/20 via-slate-900 to-emerald-500/20 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/70">Hospital portal</p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                {currentUser.firstName || currentUser.email}, your {user.role.toLowerCase()} dashboard
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">
                Manage patients, doctors, appointments, calendar scheduling, prescriptions, medical history, and appointment reminders in one place.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                {user.role}
              </div>
              <button
                onClick={onLogout}
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-slate-300">{stat.label}</p>
                <p className="mt-1 text-3xl font-black text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </header>

        <nav className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-slate-900/80 p-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                activeTab === tab ? "bg-cyan-400 text-slate-950" : "text-slate-300 hover:bg-white/10"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {user.role === "ADMIN" && activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black">System overview</h2>
                  <p className="text-sm text-slate-400">Latest activity across patients, doctors, and scheduling.</p>
                </div>
                <button onClick={() => setActiveTab("appointments")} className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950">
                  Schedule
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <EntityPill label="Active patients" value={state.patients.filter((entry) => entry.isPatientActive).length} />
                <EntityPill label="Active doctors" value={state.doctors.filter((entry) => entry.isDoctorActive).length} />
                <EntityPill label="Prescriptions" value={state.prescriptions.length} />
                <EntityPill label="Medical logs" value={state.histories.length} />
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
              <h2 className="text-2xl font-black">Upcoming appointments</h2>
              <div className="mt-4 space-y-3">
                {state.appointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-semibold text-white">
                      {state.patients.find((entry) => entry.id === appointment.patientId)?.firstName || "Patient"} with{" "}
                      {state.doctors.find((entry) => entry.id === appointment.doctorId)?.firstName || "Doctor"}
                    </p>
                    <p className="text-sm text-slate-300">
                      {appointment.appointmentDate} at {appointment.appointmentTime} - {appointment.reason}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {user.role === "ADMIN" && activeTab === "patients" && (
          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <form onSubmit={savePatient} className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
              <h2 className="text-2xl font-black">{editingPatientId ? "Edit patient" : "Add patient"}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {Object.entries(patientForm).map(([key, value]) => (
                  <input
                    key={key}
                    type={key === "age" ? "number" : key.includes("password") ? "password" : key === "profileImageUrl" ? "url" : "text"}
                    placeholder={key.replace(/([A-Z])/g, " $1")}
                    value={value}
                    onChange={(event) => setPatientForm((prev) => ({ ...prev, [key]: event.target.value }))}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-300"
                  />
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <button className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950" type="submit">
                  {editingPatientId ? "Update patient" : "Create patient"}
                </button>
                {editingPatientId && (
                  <button type="button" onClick={resetPatientForm} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200">
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
              <h2 className="text-2xl font-black">Patients</h2>
              <div className="mt-4 space-y-3">
                {state.patients.map((patient) => (
                  <div key={patient.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-sm text-slate-300">{patient.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingPatientId(patient.id);
                            setPatientForm({ ...patient, password: patient.password || "" });
                          }}
                          className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            mutateHospitalState((draft) => {
                              draft.patients = draft.patients.filter((entry) => entry.id !== patient.id);
                              draft.users = draft.users.filter((entry) => entry.id !== patient.id);
                              draft.appointments = draft.appointments.filter((entry) => entry.patientId !== patient.id);
                              draft.prescriptions = draft.prescriptions.filter((entry) => entry.patientId !== patient.id);
                              draft.histories = draft.histories.filter((entry) => entry.patientId !== patient.id);
                              return draft;
                            });
                            refreshState();
                          }}
                          className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <EntityPill label="Age" value={patient.age} />
                      <EntityPill label="Status" value={patient.isPatientActive ? "Active" : "Inactive"} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {user.role === "ADMIN" && activeTab === "doctors" && (
          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <form onSubmit={saveDoctor} className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
              <h2 className="text-2xl font-black">{editingDoctorId ? "Edit doctor" : "Add doctor"}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {Object.entries(doctorForm).map(([key, value]) => (
                  <input
                    key={key}
                    type={key === "age" || key === "experience" ? "number" : key.includes("password") ? "password" : key === "profileImageUrl" ? "url" : "text"}
                    placeholder={key.replace(/([A-Z])/g, " $1")}
                    value={value}
                    onChange={(event) => setDoctorForm((prev) => ({ ...prev, [key]: event.target.value }))}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500 focus:border-cyan-300"
                  />
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <button className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950" type="submit">
                  {editingDoctorId ? "Update doctor" : "Create doctor"}
                </button>
                {editingDoctorId && (
                  <button type="button" onClick={resetDoctorForm} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200">
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
              <h2 className="text-2xl font-black">Specialization management</h2>
              <div className="mt-4 space-y-3">
                {state.doctors.map((doctor) => (
                  <div key={doctor.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </p>
                        <p className="text-sm text-slate-300">{doctor.specialization}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingDoctorId(doctor.id);
                            setDoctorForm({ ...doctor, password: doctor.password || "" });
                          }}
                          className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            mutateHospitalState((draft) => {
                              draft.doctors = draft.doctors.filter((entry) => entry.id !== doctor.id);
                              draft.users = draft.users.filter((entry) => entry.id !== doctor.id);
                              draft.appointments = draft.appointments.filter((entry) => entry.doctorId !== doctor.id);
                              draft.prescriptions = draft.prescriptions.filter((entry) => entry.doctorId !== doctor.id);
                              draft.histories = draft.histories.filter((entry) => entry.doctorId !== doctor.id);
                              return draft;
                            });
                            refreshState();
                          }}
                          className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <EntityPill label="Experience" value={`${doctor.experience} years`} />
                      <EntityPill label="Degree" value={doctor.degree} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {user.role === "ADMIN" && activeTab === "appointments" && (
          <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <form onSubmit={saveAppointment} className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
              <h2 className="text-2xl font-black">{editingAppointmentId ? "Edit appointment" : "Schedule appointment"}</h2>
              <div className="mt-4 grid gap-3">
                <select
                  value={appointmentForm.patientId}
                  onChange={(event) => setAppointmentForm((prev) => ({ ...prev, patientId: event.target.value }))}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none"
                >
                  <option value="">Select patient</option>
                  {state.patients.map((patient) => (
                    <option key={patient.id} value={patient.id} className="text-slate-950">
                      {patient.firstName} {patient.lastName}
                    </option>
                  ))}
                </select>
                <select
                  value={appointmentForm.doctorId}
                  onChange={(event) => setAppointmentForm((prev) => ({ ...prev, doctorId: event.target.value }))}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none"
                >
                  <option value="">Select doctor</option>
                  {state.doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id} className="text-slate-950">
                      Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={appointmentForm.appointmentDate}
                  onChange={(event) => setAppointmentForm((prev) => ({ ...prev, appointmentDate: event.target.value }))}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
                />
                <input
                  type="time"
                  value={appointmentForm.appointmentTime}
                  onChange={(event) => setAppointmentForm((prev) => ({ ...prev, appointmentTime: event.target.value }))}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none"
                />
                <input
                  type="text"
                  placeholder="Reason"
                  value={appointmentForm.reason}
                  onChange={(event) => setAppointmentForm((prev) => ({ ...prev, reason: event.target.value }))}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
                />
                <textarea
                  placeholder="Notes"
                  value={appointmentForm.notes}
                  onChange={(event) => setAppointmentForm((prev) => ({ ...prev, notes: event.target.value }))}
                  className="min-h-28 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
                />
              </div>
              <div className="mt-4 flex gap-3">
                <button className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950" type="submit">
                  {editingAppointmentId ? "Update appointment" : "Create appointment"}
                </button>
                {editingAppointmentId && (
                  <button type="button" onClick={resetAppointmentForm} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200">
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black">Appointment calendar</h2>
                  <p className="text-sm text-slate-400">Click a day to filter the schedule.</p>
                </div>
                <input
                  type="month"
                  value={calendarMonth}
                  onChange={(event) => setCalendarMonth(event.target.value)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none"
                />
              </div>

              <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-7 gap-2">
                {selectedMonthCells.map((cell, index) =>
                  cell ? (
                    <button
                      key={cell.currentDate}
                      onClick={() => setSelectedDay(cell.currentDate)}
                      className={`min-h-24 rounded-2xl border p-2 text-left transition ${
                        selectedDay === cell.currentDate ? "border-cyan-300 bg-cyan-400/20" : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{cell.day}</span>
                        <span className="text-[11px] text-slate-400">{cell.dayAppointments.length}</span>
                      </div>
                      <div className="mt-2 space-y-1 text-[11px] text-slate-300">
                        {cell.dayAppointments.slice(0, 2).map((appointment) => (
                          <div key={appointment.id} className="rounded-full bg-white/10 px-2 py-1">
                            {appointment.appointmentTime} {appointment.reason}
                          </div>
                        ))}
                      </div>
                    </button>
                  ) : (
                    <div key={`empty-${index}`} className="min-h-24 rounded-2xl border border-transparent" />
                  ),
                )}
              </div>

              <div className="mt-6 space-y-3">
                {calendarAppointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-white">
                          {state.patients.find((entry) => entry.id === appointment.patientId)?.firstName || "Patient"} with{" "}
                          {state.doctors.find((entry) => entry.id === appointment.doctorId)?.firstName || "Doctor"}
                        </p>
                        <p className="text-sm text-slate-300">
                          {formatDate(appointment.appointmentDate)} at {appointment.appointmentTime} - {appointment.reason}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => sendReminder(appointment)} className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                          Email reminder
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, "completed")}
                          className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => {
                            setEditingAppointmentId(appointment.id);
                            setAppointmentForm({
                              patientId: appointment.patientId,
                              doctorId: appointment.doctorId,
                              appointmentDate: appointment.appointmentDate,
                              appointmentTime: appointment.appointmentTime,
                              reason: appointment.reason,
                              notes: appointment.notes || "",
                              status: appointment.status,
                            });
                          }}
                          className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {user.role === "ADMIN" && activeTab === "search" && (
          <section className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
            <h2 className="text-2xl font-black">Search patients, doctors, appointments</h2>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name, email, specialization, or reason"
              className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
            />

            <div className="mt-6 grid gap-6 xl:grid-cols-3">
              <SearchPanel title="Patients" items={filteredSearch.patients} renderItem={(item) => `${item.firstName} ${item.lastName} - ${item.email}`} />
              <SearchPanel title="Doctors" items={filteredSearch.doctors} renderItem={(item) => `Dr. ${item.firstName} ${item.lastName} - ${item.specialization}`} />
              <SearchPanel title="Appointments" items={filteredSearch.appointments} renderItem={(item) => `${item.appointmentDate} ${item.appointmentTime} - ${item.reason}`} />
            </div>
          </section>
        )}

        {user.role === "DOCTOR" && activeTab === "schedule" && (
          <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black">My schedule</h2>
                  <p className="text-sm text-slate-400">Month-based calendar with appointment counts.</p>
                </div>
                <input
                  type="month"
                  value={calendarMonth}
                  onChange={(event) => setCalendarMonth(event.target.value)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm outline-none"
                />
              </div>
              <div className="mt-4 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-7 gap-2">
                {selectedMonthCells.map((cell, index) =>
                  cell ? (
                    <button
                      key={cell.currentDate}
                      onClick={() => setSelectedDay(cell.currentDate)}
                      className={`min-h-24 rounded-2xl border p-2 text-left transition ${
                        selectedDay === cell.currentDate ? "border-cyan-300 bg-cyan-400/20" : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{cell.day}</span>
                        <span className="text-[11px] text-slate-400">{cell.dayAppointments.length}</span>
                      </div>
                    </button>
                  ) : (
                    <div key={`empty-${index}`} className="min-h-24 rounded-2xl border border-transparent" />
                  ),
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
              <h2 className="text-2xl font-black">Today&apos;s patients and records</h2>
              <div className="mt-4 space-y-3">
                {myAppointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-semibold text-white">
                      {state.patients.find((entry) => entry.id === appointment.patientId)?.firstName || "Patient"} - {appointment.reason}
                    </p>
                    <p className="text-sm text-slate-300">{appointment.appointmentDate} at {appointment.appointmentTime}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={() => setActiveTab("records")} className="rounded-full bg-cyan-400 px-3 py-1 text-xs font-semibold text-slate-950">
                        Add record
                      </button>
                      <button onClick={() => sendReminder(appointment)} className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                        Reminder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {user.role === "DOCTOR" && activeTab === "records" && (
          <section className="grid gap-6 xl:grid-cols-2">
            <form onSubmit={savePrescription} className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
              <h2 className="text-2xl font-black">Prescriptions</h2>
              <div className="mt-4 grid gap-3">
                <select value={prescriptionForm.patientId} onChange={(event) => setPrescriptionForm((prev) => ({ ...prev, patientId: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none">
                  <option value="">Select patient</option>
                  {state.patients.map((patient) => (
                    <option key={patient.id} value={patient.id} className="text-slate-950">{patient.firstName} {patient.lastName}</option>
                  ))}
                </select>
                <select value={prescriptionForm.appointmentId} onChange={(event) => setPrescriptionForm((prev) => ({ ...prev, appointmentId: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none">
                  <option value="">Select appointment</option>
                  {myAppointments.map((appointment) => (
                    <option key={appointment.id} value={appointment.id} className="text-slate-950">{appointment.appointmentDate} {appointment.appointmentTime}</option>
                  ))}
                </select>
                <input value={prescriptionForm.diagnosis} onChange={(event) => setPrescriptionForm((prev) => ({ ...prev, diagnosis: event.target.value }))} placeholder="Diagnosis" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
                <input value={prescriptionForm.medicineName} onChange={(event) => setPrescriptionForm((prev) => ({ ...prev, medicineName: event.target.value }))} placeholder="Medicine name" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input value={prescriptionForm.dosage} onChange={(event) => setPrescriptionForm((prev) => ({ ...prev, dosage: event.target.value }))} placeholder="Dosage" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
                  <input value={prescriptionForm.duration} onChange={(event) => setPrescriptionForm((prev) => ({ ...prev, duration: event.target.value }))} placeholder="Duration" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
                </div>
                <input value={prescriptionForm.instructions} onChange={(event) => setPrescriptionForm((prev) => ({ ...prev, instructions: event.target.value }))} placeholder="Instructions" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
                <textarea value={prescriptionForm.notes} onChange={(event) => setPrescriptionForm((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Notes" className="min-h-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
              </div>
              <button type="submit" className="mt-4 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950">{editingPrescriptionId ? "Update prescription" : "Save prescription"}</button>
            </form>

            <form onSubmit={saveHistory} className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
              <h2 className="text-2xl font-black">Medical history logs</h2>
              <div className="mt-4 grid gap-3">
                <select value={historyForm.patientId} onChange={(event) => setHistoryForm((prev) => ({ ...prev, patientId: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none">
                  <option value="">Select patient</option>
                  {state.patients.map((patient) => (
                    <option key={patient.id} value={patient.id} className="text-slate-950">{patient.firstName} {patient.lastName}</option>
                  ))}
                </select>
                <select value={historyForm.appointmentId} onChange={(event) => setHistoryForm((prev) => ({ ...prev, appointmentId: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none">
                  <option value="">Select appointment</option>
                  {myAppointments.map((appointment) => (
                    <option key={appointment.id} value={appointment.id} className="text-slate-950">{appointment.appointmentDate} {appointment.appointmentTime}</option>
                  ))}
                </select>
                <input value={historyForm.condition} onChange={(event) => setHistoryForm((prev) => ({ ...prev, condition: event.target.value }))} placeholder="Condition" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
                <textarea value={historyForm.symptoms} onChange={(event) => setHistoryForm((prev) => ({ ...prev, symptoms: event.target.value }))} placeholder="Symptoms" className="min-h-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
                <textarea value={historyForm.treatment} onChange={(event) => setHistoryForm((prev) => ({ ...prev, treatment: event.target.value }))} placeholder="Treatment" className="min-h-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
                <textarea value={historyForm.notes} onChange={(event) => setHistoryForm((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Notes" className="min-h-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
              </div>
              <button type="submit" className="mt-4 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950">{editingHistoryId ? "Update history" : "Save history"}</button>
            </form>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 xl:col-span-2">
              <h2 className="text-2xl font-black">Prescription and history log book</h2>
              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <div className="space-y-3">
                  {state.prescriptions.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="font-semibold text-white">{entry.diagnosis}</p>
                      <p className="text-sm text-slate-300">{entry.medicines[0]?.name || "No medicines"}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  {state.histories.map((entry) => (
                    <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="font-semibold text-white">{entry.condition}</p>
                      <p className="text-sm text-slate-300">{entry.treatment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {user.role === "DOCTOR" && activeTab === "search" && (
          <section className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
            <h2 className="text-2xl font-black">Search</h2>
            <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search patients, doctors, appointments" className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
            <div className="mt-6 grid gap-6 xl:grid-cols-3">
              <SearchPanel title="Patients" items={filteredSearch.patients} renderItem={(item) => `${item.firstName} ${item.lastName}`} />
              <SearchPanel title="Doctors" items={filteredSearch.doctors} renderItem={(item) => `Dr. ${item.firstName} ${item.lastName}`} />
              <SearchPanel title="Appointments" items={filteredSearch.appointments} renderItem={(item) => `${item.appointmentDate} ${item.reason}`} />
            </div>
          </section>
        )}

        {user.role === "DOCTOR" && activeTab === "profile" && (
          <section className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
            <h2 className="text-2xl font-black">Doctor profile</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <EntityPill label="Name" value={`${currentUser.firstName} ${currentUser.lastName}`} />
              <EntityPill label="Specialization" value={currentUser.specialization} />
              <EntityPill label="Degree" value={currentUser.degree} />
            </div>
          </section>
        )}

        {user.role === "PATIENT" && activeTab === "book" && (
          <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <form onSubmit={saveAppointment} className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
              <h2 className="text-2xl font-black">Book appointment</h2>
              <div className="mt-4 grid gap-3">
                <select value={appointmentForm.doctorId} onChange={(event) => setAppointmentForm((prev) => ({ ...prev, doctorId: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100 outline-none">
                  <option value="">Select doctor</option>
                  {state.doctors.filter((doctor) => doctor.isDoctorActive).map((doctor) => (
                    <option key={doctor.id} value={doctor.id} className="text-slate-950">Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}</option>
                  ))}
                </select>
                <input type="date" value={appointmentForm.appointmentDate} onChange={(event) => setAppointmentForm((prev) => ({ ...prev, appointmentDate: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" />
                <input type="time" value={appointmentForm.appointmentTime} onChange={(event) => setAppointmentForm((prev) => ({ ...prev, appointmentTime: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none" />
                <input type="text" placeholder="Reason" value={appointmentForm.reason} onChange={(event) => setAppointmentForm((prev) => ({ ...prev, reason: event.target.value }))} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
                <textarea placeholder="Notes" value={appointmentForm.notes} onChange={(event) => setAppointmentForm((prev) => ({ ...prev, notes: event.target.value }))} className="min-h-24 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
              </div>
              <button type="submit" className="mt-4 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950">Book now</button>
            </form>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black">Upcoming appointments</h2>
                  <p className="text-sm text-slate-400">Your schedule and reminder status.</p>
                </div>
                <button onClick={() => setActiveTab("records")} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200">
                  View records
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {myAppointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-semibold text-white">{appointment.appointmentDate} at {appointment.appointmentTime}</p>
                    <p className="text-sm text-slate-300">{appointment.reason}</p>
                    <p className="text-xs text-slate-400">Reminder {appointment.reminderSent ? "sent" : "not sent"}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {user.role === "PATIENT" && activeTab === "records" && (
          <section className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
              <h2 className="text-2xl font-black">Medical history</h2>
              <div className="mt-4 space-y-3">
                {state.histories.filter((entry) => entry.patientId === user.id).map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-semibold text-white">{entry.condition}</p>
                    <p className="text-sm text-slate-300">{entry.treatment}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
              <h2 className="text-2xl font-black">Prescriptions</h2>
              <div className="mt-4 space-y-3">
                {state.prescriptions.filter((entry) => entry.patientId === user.id).map((entry) => (
                  <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-semibold text-white">{entry.diagnosis}</p>
                    <p className="text-sm text-slate-300">{entry.medicines[0]?.name || "No medicine listed"}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {user.role === "PATIENT" && activeTab === "search" && (
          <section className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
            <h2 className="text-2xl font-black">Search doctors and appointments</h2>
            <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search doctors or appointments" className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <SearchPanel title="Doctors" items={filteredSearch.doctors} renderItem={(item) => `Dr. ${item.firstName} ${item.lastName} - ${item.specialization}`} />
              <SearchPanel title="Appointments" items={filteredSearch.appointments} renderItem={(item) => `${item.appointmentDate} ${item.reason}`} />
            </div>
          </section>
        )}

        {user.role === "PATIENT" && activeTab === "profile" && (
          <section className="rounded-[2rem] border border-white/10 bg-slate-900/90 p-6">
            <h2 className="text-2xl font-black">Patient profile</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <EntityPill label="Name" value={`${currentUser.firstName} ${currentUser.lastName}`} />
              <EntityPill label="Email" value={currentUser.email} />
              <EntityPill label="Phone" value={currentUser.phoneNumber} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

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

export default HospitalDashboard;