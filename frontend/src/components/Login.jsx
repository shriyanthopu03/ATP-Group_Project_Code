import  { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../Store/authStore.js";


function Login({ onBack, onSuccess, defaultRole = "PATIENT" }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useAuth((state) => state.login);
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
      const response = await login(formData);
      if (onSuccess) onSuccess({ ...response, role: formData.role });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md border border-white bg-white/70 p-8 shadow-2xl backdrop-blur-xl" style={{ borderRadius: "2.5rem" }}>
      <h1 className="text-5xl font-black mb-2 text-center bg-linear-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">Login</h1>
      <p className="text-center text-slate-500 mb-6 font-bold">Sign in with your account</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-100 transition-all"
        >
          BACK
        </button>

        {error && <p className="text-red-600 text-center text-sm font-bold drop-shadow-sm">{error}</p>}

        <select
          {...register("role", {
            onChange: () => setError(""),
          })}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-blue-500/50 transition-colors"
        >
          <option value="DOCTOR" className="bg-white text-slate-900">Doctor</option>
          <option value="PATIENT" className="bg-white text-slate-900">Patient</option>
          <option value="ADMIN" className="bg-white text-slate-900">Admin</option>
        </select>

        <input
          type="email"
          placeholder="Email"
          {...register("email", {
            required: "Please enter email",
            onChange: () => setError(""),
          })}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500/50 transition-colors"
        />
        {errors.email && <p className="text-red-500 text-sm font-bold">{errors.email.message}</p>}

        <input
          type="password"
          placeholder="Password"
          {...register("password", {
            required: "Please enter password",
            onChange: () => setError(""),
          })}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500/50 transition-colors"
        />
        {errors.password && <p className="text-red-500 text-sm font-bold">{errors.password.message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-blue-600 px-4 py-4 font-black text-white shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 transition-all mt-4"
        >
          {loading ? "SIGNING IN..." : "SIGN IN"}
        </button>
      </form>
    </div>
  );
}

export default Login;
