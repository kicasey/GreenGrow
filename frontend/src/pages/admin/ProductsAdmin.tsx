import { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { Category, Product } from "../../types";

interface Draft {
  productID: number | null;
  productName: string;
  productDescription: string;
  productCost: string;
  quantity: string;
  categoryID: number | "";
}
const emptyDraft: Draft = {
  productID: null, productName: "", productDescription: "",
  productCost: "", quantity: "", categoryID: "",
};

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    Promise.all([
      api.get<Product[]>("/api/products"),
      api.get<Category[]>("/api/categories"),
    ])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .catch(e => setError(String(e)));
  }

  useEffect(() => { refresh(); }, []);

  function startEdit(p: Product) {
    setDraft({
      productID: p.productID,
      productName: p.productName,
      productDescription: p.productDescription ?? "",
      productCost: String(p.productCost),
      quantity: String(p.quantity),
      categoryID: p.categoryID,
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      productName: draft.productName,
      productDescription: draft.productDescription || null,
      productCost: Number(draft.productCost),
      quantity: Number(draft.quantity),
      categoryID: Number(draft.categoryID),
    };
    try {
      if (draft.productID === null) {
        await api.post("/api/products", payload);
      } else {
        await api.put(`/api/products/${draft.productID}`, payload);
      }
      setDraft(emptyDraft);
      refresh();
    } catch (err) { setError(String(err)); }
  }

  async function del(id: number) {
    if (!confirm("Delete this product?")) return;
    try {
      await api.del(`/api/products/${id}`);
      refresh();
    } catch (err) { setError(String(err)); }
  }

  return (
    <div>
      {error && <p className="error">{error}</p>}

      <form onSubmit={save} className="form form-row">
        <input placeholder="Name" value={draft.productName}
               onChange={e => setDraft({ ...draft, productName: e.target.value })} required />
        <input placeholder="Description" value={draft.productDescription}
               onChange={e => setDraft({ ...draft, productDescription: e.target.value })} />
        <input placeholder="Cost" type="number" step="0.01" value={draft.productCost}
               onChange={e => setDraft({ ...draft, productCost: e.target.value })} required />
        <input placeholder="Qty" type="number" value={draft.quantity}
               onChange={e => setDraft({ ...draft, quantity: e.target.value })} required />
        <select value={draft.categoryID}
                onChange={e => setDraft({ ...draft, categoryID: e.target.value === "" ? "" : Number(e.target.value) })}
                required>
          <option value="">-- category --</option>
          {categories.map(c => <option key={c.categoryID} value={c.categoryID}>{c.categoryName}</option>)}
        </select>
        <button type="submit">{draft.productID === null ? "Add" : "Save"}</button>
        {draft.productID !== null && <button type="button" onClick={() => setDraft(emptyDraft)}>Cancel</button>}
      </form>

      <table>
        <thead><tr><th>ID</th><th>Name</th><th>Category</th><th>Cost</th><th>Qty</th><th></th></tr></thead>
        <tbody>
          {products.map(p => (
            <tr key={p.productID}>
              <td>{p.productID}</td><td>{p.productName}</td>
              <td>{p.categoryName}</td><td>${p.productCost.toFixed(2)}</td><td>{p.quantity}</td>
              <td>
                <button onClick={() => startEdit(p)}>Edit</button>{" "}
                <button onClick={() => del(p.productID)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
