import { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { Category } from "../../types";

export default function CategoriesAdmin() {
  const [rows, setRows] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    api.get<Category[]>("/api/categories").then(setRows).catch(e => setError(String(e)));
  }
  useEffect(() => { refresh(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editingId === null) {
        await api.post("/api/categories", { categoryName: name });
      } else {
        await api.put(`/api/categories/${editingId}`, { categoryName: name });
      }
      setName(""); setEditingId(null); refresh();
    } catch (err) { setError(String(err)); }
  }

  async function del(id: number) {
    if (!confirm("Delete this category? Products in it must be removed first.")) return;
    try { await api.del(`/api/categories/${id}`); refresh(); }
    catch (err) { setError(String(err)); }
  }

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <form onSubmit={save} className="form form-row">
        <input placeholder="Category name" value={name}
               onChange={e => setName(e.target.value)} required />
        <button type="submit">{editingId === null ? "Add" : "Save"}</button>
        {editingId !== null && (
          <button type="button" onClick={() => { setEditingId(null); setName(""); }}>Cancel</button>
        )}
      </form>

      <table>
        <thead><tr><th>ID</th><th>Name</th><th></th></tr></thead>
        <tbody>
          {rows.map(c => (
            <tr key={c.categoryID}>
              <td>{c.categoryID}</td>
              <td>{c.categoryName}</td>
              <td>
                <button onClick={() => { setEditingId(c.categoryID); setName(c.categoryName); }}>Edit</button>{" "}
                <button onClick={() => del(c.categoryID)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
