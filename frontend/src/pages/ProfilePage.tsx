import { useEffect, useState } from "react";
import { api } from "../api/client";
import Icon from "../components/Icon";
import { useAuth } from "../state/AuthContext";
import type { User } from "../types";

export default function ProfilePage() {
  const { current, updateCurrent } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [emails, setEmails] = useState<string[]>([""]);
  const [phones, setPhones] = useState<string[]>([""]);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!current || current.kind !== "user") return;
    setLoading(true);
    api
      .get<User>(`/api/users/${current.id}`)
      .then((u) => {
        setFname(u.fname);
        setLname(u.lname);
        setEmails(u.emails.length ? u.emails : [""]);
        setPhones(u.phones.length ? u.phones : [""]);
        setError(null);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [current]);

  if (!current || current.kind !== "user") {
    return <p className="muted">You must be signed in as a customer to view your profile.</p>;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!current) return;
    setSaving(true);
    setError(null);
    setToast(null);
    try {
      const body = {
        fname: fname.trim(),
        lname: lname.trim(),
        password: password.trim() || null,
        emails: emails.map((s) => s.trim()).filter(Boolean),
        phones: phones.map((s) => s.trim()).filter(Boolean),
      };
      const updated = await api.put<User>(`/api/users/${current.id}/profile`, body);
      updateCurrent({
        fname: updated.fname,
        lname: updated.lname,
        email: updated.emails[0] ?? current.email,
      });
      setPassword("");
      setToast("Profile saved.");
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }

  function updateListAt(
    list: string[],
    setter: (next: string[]) => void,
    index: number,
    value: string
  ) {
    const next = [...list];
    next[index] = value;
    setter(next);
  }

  function removeAt(list: string[], setter: (next: string[]) => void, index: number) {
    const next = list.filter((_, i) => i !== index);
    setter(next.length ? next : [""]);
  }

  if (loading) return <p className="muted">Loading your profile…</p>;

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>My profile</h2>
          <p className="subtitle muted">
            Update your name, contact emails, and phone numbers. Changes are saved directly to the database.
          </p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {toast && <p className="toast">{toast}</p>}

      <form onSubmit={save} className="form" style={{ maxWidth: 640 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
          <label>
            First name
            <input value={fname} onChange={(e) => setFname(e.target.value)} required />
          </label>
          <label>
            Last name
            <input value={lname} onChange={(e) => setLname(e.target.value)} required />
          </label>
        </div>

        <fieldset style={{ border: "1px solid var(--border-soft)", borderRadius: 10, padding: "0.75rem 1rem" }}>
          <legend style={{ padding: "0 0.4rem", color: "var(--muted)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Emails on file
          </legend>
          {emails.map((email, i) => (
            <div key={i} style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => updateListAt(emails, setEmails, i, e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="danger"
                onClick={() => removeAt(emails, setEmails, i)}
                disabled={emails.length === 1 && !email}
              >
                <Icon name="trash" size={14} /> Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="secondary"
            style={{ marginTop: "0.6rem" }}
            onClick={() => setEmails([...emails, ""])}
          >
            <Icon name="plus" size={14} /> Add email
          </button>
        </fieldset>

        <fieldset style={{ border: "1px solid var(--border-soft)", borderRadius: 10, padding: "0.75rem 1rem" }}>
          <legend style={{ padding: "0 0.4rem", color: "var(--muted)", fontSize: "0.82rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Phone numbers
          </legend>
          {phones.map((phone, i) => (
            <div key={i} style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <input
                type="tel"
                placeholder="205-555-0101"
                value={phone}
                onChange={(e) => updateListAt(phones, setPhones, i, e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="danger"
                onClick={() => removeAt(phones, setPhones, i)}
                disabled={phones.length === 1 && !phone}
              >
                <Icon name="trash" size={14} /> Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="secondary"
            style={{ marginTop: "0.6rem" }}
            onClick={() => setPhones([...phones, ""])}
          >
            <Icon name="plus" size={14} /> Add phone
          </button>
        </fieldset>

        <label>
          New password <span className="muted" style={{ textTransform: "none", letterSpacing: 0 }}>(optional — leave blank to keep current)</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </label>

        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
          <button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </section>
  );
}
