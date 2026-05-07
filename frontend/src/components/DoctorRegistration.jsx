import { useState } from "react";
import { registerDoctor } from "../api";

export default function DoctorRegistration({ onBack, onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    phoneNumber: "",
    experience: "",
    specialization: "",
    degree: "",
    profileImageUrl: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.firstName || !formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      // eslint-disable-next-line no-unused-vars
      const { confirmPassword, ...dataToSend } = formData;
      const response = await registerDoctor(dataToSend);
      onSuccess(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <button onClick={onBack} style={{ marginBottom: "10px" }}>
        Back to Role Selection
      </button>

      <h1>Doctor Registration</h1>
      <p>Create your doctor account</p>

      {error && (
        <div style={{ color: "red", padding: "10px", marginBottom: "10px", border: "1px solid red" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label>First Name *</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginBottom: "10px", boxSizing: "border-box" }}
            required
          />
        </div>

        <div>
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginBottom: "10px", boxSizing: "border-box" }}
          />
        </div>

        <div>
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginBottom: "10px", boxSizing: "border-box" }}
            required
          />
        </div>

        <div>
          <label>Password *</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginBottom: "10px", boxSizing: "border-box" }}
            required
          />
        </div>

        <div>
          <label>Confirm Password *</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginBottom: "10px", boxSizing: "border-box" }}
            required
          />
        </div>

        <div>
          <label>Age *</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginBottom: "10px", boxSizing: "border-box" }}
            required
          />
        </div>

        <div>
          <label>Phone Number *</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginBottom: "10px", boxSizing: "border-box" }}
            required
          />
        </div>

        <div>
          <label>Experience (years) *</label>
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginBottom: "10px", boxSizing: "border-box" }}
            required
          />
        </div>

        <div>
          <label>Specialization *</label>
          <input
            type="text"
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            placeholder="e.g., Cardiology, Surgery"
            style={{ width: "100%", padding: "8px", marginBottom: "10px", boxSizing: "border-box" }}
            required
          />
        </div>

        <div>
          <label>Degree *</label>
          <input
            type="text"
            name="degree"
            value={formData.degree}
            onChange={handleChange}
            placeholder="e.g., MBBS, MD"
            style={{ width: "100%", padding: "8px", marginBottom: "10px", boxSizing: "border-box" }}
            required
          />
        </div>

        <div>
          <label>Profile Image URL</label>
          <input
            type="url"
            name="profileImageUrl"
            value={formData.profileImageUrl}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", marginBottom: "10px", boxSizing: "border-box" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            cursor: "pointer",
            marginTop: "10px",
          }}
        >
          {loading ? "Registering..." : "Register as Doctor"}
        </button>
      </form>
    </div>
  );
}
