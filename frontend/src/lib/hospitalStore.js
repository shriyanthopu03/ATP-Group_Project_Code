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
				medicines: [
					{ name: "Amlodipine", dosage: "5mg", duration: "30 days", instructions: "Take after breakfast" },
				],
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

export const saveHospitalState = (state) => {
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

const findAccount = (state, role, email) => {
	const normalizedRole = String(role || "").toUpperCase();
	const normalizedEmail = String(email || "").trim().toLowerCase();

	return state.users.find((user) => user.role === normalizedRole && user.email.toLowerCase() === normalizedEmail);
};

const buildRolePayload = (state, account) => {
	if (!account) {
		return null;
	}

	if (account.role === "PATIENT") {
		const patient = state.patients.find((entry) => entry.id === account.id) || {};
		return { ...patient, id: account.id, role: "PATIENT" };
	}

	if (account.role === "DOCTOR") {
		const doctor = state.doctors.find((entry) => entry.id === account.id) || {};
		return { ...doctor, id: account.id, role: "DOCTOR" };
	}

	return { id: account.id, email: account.email, role: "ADMIN", firstName: account.firstName, lastName: account.lastName };
};

export const authenticateUser = async ({ role, email, password }) => {
	const state = loadHospitalState();
	const account = findAccount(state, role, email);

	if (!account) {
		throw new Error("Invalid email or role");
	}

	if (account.password !== password) {
		throw new Error("Invalid password");
	}

	if (account.role === "PATIENT") {
		const patient = state.patients.find((entry) => entry.id === account.id);
		if (!patient?.isPatientActive) {
			throw new Error("Patient account is inactive");
		}
	}

	if (account.role === "DOCTOR") {
		const doctor = state.doctors.find((entry) => entry.id === account.id);
		if (!doctor?.isDoctorActive) {
			throw new Error("Doctor account is inactive");
		}
	}

	return {
		message: "login success",
		payload: buildRolePayload(state, account),
	};
};

const registerAccount = (role, formData) => {
	const createdState = mutateHospitalState((draftState) => {
		const accountId = createId();
		const commonAccount = {
			id: accountId,
			role,
			email: formData.email,
			password: formData.password,
			firstName: formData.firstName || "",
			lastName: formData.lastName || "",
		};

		draftState.users.push(commonAccount);

		if (role === "PATIENT") {
			draftState.patients.push({
				id: accountId,
				firstName: formData.firstName || "",
				lastName: formData.lastName || "",
				email: formData.email,
				password: formData.password,
				age: Number(formData.age || 0),
				phoneNumber: formData.phoneNumber || "",
				address: formData.address || "",
				profileImageUrl: formData.profileImageUrl || "",
				isPatientActive: true,
			});
		}

		if (role === "DOCTOR") {
			draftState.doctors.push({
				id: accountId,
				firstName: formData.firstName || "",
				lastName: formData.lastName || "",
				email: formData.email,
				password: formData.password,
				age: Number(formData.age || 0),
				phoneNumber: formData.phoneNumber || "",
				experience: Number(formData.experience || 0),
				specialization: formData.specialization || "General Medicine",
				degree: formData.degree || "",
				profileImageUrl: formData.profileImageUrl || "",
				isDoctorActive: true,
			});
		}

		if (role === "ADMIN") {
			draftState.users[draftState.users.length - 1] = {
				...commonAccount,
				firstName: formData.firstName || "",
				lastName: formData.lastName || "",
			};
		}

		return draftState;
	});

	const account = createdState.users[createdState.users.length - 1];
	return {
		message: `${role.toLowerCase()} registration success`,
		payload: buildRolePayload(createdState, account),
	};
};

export const registerPatientAccount = async (formData) => registerAccount("PATIENT", formData);
export const registerDoctorAccount = async (formData) => registerAccount("DOCTOR", formData);
export const registerAdminAccount = async (formData) => registerAccount("ADMIN", formData);

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