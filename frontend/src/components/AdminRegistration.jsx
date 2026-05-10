import { useState } from "react";
import { useAuth } from "../store/authStore.js";


function AdminRegistration({ onBack, onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const registerAdmin = useAuth((state) => state.registerAdmin);

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
    setSuccess("");

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
      const response = await registerAdmin(dataToSend);
      setSuccess("Admin registration successful");
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md border border-gray-200 bg-white p-6 shadow-lg" style={{ borderRadius: "1.5rem" }}>
      <h1 className="text-4xl font-black text-gray-800">Admin registration</h1>
      <p className="mt-2 text-sm text-gray-600">Create an administrator account for dashboard access.</p>

      {error && <div className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {success && <div className="mt-4 rounded-2xl border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <button type="button" onClick={onBack} className="w-full rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
          Back to Role Selection
        </button>

        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500" required />
        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500" />
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500" required />
        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500" required />
        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm password" className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500" required />

        <button type="submit" disabled={loading} className="w-full rounded-full bg-blue-900 px-4 py-3 font-semibold text-white hover:bg-blue-800 transition disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? "Registering..." : "Register as admin"}
        </button>
      </form>
    </div>
  );
}

export default AdminRegistration
