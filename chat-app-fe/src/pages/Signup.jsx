import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthShell, Field, primaryBtn } from "./Login";

export default function Signup() {
  const { signup, login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (form.password.length < 6) {
      setLocalError("Password must be at least 6 characters.");
      return;
    }
    try {
      await signup(form);
      // /auth/signup doesn't return a token, so log in right after to get one.
      await login({ email: form.email, password: form.password });
      navigate("/", { replace: true });
    } catch {
      // error already surfaced via auth context
    }
  };

  return (
    <AuthShell title="Create your account" subtitle="A few details and you're in.">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Field label="Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} required />
        <Field
          label="Email"
          type="email"
          value={form.email}
          onChange={(v) => setForm((f) => ({ ...f, email: v }))}
          required
        />
        <Field
          label="Password"
          type="password"
          value={form.password}
          onChange={(v) => setForm((f) => ({ ...f, password: v }))}
          required
        />
        {(localError || error) && <div style={{ color: "var(--danger)", fontSize: 13 }}>{localError || error}</div>}
        <button type="submit" disabled={loading} style={primaryBtn}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <div style={{ marginTop: 18, fontSize: 13.5, color: "var(--text-muted)" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "var(--accent-2)" }}>
          Sign in
        </Link>
      </div>
    </AuthShell>
  );
}
