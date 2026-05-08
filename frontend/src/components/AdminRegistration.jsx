import { useState } from "react";
import { registerAdmin } from "../api.js";

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
    <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-cyan-950/20">
      <button onClick={onBack} className="mb-4 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200">
        Back to role selection
      </button>

      <h1 className="text-4xl font-black text-white">Admin registration</h1>
      <p className="mt-2 text-sm text-slate-400">Create an administrator account for dashboard access.</p>

      {error && <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">{error}</div>}
      {success && <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200">{success}</div>}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-3">
        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-500" required />
        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-500" />
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-500" required />
        <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Password" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-500" required />
        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm password" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-slate-500" required />

        <button type="submit" disabled={loading} className="rounded-full bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? "Registering..." : "Register as admin"}
        </button>
      </form>
    </div>
  )
}

export default AdminRegistration
