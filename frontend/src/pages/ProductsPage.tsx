import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useCart } from "../state/CartContext";
import type { Category, Product } from "../types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { add } = useCart();

  useEffect(() => {
    api.get<Category[]>("/api/categories").then(setCategories).catch(e => setError(String(e)));
  }, []);

  useEffect(() => {
    const query = categoryId ? `?categoryId=${categoryId}` : "";
    api.get<Product[]>(`/api/products${query}`)
      .then(setProducts)
      .catch(e => setError(String(e)));
  }, [categoryId]);

  function addToCart(p: Product) {
    add(p, 1);
    setToast(`Added "${p.productName}" to cart`);
    setTimeout(() => setToast(null), 1500);
  }

  return (
    <section>
      <h2>Products</h2>
      {error && <p className="error">{error}</p>}
      {toast && <p className="toast">{toast}</p>}

      <label>
        Filter by category:{" "}
        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
        >
          <option value="">All</option>
          {categories.map(c => (
            <option key={c.categoryID} value={c.categoryID}>{c.categoryName}</option>
          ))}
        </select>
      </label>

      <div className="product-grid">
        {products.map(p => (
          <div key={p.productID} className="product-card">
            <Link to={`/products/${p.productID}`} className="product-card-link">
              <h3>{p.productName}</h3>
              <p className="category">{p.categoryName}</p>
              <p>${p.productCost.toFixed(2)}</p>
              <p className="stock">{p.quantity} in stock</p>
            </Link>
            <button
              className="add-to-cart"
              onClick={() => addToCart(p)}
              disabled={p.quantity === 0}
            >
              Add to cart
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
