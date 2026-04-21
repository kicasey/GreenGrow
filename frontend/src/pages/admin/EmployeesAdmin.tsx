import { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { Employee } from "../../types";

interface Draft {
  employeeID: number | null;
  fname: string; lname: string; jobPosition: string; password: string;
  phones: string;
}
const emptyDraft: Draft = {
  employeeID: null, fname: "", lname: "", jobPosition: "", password: "", phones: "",
};

function split(csv: string) {
  return csv.split(",").map(s => s.trim()).filter(Boolean);
}

export default function EmployeesAdmin() {
  const [rows, setRows] = useState<Employee[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    api.get<Employee[]>("/api/employees").then(setRows).catch(e => setError(String(e)));
  }
  useEffect(() => { refresh(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      fname: draft.fname, lname: draft.lname,
      jobPosition: draft.jobPosition, password: draft.password,
      phones: split(draft.phones),
    };
    try {
      if (draft.employeeID === null) {
        if (!payload.password) throw new Error("Password required for new employees.");
        await api.post("/api/employees", payload);
      } else {
        await api.put(`/api/employees/${draft.employeeID}`, payload);
      }
      setDraft(emptyDraft); refresh();
    } catch (err) { setError(String(err)); }
  }

  async function del(id: number) {
    if (!confirm("Delete this employee?")) return;
    try { await api.del(`/api/employees/${id}`); refresh(); }
    catch (err) { setError(String(err)); }
  }

  function startEdit(e: Employee) {
    setDraft({
      employeeID: e.employeeID, fname: e.fname, lname: e.lname,
      jobPosition: e.jobPosition, password: "", phones: e.phones.join(", "),
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
        <input placeholder="Position" value={draft.jobPosition}
               onChange={e => setDraft({ ...draft, jobPosition: e.target.value })} required />
        <input placeholder={draft.employeeID === null ? "Password" : "New password (blank = keep)"}
               type="password" value={draft.password}
               onChange={e => setDraft({ ...draft, password: e.target.value })} />
        <input placeholder="Phones (comma separated)" value={draft.phones}
               onChange={e => setDraft({ ...draft, phones: e.target.value })} />
        <button type="submit">{draft.employeeID === null ? "Add" : "Save"}</button>
        {draft.employeeID !== null && <button type="button" onClick={() => setDraft(emptyDraft)}>Cancel</button>}
      </form>

      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Position</th><th>Phones</th><th></th></tr></thead>
        <tbody>
          {rows.map(e => (
            <tr key={e.employeeID}>
              <td>{e.employeeID}</td><td>{e.fname} {e.lname}</td>
              <td>{e.jobPosition}</td><td>{e.phones.join(", ")}</td>
              <td>
                <button onClick={() => startEdit(e)}>Edit</button>{" "}
                <button onClick={() => del(e.employeeID)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
