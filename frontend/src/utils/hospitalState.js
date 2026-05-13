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
  };
};

const normalizeState = (state) => ({
  users: Array.isArray(state?.users) ? state.users : [],
  patients: Array.isArray(state?.patients) ? state.patients : [],
  doctors: Array.isArray(state?.doctors) ? state.doctors : [],
  appointments: Array.isArray(state?.appointments) ? state.appointments : [],
  prescriptions: Array.isArray(state?.prescriptions) ? state.prescriptions : [],
});

export const loadHospitalState = () => {
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

export const mutateHospitalState = (updater) => {
  const currentState = loadHospitalState();
  const draftState = clone(currentState);
  const nextState = updater(draftState) || draftState;
  return saveHospitalState(nextState);
};

export const searchHospitalEntities = (state, query) => {
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

export const buildReminderMailto = (appointment, state) => {
  const patient = state.patients.find((entry) => entry.id === appointment.patientId);
  const doctor = state.doctors.find((entry) => entry.id === appointment.doctorId);
  const subject = encodeURIComponent("Appointment Reminder");
  const body = encodeURIComponent(
    `Hello ${patient?.firstName || "there"},\n\nThis is a reminder for your appointment with ${doctor?.firstName || "your doctor"} ${doctor?.lastName || ""} on ${appointment.appointmentDate} at ${appointment.appointmentTime}.\n\nReason: ${appointment.reason}\n\nThank you.`,
  );

  return `mailto:${patient?.email || ""}?subject=${subject}&body=${body}`;
};

export const emptyPatient = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  age: "",
  phoneNumber: "",
  address: "",
  profileImageUrl: "",
};

export const emptyDoctor = {
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

export const emptyAppointment = {
  patientId: "",
  doctorId: "",
  appointmentDate: new Date().toISOString().slice(0, 10),
  appointmentTime: "09:00",
  reason: "",
  notes: "",
  status: "scheduled",
};

export const emptyPrescription = {
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

export const buildPatientProfileForm = (patient = {}) => ({
  firstName: patient.firstName || "",
  lastName: patient.lastName || "",
  email: patient.email || "",
  password: "",
  age: patient.age ?? "",
  phoneNumber: patient.phoneNumber || "",
  address: patient.address || "",
  experience: patient.experience || "",
  specialization: patient.specialization || "",
  degree: patient.degree || "",
  profileImageUrl: patient.profileImageUrl || "",
});

export const buildDoctorProfileForm = (doctor = {}) => ({
  firstName: doctor.firstName || "",
  lastName: doctor.lastName || "",
  email: doctor.email || "",
  password: doctor.password || "",
  age: doctor.age ?? "",
  phoneNumber: doctor.phoneNumber || "",
  address: doctor.address || "",
  experience: doctor.experience || "",
  specialization: doctor.specialization || "",
  degree: doctor.degree || "",
  profileImageUrl: doctor.profileImageUrl || "",
});

export const formatDate = (dateValue) =>
  new Date(dateValue).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export const formatMonthValue = (dateValue) => {
  const month = String(dateValue.getMonth() + 1).padStart(2, "0");
  return `${dateValue.getFullYear()}-${month}`;
};

export const getMonthCells = (monthValue, appointments) => {
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
    const monthPad = String(month + 1).padStart(2, "0");
    const dayPad = String(day).padStart(2, "0");
    const currentDate = `${year}-${monthPad}-${dayPad}`;
    const dayAppointments = (appointments || []).filter((entry) => {
       const aptDate = String(entry.appointmentDate || entry.date || "").split('T')[0];
       // Only count appointments that are NOT completed
       return aptDate === currentDate && entry.status !== "completed";
    });
    cells.push({ day, currentDate, dayAppointments });
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
};
