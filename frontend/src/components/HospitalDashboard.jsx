import React, { useMemo, useState, useEffect } from "react";
import AdminDashboard from "./AdminDashboard";
import DoctorDashboard from "./DoctorDashboard";
import PatientDashboard from "./PatientDashboard";
import DashboardHeader from "./DashboardHeader";
import UpcomingAppointments from "./UpcomingAppointments";
import NavigationTabs from "./NavigationTabs";
import { loadHospitalState, mutateHospitalState } from "../utils/hospitalState";
import { useAuth } from "../store/authStore";

const HospitalDashboard = ({ user, onLogout }) => {
  const userRole = String(user?.role || "PATIENT").toUpperCase();
  const [state, setState] = useState(() => loadHospitalState());
  const [activeTab, setActiveTab] = useState(userRole === "ADMIN" ? "overview" : userRole === "DOCTOR" ? "schedule" : "book");
  const fetchDoctors = useAuth((state) => state.fetchDoctors);
  const fetchPatients = useAuth((state) => state.fetchPatients);
  const fetchAppointments = useAuth((state) => state.fetchAppointments);
  const fetchPrescriptions = useAuth((state) => state.fetchPrescriptions);

  useEffect(() => {
    const syncData = async () => {
      try {
        const [doctorsFromDb, patientsFromDb, appointmentsFromDb, prescriptionsFromDb] = await Promise.all([
          fetchDoctors(),
          fetchPatients(),
          fetchAppointments(),
          fetchPrescriptions()
        ]);

        mutateHospitalState((draft) => {
          // Sync Doctors
          if (doctorsFromDb && doctorsFromDb.length > 0) {
            draft.doctors = doctorsFromDb.map(doc => ({
              ...doc,
              _id: String(doc._id || doc.id),
              id: String(doc._id || doc.id)
            }));
          }

          // Sync Patients
          if (patientsFromDb && patientsFromDb.length > 0) {
            draft.patients = patientsFromDb.map(pat => ({
              ...pat,
              _id: String(pat._id || pat.id),
              id: String(pat._id || pat.id)
            }));
          }

          // Sync Prescriptions
          if (prescriptionsFromDb && prescriptionsFromDb.length > 0) {
            draft.prescriptions = prescriptionsFromDb.map(p => ({
              ...p,
              _id: String(p._id || p.id),
              id: String(p._id || p.id),
              patientId: p.patient?._id || p.patient,
              doctorId: p.doctor?._id || p.doctor,
            }));
          }

          // Sync Appointments
          if (appointmentsFromDb && appointmentsFromDb.length > 0) {
            draft.appointments = appointmentsFromDb.map(apt => {
              const id = String(apt._id || apt.id);
              return {
                ...apt,
                _id: id,
                id: id,
                doctorId: apt.doctor?._id || apt.doctor,
                patientId: apt.patient?._id || apt.patient,
                appointmentDate: apt.datetime ? String(apt.datetime).split('T')[0] : "",
                appointmentTime: apt.datetime ? String(apt.datetime).split('T')[1]?.slice(0, 5) : ""
              };
            });
          }
          return draft;
        });
        refreshState();
      } catch (err) {
        console.error("Error syncing data from DB:", err);
      }
    };

    syncData();
  }, [fetchDoctors, fetchAppointments]);

  const refreshState = () => {
    const newState = loadHospitalState();
    setState({ ...newState });
  };

  const currentUser = useMemo(() => {
    const userId = String(user?._id || user?.id);
    if (userRole === "PATIENT") {
      return state.patients.find((entry) => String(entry._id || entry.id) === userId) || user;
    }
    if (userRole === "DOCTOR") {
      return state.doctors.find((entry) => String(entry._id || entry.id) === userId) || user;
    }
    return user;
  }, [state, user, userRole]);

  const myAppointments = useMemo(() => {
    const userId = String(currentUser?._id || currentUser?.id || user?._id || user?.id);
    if (userRole === "PATIENT") {
      return state.appointments.filter((entry) => String(entry.patientId) === userId);
    }
    if (userRole === "DOCTOR") {
      return state.appointments.filter((entry) => String(entry.doctorId) === userId);
    }
    return state.appointments;
  }, [state.appointments, user, currentUser, userRole]);

  const upcomingAppointments = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return [...myAppointments]
      .filter((entry) => entry.appointmentDate >= today)
      .sort((left, right) => {
        const leftDate = new Date(`${left.appointmentDate}T${left.appointmentTime || "00:00"}`);
        const rightDate = new Date(`${right.appointmentDate}T${right.appointmentTime || "00:00"}`);
        return leftDate - rightDate;
      })
      .slice(0, 4);
  }, [myAppointments]);

  const tabs =
    userRole === "ADMIN"
      ? ["overview", "patients", "doctors", "appointments", "search"]
      : userRole === "DOCTOR"
        ? ["schedule", "records", "search", "profile"]
        : ["book", "records", "profile"];

  return (
    <div className="min-h-screen bg-transparent text-slate-800 selection:bg-blue-500/10">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-blue-400/10 blur-[150px]" />
        <div className="absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-indigo-400/10 blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <DashboardHeader 
          userRole={userRole} 
          currentUser={currentUser} 
          onLogout={onLogout} 
        />

        <UpcomingAppointments 
          upcomingAppointments={upcomingAppointments} 
          userRole={userRole} 
          setActiveTab={setActiveTab} 
          state={state} 
        />

        <NavigationTabs 
          tabs={tabs} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        <div className="mt-8">
          {userRole === "ADMIN" && (
            <AdminDashboard activeTab={activeTab} state={state} setActiveTab={setActiveTab} refreshState={refreshState} />
          )}

          {userRole === "DOCTOR" && (
            <DoctorDashboard activeTab={activeTab} state={state} setActiveTab={setActiveTab} currentUser={currentUser} refreshState={refreshState} />
          )}

          {userRole === "PATIENT" && (
            <PatientDashboard activeTab={activeTab} state={state} user={user} currentUser={currentUser} refreshState={refreshState} />
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
