import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../state/AuthContext";
import Icon from "../components/Icon";

export default function LoginPage() {
  const { setCurrent } = useAuth();
  const nav = useNavigate();

  const [mode, setMode] = useState<"user" | "employee">("user");
  const [email, setEmail] = useState("jordan.smith@example.com");
  const [password, setPassword] = useState("password1");
  const [employeeId, setEmployeeId] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "user") {
        const res = await api.post<{ userID: number; fname: string; lname: string; email: string }>(
          "/api/auth/login/user",
          { email, password }
        );
        setCurrent({
          kind: "user",
          id: res.userID,
          fname: res.fname,
          lname: res.lname,
          email: res.email,
        });
        nav("/products");
      } else {
        const res = await api.post<{
          employeeID: number; fname: string; lname: string; jobPosition: string;
        }>("/api/auth/login/employee", { employeeID: Number(employeeId), password });
        setCurrent({
          kind: "employee",
          id: res.employeeID,
          fname: res.fname,
          lname: res.lname,
          jobPosition: res.jobPosition,
        });
        nav("/dashboard");
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="login">
      <div style={{ display: "grid", placeItems: "center", marginBottom: "0.5rem" }}>
        <span className="brand-mark" style={{ width: 48, height: 48, borderRadius: 12 }}>
          <Icon name="leaf" size={28} />
        </span>
      </div>
      <h2>Welcome to GreenGrow</h2>
      <p className="subtitle">Sign in to continue to your garden.</p>

      <div className="tabs" style={{ margin: "1rem auto 0" }}>
        <button type="button" className={mode === "user" ? "active" : ""}     onClick={() => setMode("user")}>Customer</button>
        <button type="button" className={mode === "employee" ? "active" : ""} onClick={() => setMode("employee")}>Employee</button>
      </div>

      <form onSubmit={submit} className="form">
        {mode === "user" ? (
          <label>Email
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="you@example.com" />
          </label>
        ) : (
          <label>Employee ID
            <input value={employeeId} onChange={e => setEmployeeId(e.target.value)} type="number" required />
          </label>
        )}
        <label>Password
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" required />
        </label>
        <button type="submit" disabled={busy}>
          {busy ? "Signing in…" : mode === "user" ? "Sign in as customer" : "Sign in as employee"}
        </button>
        {error && <p className="error">{error}</p>}
      </form>

      <details>
        <summary>Demo credentials</summary>
        <ul>
          <li>Customer: <code>jordan.smith@example.com</code> / <code>password1</code></li>
          <li>Customer: <code>linh.nguyen@example.com</code> / <code>password2</code></li>
          <li>Employee ID <code>1</code> (Priya) / <code>admin1</code></li>
          <li>Employee ID <code>2</code> (Marcus) / <code>admin2</code></li>
        </ul>
      </details>
    </section>
  );
}
