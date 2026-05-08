import { useState } from "react";
import { registerDoctorAccount } from "../lib/hospitalStore";


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
      const response = await registerDoctorAccount(dataToSend);
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
    <div>
      <div className="border-b-4">
        <h1 className="text-5xl text-center text-gray-600 font-black mb-2">Doctor Registration</h1>
        <p className="text-center text-gray-500 mb-2">Create your doctor account</p>
        <form className="max-w-md mx-auto mt-4" onSubmit={handleSubmit}>
          <button
            type="button"
            onClick={onBack}
            className="text-2xl rounded-2xl bg-gray-600 text-white block mx-auto p-4 mb-4 w-full"
          >
            Back to Role Selection
          </button>  
          <input
            type="text"
            placeholder="First Name *"
            value={formData.firstName}
            onChange={handleChange}
            name="firstName"
            className="mb-3 border-2 p-3 w-full rounded-2xl"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            name="lastName"
            className="mb-3 border-2 p-3 w-full rounded-2xl"
          />
          <input
            type="email"
            placeholder="Email *"
            value={formData.email}
            onChange={handleChange}
            name="email"
            className="mb-3 border-2 p-3 w-full rounded-2xl"
            required
          />
          <input
            type="password"
            placeholder="Password *"
            value={formData.password}
            onChange={handleChange}
            name="password"
            className="mb-3 border-2 p-3 w-full rounded-2xl"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password *"
            value={formData.confirmPassword}
            onChange={handleChange}
            name="confirmPassword"
            className="mb-3 border-2 p-3 w-full rounded-2xl"
            required
          />
          <input
            type="tel"
            placeholder="Phone Number *"
            value={formData.phoneNumber}
            onChange={handleChange}
            name="phoneNumber"
            className="mb-3 border-2 p-3 w-full rounded-2xl"
            required
          />
          <input
            type="number"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            name="age"
            className="mb-3 border-2 p-3 w-full rounded-2xl"
          />
          <input
            type="number"
            placeholder="Experience (years)"
            value={formData.experience}
            onChange={handleChange}
            name="experience"
            className="mb-3 border-2 p-3 w-full rounded-2xl"
          />
          <input
            type="text"
            placeholder="Specialization (e.g., Cardiology)"
            value={formData.specialization}
            onChange={handleChange}
            name="specialization"
            className="mb-3 border-2 p-3 w-full rounded-2xl"
          />
          <input
            type="text"
            placeholder="Degree (e.g., MBBS)"
            value={formData.degree}
            onChange={handleChange}
            name="degree"
            className="mb-3 border-2 p-3 w-full rounded-2xl"
          />
          <input
            type="url"
            placeholder="Profile Image URL"
            value={formData.profileImageUrl}
            onChange={handleChange}
            name="profileImageUrl"
            className="mb-3 border-2 p-3 w-full rounded-2xl"
          />
          <button
            type="submit"
            disabled={loading}
            className="text-2xl rounded-2xl bg-gray-600 text-white block mx-auto p-4 mb-4 w-full"
          >
            {loading ? "Registering..." : "Register as Doctor"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default DoctorRegistration;
