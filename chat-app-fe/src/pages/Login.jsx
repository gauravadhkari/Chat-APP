import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate("/", { replace: true });
    } catch {
      // error already surfaced via auth context
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to keep the conversation going.">
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
        {error && <div style={{ color: "var(--danger)", fontSize: 13 }}>{error}</div>}
        <button type="submit" disabled={loading} style={primaryBtn}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <div style={{ marginTop: 18, fontSize: 13.5, color: "var(--text-muted)" }}>
        New here?{" "}
        <Link to="/signup" style={{ color: "var(--accent-2)" }}>
          Create an account
        </Link>
      </div>
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }) {
  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 15% 20%, #1b2230 0%, #0d1117 55%)",
        padding: 20,
      }}
    >
      <div
        style={{
          width: 380,
          maxWidth: "100%",
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "32px 28px",
        }}
      >
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 24, marginBottom: 4 }}>
          {title}
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 13.5, marginBottom: 22 }}>{subtitle}</div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, type = "text", value, onChange, required }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5, color: "var(--text-muted)" }}>
      {label}
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "var(--bg-surface-raised)",
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "10px 12px",
          fontSize: 14,
          color: "var(--text-primary)",
        }}
      />
    </label>
  );
}

export const primaryBtn = {
  marginTop: 4,
  background: "var(--accent)",
  color: "#1a0d08",
  border: "none",
  borderRadius: 10,
  padding: "11px 0",
  fontWeight: 600,
  fontSize: 14.5,
  fontFamily: "var(--font-display)",
};
