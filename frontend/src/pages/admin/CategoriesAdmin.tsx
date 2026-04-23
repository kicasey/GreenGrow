import { useEffect, useState } from "react";
import { api } from "../../api/client";
import Icon from "../../components/Icon";
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
        <button type="submit">
          <Icon name={editingId === null ? "plus" : "check"} size={14} />{" "}
          {editingId === null ? "Add category" : "Save changes"}
        </button>
        {editingId !== null && (
          <button type="button" className="secondary" onClick={() => { setEditingId(null); setName(""); }}>Cancel</button>
        )}
      </form>

      <div className="table-wrap">
        <table>
          <thead><tr><th>ID</th><th>Name</th><th></th></tr></thead>
          <tbody>
            {rows.map(c => (
              <tr key={c.categoryID}>
                <td>{c.categoryID}</td>
                <td><strong>{c.categoryName}</strong></td>
                <td>
                  <button className="icon-btn" onClick={() => { setEditingId(c.categoryID); setName(c.categoryName); }}>
                    <Icon name="edit" size={14} /> Edit
                  </button>{" "}
                  <button className="danger" onClick={() => del(c.categoryID)}>
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
