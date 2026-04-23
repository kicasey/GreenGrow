import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../state/AuthContext";
import { useCart } from "../state/CartContext";
import Icon from "../components/Icon";
import type { Category, Product } from "../types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { add } = useCart();
  const { current, isCustomer, isEmployee } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    api.get<Category[]>("/api/categories").then(setCategories).catch(e => setError(String(e)));
  }, []);

  useEffect(() => {
    setLoading(true);
    const query = categoryId ? `?categoryId=${categoryId}` : "";
    api.get<Product[]>(`/api/products${query}`)
      .then(p => { setProducts(p); setError(null); })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, [categoryId]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;
    return products.filter(p =>
      p.productName.toLowerCase().includes(term) ||
      (p.productDescription ?? "").toLowerCase().includes(term) ||
      (p.categoryName ?? "").toLowerCase().includes(term)
    );
  }, [products, search]);

  function addToCart(p: Product) {
    if (!current) { nav("/login"); return; }
    if (!isCustomer) return;
    add(p, 1);
    setToast(`Added "${p.productName}" to cart`);
    setTimeout(() => setToast(null), 1500);
  }

  function stockClass(qty: number) {
    if (qty === 0) return "out";
    if (qty < 10) return "low";
    return "in";
  }
  function stockLabel(qty: number) {
    if (qty === 0) return "Out of stock";
    if (qty < 10) return `Low stock · ${qty}`;
    return `${qty} in stock`;
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Products</h2>
          <p className="subtitle muted">
            {isEmployee
              ? "Customer-facing catalog view. Use the Admin tab to add, edit, or remove products."
              : "Fresh from the greenhouse — every item is pulled live from MySQL."}
          </p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      {toast && <p className="toast"><Icon name="check" /> {toast}</p>}

      <div className="product-toolbar">
        <label>
          <Icon name="search" />
          <input
            type="search"
            placeholder="Search products, categories, descriptions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </label>
        <label>
          <Icon name="tag" />
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
          >
            <option value="">All categories</option>
            {categories.map(c => (
              <option key={c.categoryID} value={c.categoryID}>{c.categoryName}</option>
            ))}
          </select>
        </label>
        <span className="count">
          {loading ? "Loading…" : `${filtered.length} product${filtered.length === 1 ? "" : "s"}`}
        </span>
      </div>

      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <h3>No products match your search</h3>
          <p>Try clearing filters or searching a different term.</p>
        </div>
      )}

      <div className="product-grid">
        {filtered.map(p => (
          <div key={p.productID} className="product-card">
            <Link to={`/products/${p.productID}`} className="product-card-link">
              <div className="product-thumb" aria-hidden>
                <Icon name="sprout" size={56} />
              </div>
              <span className="category">{p.categoryName}</span>
              <h3>{p.productName}</h3>
              <span className="price">${p.productCost.toFixed(2)}</span>
              <span className={`stock ${stockClass(p.quantity)}`}>
                <Icon name={p.quantity === 0 ? "alert" : "check"} size={14} />
                {stockLabel(p.quantity)}
              </span>
            </Link>
            {isCustomer ? (
              <button
                className="add-to-cart"
                onClick={() => addToCart(p)}
                disabled={p.quantity === 0}
              >
                {p.quantity === 0 ? "Unavailable" : "Add to cart"}
              </button>
            ) : isEmployee ? (
              <Link to="/admin" className="btn secondary" style={{ textAlign: "center", textDecoration: "none" }}>
                Manage in Admin
              </Link>
            ) : (
              <button className="add-to-cart" onClick={() => nav("/login")}>
                Log in to buy
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
