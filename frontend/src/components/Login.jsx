import { useState } from "react";
import { login } from "/src/api.js";


function Login({ onBack, onSuccess }) {
  const [formData, setFormData] = useState({ role: "PATIENT", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const response = await login(formData);
      if (onSuccess) onSuccess(response);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="border-b-4">
        <h1 className="text-5xl text-center text-gray-600 font-black mb-2">Login</h1>
        <p className="text-center text-gray-500 mb-2">Sign in with your account</p>

        <form className="max-w-md mx-auto mt-4" onSubmit={handleSubmit}>
          <button
            type="button"
            onClick={onBack}
            className="text-2xl rounded-2xl bg-gray-600 text-white block mx-auto p-4 mb-4 w-full"
          >
            Back
          </button>

          {error && <p className="text-red-500 text-center mb-3">{error}</p>}

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mb-3 border-2 p-3 w-full rounded-2xl"
          >
            <option value="DOCTOR">Doctor</option>
            <option value="PATIENT">Patient</option>
            <option value="ADMIN">Admin</option>
          </select>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="mb-3 border-2 p-3 w-full rounded-2xl"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="mb-3 border-2 p-3 w-full rounded-2xl"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="text-2xl rounded-2xl bg-gray-600 text-white block mx-auto p-4 mb-4 w-full"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
