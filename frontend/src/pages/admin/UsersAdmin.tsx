import { useEffect, useState } from "react";
import { api } from "../../api/client";
import Icon from "../../components/Icon";
import type { User } from "../../types";

interface Draft {
  userID: number | null;
  fname: string; lname: string; password: string;
  emails: string; phones: string;  // comma-separated for the form
}
const emptyDraft: Draft = { userID: null, fname: "", lname: "", password: "", emails: "", phones: "" };

function split(csv: string) {
  return csv.split(",").map(s => s.trim()).filter(Boolean);
}

export default function UsersAdmin() {
  const [rows, setRows] = useState<User[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    api.get<User[]>("/api/users").then(setRows).catch(e => setError(String(e)));
  }
  useEffect(() => { refresh(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      fname: draft.fname, lname: draft.lname,
      password: draft.password,
      emails: split(draft.emails),
      phones: split(draft.phones),
    };
    try {
      if (draft.userID === null) {
        if (!payload.password) throw new Error("Password required for new users.");
        await api.post("/api/users", payload);
      } else {
        await api.put(`/api/users/${draft.userID}`, payload);
      }
      setDraft(emptyDraft); refresh();
    } catch (err) { setError(String(err)); }
  }

  async function del(id: number) {
    if (!confirm("Delete this user?")) return;
    try { await api.del(`/api/users/${id}`); refresh(); }
    catch (err) { setError(String(err)); }
  }

  function startEdit(u: User) {
    setDraft({
      userID: u.userID, fname: u.fname, lname: u.lname, password: "",
      emails: u.emails.join(", "), phones: u.phones.join(", "),
    });
  }

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <form onSubmit={save} className="form form-row">
        <input placeholder="First name" value={draft.fname}
               onChange={e => setDraft({ ...draft, fname: e.target.value })} required />
        <input placeholder="Last name" value={draft.lname}
               onChange={e => setDraft({ ...draft, lname: e.target.value })} required />
        <input placeholder={draft.userID === null ? "Password" : "New password (blank = keep)"}
               type="password" value={draft.password}
               onChange={e => setDraft({ ...draft, password: e.target.value })} />
        <input placeholder="Emails (comma separated)" value={draft.emails}
               onChange={e => setDraft({ ...draft, emails: e.target.value })} />
        <input placeholder="Phones (comma separated)" value={draft.phones}
               onChange={e => setDraft({ ...draft, phones: e.target.value })} />
        <button type="submit">
          <Icon name={draft.userID === null ? "plus" : "check"} size={14} />{" "}
          {draft.userID === null ? "Add customer" : "Save changes"}
        </button>
        {draft.userID !== null && (
          <button type="button" className="secondary" onClick={() => setDraft(emptyDraft)}>Cancel</button>
        )}
      </form>

      <div className="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>Emails</th><th>Phones</th><th></th></tr></thead>
          <tbody>
            {rows.map(u => (
              <tr key={u.userID}>
                <td>{u.userID}</td>
                <td><strong>{u.fname} {u.lname}</strong></td>
                <td className="muted">{u.emails.join(", ")}</td>
                <td className="muted">{u.phones.join(", ")}</td>
                <td>
                  <button className="icon-btn" onClick={() => startEdit(u)}>
                    <Icon name="edit" size={14} /> Edit
                  </button>{" "}
                  <button className="danger" onClick={() => del(u.userID)}>
                    <Icon name="trash" size={14} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
