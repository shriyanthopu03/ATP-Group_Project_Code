import { useMemo, useState } from "react";

const STORAGE_KEY = "hospital-portal-data-v1";

const clone = (value) => JSON.parse(JSON.stringify(value));

const createId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const createSeedState = () => {
  const adminId = createId();
  const doctorId = createId();
  const patientId = createId();
  const appointmentId = createId();

  return {
    users: [
      { id: adminId, role: "ADMIN", email: "admin@hospital.test", password: "demo123", firstName: "Ava", lastName: "Stone" },
      { id: doctorId, role: "DOCTOR", email: "doctor@hospital.test", password: "demo123", firstName: "Mina", lastName: "Patel" },
      { id: patientId, role: "PATIENT", email: "patient@hospital.test", password: "demo123", firstName: "Noah", lastName: "Reed" },
    ],
    patients: [
      {
        id: patientId,
        firstName: "Noah",
        lastName: "Reed",
        email: "patient@hospital.test",
        password: "demo123",
        age: 34,
        phoneNumber: "555-0123",
        address: "14 Willow Lane",
        profileImageUrl: "",
        isPatientActive: true,
      },
    ],
    doctors: [
      {
        id: doctorId,
        firstName: "Mina",
        lastName: "Patel",
        email: "doctor@hospital.test",
        password: "demo123",
        age: 41,
        phoneNumber: "555-0456",
        experience: 12,
        specialization: "Cardiology",
        degree: "MBBS, MD",
        profileImageUrl: "",
        isDoctorActive: true,
      },
    ],
    appointments: [
      {
        id: appointmentId,
        patientId,
        doctorId,
        appointmentDate: new Date().toISOString().slice(0, 10),
        appointmentTime: "10:30",
        reason: "Follow-up consultation",
        status: "scheduled",
        notes: "Initial demo appointment",
        reminderSent: false,
      },
    ],
    prescriptions: [
      {
        id: createId(),
        appointmentId,
        patientId,
        doctorId,
        diagnosis: "Stable blood pressure",
        medicines: [{ name: "Amlodipine", dosage: "5mg", duration: "30 days", instructions: "Take after breakfast" }],
        notes: "Monitor daily pressure readings",
        prescribedAt: new Date().toISOString(),
      },
    ],
    histories: [
      {
        id: createId(),
        patientId,
        doctorId,
        appointmentId,
        condition: "Hypertension",
        symptoms: "Headache, fatigue",
        treatment: "Lifestyle adjustment and medication",
        notes: "Patient responding well",
        visitDate: new Date().toISOString(),
      },
    ],
  };
};

const normalizeState = (state) => ({
  users: Array.isArray(state?.users) ? state.users : [],
  patients: Array.isArray(state?.patients) ? state.patients : [],
  doctors: Array.isArray(state?.doctors) ? state.doctors : [],
  appointments: Array.isArray(state?.appointments) ? state.appointments : [],
  prescriptions: Array.isArray(state?.prescriptions) ? state.prescriptions : [],
  histories: Array.isArray(state?.histories) ? state.histories : [],
});

const loadHospitalState = () => {
  if (typeof window === "undefined") {
    return createSeedState();
  }

  const rawState = window.localStorage.getItem(STORAGE_KEY);

  if (!rawState) {
    const seed = createSeedState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    return normalizeState(JSON.parse(rawState));
  } catch {
    const seed = createSeedState();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
};

const saveHospitalState = (state) => {
  if (typeof window === "undefined") {
    return state;
  }

  const normalizedState = normalizeState(state);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedState));
  return normalizedState;
};

const mutateHospitalState = (updater) => {
  const currentState = loadHospitalState();
  const draftState = clone(currentState);
  const nextState = updater(draftState) || draftState;
  return saveHospitalState(nextState);
};

