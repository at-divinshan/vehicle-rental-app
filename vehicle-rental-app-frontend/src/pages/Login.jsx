import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client";

function Login({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ full_name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const payload = { ...form, email: form.email.trim().toLowerCase() };
      const result = await (mode === "login" ? api.login(payload) : api.register(payload));
      localStorage.setItem("vehicle_rental_token", result.access_token);
      onLogin(result.user);
      navigate(location.state?.from || (result.user.role === "admin" ? "/dashboard" : "/vehicles"), { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">YAAL VAZH RENTALS</p>
        <h1>{mode === "login" ? "Welcome back" : "Create your account"}</h1>
        <p className="auth-intro">Sign in to reserve a vehicle and keep every booking in one place.</p>
        <form onSubmit={submit} className="auth-form">
          {mode === "register" && <input required placeholder="Full name" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} />}
          <label htmlFor="auth-email">Email address</label>
          <input id="auth-email" name="email" autoComplete="username" autoCapitalize="none" spellCheck={false} required type="email" placeholder="Email address" value={form.email} onChange={(e) => update("email", e.target.value)} />
          {mode === "register" && <input placeholder="Phone number" value={form.phone} onChange={(e) => update("phone", e.target.value)} />}
          <label htmlFor="auth-password">Password</label>
          <input id="auth-password" name="password" required minLength={mode === "register" ? 8 : undefined} maxLength={128} autoComplete={mode === "register" ? "new-password" : "current-password"} type={showPassword ? "text" : "password"} placeholder="Password" value={form.password} onChange={(e) => update("password", e.target.value)} />
          <button className="auth-switch" type="button" aria-controls="auth-password" aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}>
            {showPassword ? "Hide password" : "Show password"}
          </button>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="cta-btn" disabled={busy}>{busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}</button>
        </form>
        <button className="auth-switch" type="button" disabled={busy} onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
          {mode === "login" ? "New to Yaal Vazh? Create an account" : "Already have an account? Sign in"}
        </button>
      </section>
    </main>
  );
}

export default Login;
