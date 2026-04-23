import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../state/AuthContext";
import { useCart } from "../state/CartContext";
import Icon from "../components/Icon";
import type { Product } from "../types";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { add } = useCart();
  const { current, isCustomer } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!id) return;
    api.get<Product>(`/api/products/${id}`)
      .then(setProduct)
      .catch(e => setError(String(e)));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!product) return <p className="muted">Loading…</p>;

  function addToCart() {
    if (!current) return nav("/login");
    if (!isCustomer || !product) return;
    add(product, 1);
    setToast(`Added "${product.productName}" to cart`);
    setTimeout(() => setToast(null), 1500);
  }

  return (
    <section>
      <p>
        <Link to="/products" className="btn ghost" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
          <Icon name="back" /> Back to products
        </Link>
      </p>

      <div className="card" style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "1.5rem", alignItems: "start" }}>
        <div className="product-thumb" style={{ aspectRatio: "1 / 1", maxWidth: 380 }} aria-hidden>
          <Icon name="sprout" size={96} />
        </div>
        <div>
          <span className="category" style={{ textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.75rem", color: "var(--muted)" }}>
            {product.categoryName}
          </span>
          <h2 style={{ marginTop: 4 }}>{product.productName}</h2>
          <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--moss-800)", margin: "0.25rem 0 1rem" }}>
            ${product.productCost.toFixed(2)}
          </p>
          <p>{product.productDescription ?? "No description available."}</p>
          <p className={`stock ${product.quantity === 0 ? "out" : product.quantity < 10 ? "low" : "in"}`}
             style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: "0.5rem" }}>
            <Icon name={product.quantity === 0 ? "alert" : "check"} size={14} />
            {product.quantity === 0
              ? "Out of stock"
              : product.quantity < 10
              ? `Low stock · ${product.quantity} left`
              : `${product.quantity} in stock`}
          </p>

          {toast && <p className="toast" style={{ marginTop: "1rem" }}><Icon name="check" /> {toast}</p>}

          <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {isCustomer ? (
              <button onClick={addToCart} disabled={product.quantity === 0}>
                <Icon name="cart" /> Add to cart
              </button>
            ) : !current ? (
              <button onClick={() => nav("/login")}>Log in to buy</button>
            ) : (
              <Link to="/admin" className="btn secondary" style={{ textDecoration: "none" }}>
                Manage in Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