const searchHospitalEntities = (state, query) => {
  const normalizedQuery = String(query || "").trim().toLowerCase();

  if (!normalizedQuery) {
    return { patients: [], doctors: [], appointments: [] };
  }

  const contains = (value) => String(value || "").toLowerCase().includes(normalizedQuery);

  const patients = state.patients.filter((patient) =>
    [patient.firstName, patient.lastName, patient.email, patient.phoneNumber, patient.address].some(contains),
  );
  const doctors = state.doctors.filter((doctor) =>
    [doctor.firstName, doctor.lastName, doctor.email, doctor.phoneNumber, doctor.specialization, doctor.degree].some(contains),
  );
  const appointments = state.appointments.filter((appointment) =>
    [appointment.reason, appointment.notes, appointment.status, appointment.appointmentDate, appointment.appointmentTime].some(contains),
  );

  return { patients, doctors, appointments };
};

const buildReminderMailto = (appointment, state) => {
  const patient = state.patients.find((entry) => entry.id === appointment.patientId);
  const doctor = state.doctors.find((entry) => entry.id === appointment.doctorId);
  const subject = encodeURIComponent("Appointment Reminder");
  const body = encodeURIComponent(
    `Hello ${patient?.firstName || "there"},\n\nThis is a reminder for your appointment with ${doctor?.firstName || "your doctor"} ${doctor?.lastName || ""} on ${appointment.appointmentDate} at ${appointment.appointmentTime}.\n\nReason: ${appointment.reason}\n\nThank you.`,
  );

  return `mailto:${patient?.email || ""}?subject=${subject}&body=${body}`;
};

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

