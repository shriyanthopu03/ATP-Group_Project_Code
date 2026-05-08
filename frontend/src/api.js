import {
  authenticateUser,
  registerAdminAccount,
  registerDoctorAccount,
  registerPatientAccount,
} from "./lib/hospitalStore";

// Doctor Registration
export const registerDoctor = async (doctorData) => {
  try {
    return await registerDoctorAccount(doctorData);
  } catch (error) {
    console.error("Doctor registration error:", error);
    throw error;
  }
};

// Patient Registration
export const registerPatient = async (patientData) => {
  try {
    return await registerPatientAccount(patientData);
  } catch (error) {
    console.error("Patient registration error:", error);
    throw error;
  }
};

// Login (supports role, email, password)
export const login = async (credentials) => {
  try {
    return await authenticateUser(credentials);
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const registerAdmin = async (adminData) => {
  try {
    return await registerAdminAccount(adminData);
  } catch (error) {
    console.error("Admin registration error:", error);
    throw error;
  }
};
