const API_BASE_URL = "http://localhost:5000/api";

// Doctor Registration
export const registerDoctor = async (doctorData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/doctors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(doctorData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Doctor registration failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Doctor registration error:", error);
    throw error;
  }
};

// Patient Registration
export const registerPatient = async (patientData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patientData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Patient registration failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Patient registration error:", error);
    throw error;
  }
};