const buildPatientProfileForm = (patient = {}) => ({
  firstName: patient.firstName || "",
  lastName: patient.lastName || "",
  email: patient.email || "",
  password: patient.password || "",
  age: patient.age ?? "",
  phoneNumber: patient.phoneNumber || "",
  address: patient.address || "",
  profileImageUrl: patient.profileImageUrl || "",
});

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
  const userRole = String(user?.role || "PATIENT").toUpperCase();
  const [state, setState] = useState(() => loadHospitalState());
  const [activeTab, setActiveTab] = useState(userRole === "ADMIN" ? "overview" : userRole === "DOCTOR" ? "schedule" : "book");
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
  const [patientProfileForm, setPatientProfileForm] = useState(() => {
    if (userRole !== "PATIENT") {
      return buildPatientProfileForm({});
    }

    const persistedPatient = loadHospitalState().patients.find((entry) => entry.id === user.id);
    return buildPatientProfileForm(persistedPatient || user);
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const refreshState = () => setState(loadHospitalState());

  const currentUser = useMemo(() => {
    if (userRole === "PATIENT") {
      return state.patients.find((entry) => entry.id === user.id) || user;
    }

    if (userRole === "DOCTOR") {
      return state.doctors.find((entry) => entry.id === user.id) || user;
    }

    return user;
  }, [state, user, userRole]);

  const filteredSearch = useMemo(() => searchHospitalEntities(state, searchQuery), [state, searchQuery]);

  const myAppointments = useMemo(() => {
    if (userRole === "PATIENT") {
      return state.appointments.filter((entry) => entry.patientId === user.id);
    }

    if (userRole === "DOCTOR") {
      return state.appointments.filter((entry) => entry.doctorId === user.id);
    }

    return state.appointments;
  }, [state.appointments, user, userRole]);

  const calendarAppointments = useMemo(() => {
    const monthAppointments = myAppointments.filter((entry) => entry.appointmentDate.startsWith(calendarMonth));
    return selectedDay ? monthAppointments.filter((entry) => entry.appointmentDate === selectedDay) : monthAppointments;
  }, [calendarMonth, myAppointments, selectedDay]);

  const upcomingAppointments = useMemo(
    () =>
      [...myAppointments]
        .filter((entry) => entry.appointmentDate >= new Date().toISOString().slice(0, 10))
        .sort((left, right) => {
          const leftDate = new Date(`${left.appointmentDate}T${left.appointmentTime || "00:00"}`);
          const rightDate = new Date(`${right.appointmentDate}T${right.appointmentTime || "00:00"}`);
          return leftDate - rightDate;
        })
        .slice(0, 4),
    [myAppointments],
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

  const savePatientProfile = (event) => {
    event.preventDefault();

    if (userRole !== "PATIENT") {
      return;
    }

    mutateHospitalState((draft) => {
      draft.patients = draft.patients.map((entry) =>
        entry.id === user.id
          ? {
              ...entry,
              firstName: patientProfileForm.firstName,
              lastName: patientProfileForm.lastName,
              password: patientProfileForm.password || entry.password,
              age: Number(patientProfileForm.age),
              phoneNumber: patientProfileForm.phoneNumber,
              address: patientProfileForm.address,
              profileImageUrl: patientProfileForm.profileImageUrl,
            }
          : entry,
      );

      draft.users = draft.users.map((entry) =>
        entry.id === user.id
          ? {
              ...entry,
              firstName: patientProfileForm.firstName,
              lastName: patientProfileForm.lastName,
              password: patientProfileForm.password || entry.password,
            }
          : entry,
      );

      return draft;
    });

    refreshState();
    setIsEditingProfile(false);
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
    window.location.assign(mailto);
  };

  const tabs =
    userRole === "ADMIN"
      ? ["overview", "patients", "doctors", "appointments", "search"]
      : userRole === "DOCTOR"
        ? ["schedule", "records", "search", "profile"]
        : ["book", "records", "profile"];

  const selectedMonthCells = getMonthCells(calendarMonth, myAppointments);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-4xl border border-white/10 bg-linear-to-r from-cyan-500/20 via-slate-900 to-emerald-500/20 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-blue-900">Hospital portal</p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                {currentUser.firstName || currentUser.email}, your {userRole.toLowerCase()} dashboard
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white">
                {userRole}
              </div>
              <button
                onClick={onLogout}
                className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900/80 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-white">Upcoming appointments</h2>
                <p className="text-sm text-slate-400">Your next scheduled visits in one place.</p>
              </div>
              {userRole === "PATIENT" && (
                <button onClick={() => setActiveTab("book")} className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                  Book appointment
                </button>
              )}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => {
                  const patient = state.patients.find((entry) => entry.id === appointment.patientId);
                  const doctor = state.doctors.find((entry) => entry.id === appointment.doctorId);

                  return (
                    <div key={appointment.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-sm text-slate-300">{appointment.appointmentDate}</p>
                      <p className="mt-1 text-lg font-bold text-white">{appointment.appointmentTime}</p>
                      <p className="mt-1 text-sm text-slate-300">
                        {userRole === "PATIENT"
                          ? `Dr. ${doctor?.firstName || "Doctor"} ${doctor?.lastName || ""}`
                          : `${patient?.firstName || "Patient"} ${patient?.lastName || ""}`}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">{appointment.reason || "No reason added"}</p>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400 md:col-span-2 xl:col-span-4">
                  No upcoming appointments yet.
                </div>
              )}
            </div>
          </div>
        </header>

        <nav className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-slate-900/80 p-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-4 py-2 text-sm font-semibold capitalize transition ${
                activeTab === tab ? "bg-blue-900 text-white" : "text-slate-300 hover:bg-white/10"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {userRole === "ADMIN" && activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black">System overview</h2>
                  <p className="text-sm text-slate-400">Latest activity across patients, doctors, and scheduling.</p>
                </div>
                <button onClick={() => setActiveTab("appointments")} className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                  Schedule
                </button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <EntityPill label="Active patients" value={state.patients.filter((entry) => entry.isPatientActive).length} />
                <EntityPill label="Active doctors" value={state.doctors.filter((entry) => entry.isDoctorActive).length} />
                <EntityPill label="Prescriptions" value={state.prescriptions.length} />
                <EntityPill label="Medical logs" value={state.histories.length} />
              </div>
            </div>

            <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
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
            </div>
          </div>
        )}

        {userRole === "ADMIN" && activeTab === "patients" && (
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <form onSubmit={savePatient} className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
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
                <button className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800" type="submit">
                  {editingPatientId ? "Update patient" : "Create patient"}
                </button>
                {editingPatientId && (
                  <button type="button" onClick={resetPatientForm} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200">
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
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
          </div>
        )}

        {userRole === "ADMIN" && activeTab === "doctors" && (
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <form onSubmit={saveDoctor} className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
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
                <button className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800" type="submit">
                  {editingDoctorId ? "Update doctor" : "Create doctor"}
                </button>
                {editingDoctorId && (
                  <button type="button" onClick={resetDoctorForm} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200">
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
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
          </div>
        )}

        {userRole === "ADMIN" && activeTab === "appointments" && (
          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <form onSubmit={saveAppointment} className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
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
                <button className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800" type="submit">
                  {editingAppointmentId ? "Update appointment" : "Create appointment"}
                </button>
                {editingAppointmentId && (
                  <button type="button" onClick={resetAppointmentForm} className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200">
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
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
                        selectedDay === cell.currentDate ? "border-blue-300 bg-blue-900/20" : "border-white/10 bg-white/5 hover:bg-white/10"
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
          </div>
        )}

        {userRole === "ADMIN" && activeTab === "search" && (
          <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
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
          </div>
        )}

        {userRole === "DOCTOR" && activeTab === "schedule" && (
          <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
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
                        selectedDay === cell.currentDate ? "border-blue-300 bg-blue-900/20" : "border-white/10 bg-white/5 hover:bg-white/10"
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

            <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
              <h2 className="text-2xl font-black">Today&apos;s patients and records</h2>
              <div className="mt-4 space-y-3">
                {myAppointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-semibold text-white">
                      {state.patients.find((entry) => entry.id === appointment.patientId)?.firstName || "Patient"} - {appointment.reason}
                    </p>
                    <p className="text-sm text-slate-300">{appointment.appointmentDate} at {appointment.appointmentTime}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button onClick={() => setActiveTab("records")} className="rounded-full bg-blue-900 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-800">
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
          </div>
        )}

        {userRole === "DOCTOR" && activeTab === "records" && (
          <div className="grid gap-6 xl:grid-cols-2">
            <form onSubmit={savePrescription} className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
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
              <button type="submit" className="mt-4 rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">{editingPrescriptionId ? "Update prescription" : "Save prescription"}</button>
            </form>

            <form onSubmit={saveHistory} className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
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
              <button type="submit" className="mt-4 rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">{editingHistoryId ? "Update history" : "Save history"}</button>
            </form>

            <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6 xl:col-span-2">
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
          </div>
        )}

        {userRole === "DOCTOR" && activeTab === "search" && (
          <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
            <h2 className="text-2xl font-black">Search</h2>
            <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search patients, doctors, appointments" className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500" />
            <div className="mt-6 grid gap-6 xl:grid-cols-3">
              <SearchPanel title="Patients" items={filteredSearch.patients} renderItem={(item) => `${item.firstName} ${item.lastName}`} />
              <SearchPanel title="Doctors" items={filteredSearch.doctors} renderItem={(item) => `Dr. ${item.firstName} ${item.lastName}`} />
              <SearchPanel title="Appointments" items={filteredSearch.appointments} renderItem={(item) => `${item.appointmentDate} ${item.reason}`} />
            </div>
          </div>
        )}

        {userRole === "DOCTOR" && activeTab === "profile" && (
          <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
            <h2 className="text-2xl font-black">Doctor profile</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <EntityPill label="Name" value={`${currentUser.firstName} ${currentUser.lastName}`} />
              <EntityPill label="Specialization" value={currentUser.specialization} />
              <EntityPill label="Degree" value={currentUser.degree} />
            </div>
          </div>
        )}

        {userRole === "PATIENT" && activeTab === "book" && (
          <div className="max-w-2xl">
            <form onSubmit={saveAppointment} className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
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
              <button type="submit" className="mt-4 rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Book now</button>
            </form>
          </div>
        )}

        {userRole === "PATIENT" && activeTab === "records" && (
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
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

            <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
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
          </div>
        )}

        {userRole === "PATIENT" && activeTab === "profile" && (
          <div className="rounded-4xl border border-white/10 bg-slate-900/90 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">Patient profile</h2>
                <p className="text-sm text-slate-400">Edit your patient details here. Email stays read-only.</p>
              </div>
              <div className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white">
                {currentUser.isPatientActive ? "Active" : "Inactive"}
              </div>
            </div>

            { !isEditingProfile ? (
              <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-900 text-2xl font-black text-white">
                      {(currentUser.firstName?.[0] || "P") + (currentUser.lastName?.[0] || "")}
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">{currentUser.firstName} {currentUser.lastName}</p>
                      <p className="text-sm text-slate-400">Patient ID: {currentUser.id}</p>
                    </div>
                  </div>

                  {currentUser.profileImageUrl ? (
                    <img src={currentUser.profileImageUrl} alt={`${currentUser.firstName} ${currentUser.lastName}`} className="mt-5 h-56 w-full rounded-3xl object-cover" />
                  ) : (
                    <div className="mt-5 flex h-56 items-center justify-center rounded-3xl border border-dashed border-white/10 text-sm text-slate-400">
                      No profile image provided.
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <EntityPill label="First name" value={currentUser.firstName || "-"} />
                  <EntityPill label="Last name" value={currentUser.lastName || "-"} />
                  <EntityPill label="Email" value={currentUser.email || "-"} />
                  <EntityPill label="Phone number" value={currentUser.phoneNumber || "-"} />
                  <EntityPill label="Age" value={currentUser.age || "-"} />
                  <EntityPill label="Address" value={currentUser.address || "-"} />
                  <div className="sm:col-span-2 flex justify-end">
                    <button onClick={() => setIsEditingProfile(true)} className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Update profile</button>
                  </div>
                </div>
              </div>
            ) : (
            <form onSubmit={savePatientProfile} className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-900 text-2xl font-black text-white">
                    {(patientProfileForm.firstName?.[0] || "P") + (patientProfileForm.lastName?.[0] || "")}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">{patientProfileForm.firstName || "Patient"} {patientProfileForm.lastName || ""}</p>
                    <p className="text-sm text-slate-400">Patient ID: {currentUser.id}</p>
                  </div>
                </div>

                {patientProfileForm.profileImageUrl ? (
                  <img src={patientProfileForm.profileImageUrl} alt={`${patientProfileForm.firstName} ${patientProfileForm.lastName}`} className="mt-5 h-56 w-full rounded-3xl object-cover" />
                ) : (
                  <div className="mt-5 flex h-56 items-center justify-center rounded-3xl border border-dashed border-white/10 text-sm text-slate-400">Add a profile image URL to preview it here.</div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  value={patientProfileForm.firstName}
                  onChange={(event) => setPatientProfileForm((prev) => ({ ...prev, firstName: event.target.value }))}
                  placeholder="First name"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
                />
                <input
                  value={patientProfileForm.lastName}
                  onChange={(event) => setPatientProfileForm((prev) => ({ ...prev, lastName: event.target.value }))}
                  placeholder="Last name"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
                />
                <input
                  value={patientProfileForm.email}
                  readOnly
                  placeholder="Email"
                  className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-400 outline-none"
                />
                <input
                  type="password"
                  value={patientProfileForm.password}
                  onChange={(event) => setPatientProfileForm((prev) => ({ ...prev, password: event.target.value }))}
                  placeholder="Password"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
                />
                <input
                  type="number"
                  value={patientProfileForm.age}
                  onChange={(event) => setPatientProfileForm((prev) => ({ ...prev, age: event.target.value }))}
                  placeholder="Age"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
                />
                <input
                  value={patientProfileForm.phoneNumber}
                  onChange={(event) => setPatientProfileForm((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                  placeholder="Phone number"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
                />
                <input
                  value={patientProfileForm.address}
                  onChange={(event) => setPatientProfileForm((prev) => ({ ...prev, address: event.target.value }))}
                  placeholder="Address"
                  className="sm:col-span-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
                />
                <input
                  value={patientProfileForm.profileImageUrl}
                  onChange={(event) => setPatientProfileForm((prev) => ({ ...prev, profileImageUrl: event.target.value }))}
                  placeholder="Profile image URL"
                  className="sm:col-span-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-slate-500"
                />

                <div className="sm:col-span-2 flex items-center gap-3">
                  <button type="submit" className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // revert draft to persisted values
                      const stored = loadHospitalState().patients.find((entry) => entry.id === user.id) || currentUser;
                      setPatientProfileForm(buildPatientProfileForm(stored));
                      setIsEditingProfile(false);
                    }}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
            )}
          </div>
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