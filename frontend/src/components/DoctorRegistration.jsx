import { useState } from "react";
import { registerDoctor } from "../api.js";


function DoctorRegistration({ onBack, onSuccess }) {
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

    if (!formData.firstName || !formData.email || !formData.password || !formData.phoneNumber) {
      setError("Please fill in all required fields: Name, Email, Password, and Phone Number");
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

  if (loading) {
    return <p className="text-center text-4xl">Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center text-3xl">{error}</p>;
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-[2rem] border border-gray-200 bg-white p-6 shadow-lg">
      <h1 className="text-4xl font-black text-gray-800 mb-2">Doctor Registration</h1>
      <p className="text-center text-gray-600 mb-4">Create your doctor account</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Back to Role Selection
        </button>

        {error && <p className="text-red-600 text-center text-sm mb-3">{error}</p>}

        <input
          type="text"
          placeholder="First Name *"
          value={formData.firstName}
          onChange={handleChange}
          name="firstName"
          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500"
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          name="lastName"
          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500"
        />
        <input
          type="email"
          placeholder="Email *"
          value={formData.email}
          onChange={handleChange}
          name="email"
          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500"
          required
        />
        <input
          type="password"
          placeholder="Password *"
          value={formData.password}
          onChange={handleChange}
          name="password"
          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500"
          required
        />
        <input
          type="password"
          placeholder="Confirm Password *"
          value={formData.confirmPassword}
          onChange={handleChange}
          name="confirmPassword"
          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500"
          required
        />
        <input
          type="tel"
          placeholder="Phone Number *"
          value={formData.phoneNumber}
          onChange={handleChange}
          name="phoneNumber"
          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500"
          required
        />
        <input
          type="number"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          name="age"
          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500"
        />
        <input
          type="number"
          placeholder="Experience (years)"
          value={formData.experience}
          onChange={handleChange}
          name="experience"
          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500"
        />
        <input
          type="text"
          placeholder="Specialization (e.g., Cardiology)"
          value={formData.specialization}
          onChange={handleChange}
          name="specialization"
          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500"
        />
        <input
          type="text"
          placeholder="Degree (e.g., MBBS)"
          value={formData.degree}
          onChange={handleChange}
          name="degree"
          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500"
        />
        <input
          type="url"
          placeholder="Profile Image URL"
          value={formData.profileImageUrl}
          onChange={handleChange}
          name="profileImageUrl"
          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-cyan-500 px-4 py-3 font-semibold text-white hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60 transition"
        >
          {loading ? "Registering..." : "Register as Doctor"}
        </button>
      </form>
    </div>
  );
}

export default DoctorRegistration;
