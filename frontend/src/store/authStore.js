import { create } from "zustand";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getApiErrorMessage = (err, fallbackMessage) =>
  err.response?.data?.error || err.response?.data?.message || err.message || fallbackMessage;

export const useAuth = create((set) => ({
  currentUser: null,
  loading: false,
  isAuthenticated: false,
  error: null,
  login: async (userCred) => {
    try {
      set({ loading: true, currentUser: null, isAuthenticated: false, error: null });
      const res = await axios.post(`${API_BASE_URL}/login`, userCred, { withCredentials: true });
      if (res.status === 200) {
        set({
          currentUser: res.data?.payload,
          loading: false,
          isAuthenticated: true,
          error: null,
        });
      }
      return res.data;
    } catch (err) {
      console.log("err is ", err);
      const errorMessage = getApiErrorMessage(err, "Login failed");
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },
  fetchDoctors: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/doctors`, { withCredentials: true });
      if (res.status === 200) {
        return res.data?.payload || [];
      }
      return [];
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
      return [];
    }
  },
  fetchPatients: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/patients`, { withCredentials: true });
      if (res.status === 200) {
        return res.data?.payload || [];
      }
      return [];
    } catch (err) {
      console.error("Failed to fetch patients:", err);
      return [];
    }
  },
  fetchPrescriptions: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/prescriptions`, { withCredentials: true });
      if (res.status === 200) {
        return res.data?.payload || [];
      }
      return [];
    } catch (err) {
      console.error("Failed to fetch prescriptions:", err);
      return [];
    }
  },
  savePrescription: async (prescriptionData) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.post(`${API_BASE_URL}/prescriptions`, prescriptionData, { withCredentials: true });
      set({ loading: false });
      return res.data;
    } catch (err) {
      const errorMessage = getApiErrorMessage(err, "Failed to save prescription");
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },
  fetchAppointments: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/appointments`, { withCredentials: true });
      if (res.status === 200) {
        return res.data?.payload || [];
      }
      return [];
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      return [];
    }
  },
  bookAppointment: async (appointmentData) => {
    try {
      set({ loading: true, error: null });
      
      // Extract the actual MongoDB ID from the data.
      const doctorId = appointmentData.doctorId?._id || appointmentData.doctorId;
      
      // Ensure we have a valid patient ID from either source
      const patientId = appointmentData.patientId || appointmentData.patient?._id;

      if (!patientId || patientId === "undefined") {
        throw new Error("Patient ID is missing. Please refresh the page and try again.");
      }

      const payload = {
        doctor: doctorId,
        patient: patientId,
        datetime: appointmentData.appointmentDate ? `${appointmentData.appointmentDate}T${appointmentData.appointmentTime || "09:00"}:00.000Z` : new Date().toISOString(),
        reason: appointmentData.reason || appointmentData.notes || "General Consultation",
        status: "scheduled"
      };

      const res = await axios.post(`${API_BASE_URL}/appointments`, payload, { withCredentials: true });
      set({ loading: false });
      return res.data;
    } catch (err) {
      const errorMessage = getApiErrorMessage(err, "Booking failed");
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },
  registerDoctor: async (doctorData) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.post(`${API_BASE_URL}/doctors`, doctorData, { withCredentials: true });
      if (res.status === 201) {
        set({ currentUser: res.data?.payload, isAuthenticated: true, loading: false, error: null });
      }
      return res.data;
    } catch (err) {
      const errorMessage = getApiErrorMessage(err, "Registration failed");
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },
  registerPatient: async (patientData) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.post(`${API_BASE_URL}/patients`, patientData, { withCredentials: true });
      if (res.status === 201) {
        set({ currentUser: res.data?.payload, isAuthenticated: true, loading: false, error: null });
      }
      return res.data;
    } catch (err) {
      const errorMessage = getApiErrorMessage(err, "Registration failed");
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },
  registerAdmin: async (adminData) => {
    try {
      set({ loading: true, error: null });
      const res = await axios.post(`${API_BASE_URL}/admins`, adminData, { withCredentials: true });
      if (res.status === 201) {
        set({ currentUser: res.data?.payload, isAuthenticated: true, loading: false, error: null });
      }
      return res.data;
    } catch (err) {
      const errorMessage = getApiErrorMessage(err, "Registration failed");
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },
  logout: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/logout`, { withCredentials: true });
      if (res.status === 200) {
        set({
          currentUser: null,
          isAuthenticated: false,
          error: null,
          loading: false,
        });
      }
      return res.data;
    } catch (err) {
      const errorMessage = getApiErrorMessage(err, "Logout failed");
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        error: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },
  checkAuth: async () => {
    try {
      set({ loading: true });
      const res = await axios.get(`${API_BASE_URL}/check-auth`, { withCredentials: true });

      set({
        currentUser: res.data.payload,
        isAuthenticated: true,
        loading: false,
      });
      return res.data;
    } catch (err) {
      // If user is not logged in → do nothing
      if (err.response?.status === 401) {
        set({
          currentUser: null,
          isAuthenticated: false,
          loading: false,
        });
        return;
      }

      // other errors
      console.error("Auth check failed:", err);
      set({ loading: false });
      throw err;
    }
  },
}));
