import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { authenticateUser } from "../lib/hospitalStore.js";


function Login({ onBack, onSuccess, defaultRole = "PATIENT" }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: String(defaultRole).toUpperCase(),
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    setValue("role", String(defaultRole).toUpperCase());
  }, [defaultRole, setValue]);

  const onSubmit = async (formData) => {
    setError("");

    try {
      setLoading(true);
      const response = await authenticateUser(formData);
      if (onSuccess) onSuccess(response);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-[2rem] border border-gray-200 bg-white p-6 shadow-lg">
      <h1 className="text-4xl font-black text-gray-800 mb-2">Login</h1>
      <p className="text-center text-gray-600 mb-4">Sign in with your account</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>

        {error && <p className="text-red-600 text-center text-sm mb-3">{error}</p>}

        <select
          {...register("role", {
            onChange: () => setError(""),
          })}
          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none"
        >
          <option value="DOCTOR">Doctor</option>
          <option value="PATIENT">Patient</option>
          <option value="ADMIN">Admin</option>
        </select>

        <input
          type="email"
          placeholder="Email"
          {...register("email", {
            required: "Please enter email",
            onChange: () => setError(""),
          })}
          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500"
        />
        {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}

        <input
          type="password"
          placeholder="Password"
          {...register("password", {
            required: "Please enter password",
            onChange: () => setError(""),
          })}
          className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none placeholder:text-gray-500"
        />
        {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-cyan-500 px-4 py-3 font-semibold text-white hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-60 transition"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default Login;
