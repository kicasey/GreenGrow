import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../state/AuthContext";
import { useCart } from "../state/CartContext";
import Icon from "../components/Icon";

export default function CartPage() {
  const { lines, setQuantity, remove, clear, total } = useCart();
  const { current } = useAuth();
  const nav = useNavigate();

  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function checkout() {
    setError(null);
    setConfirmation(null);
    if (!current || current.kind !== "user") {
      setError("You must be signed in as a customer to check out.");
      return;
    }
    if (lines.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    setBusy(true);
    try {
      const res = await api.post<{ orderConfirmation: string }>("/api/orders", {
        userID: current.id,
        lines: lines.map(l => ({ productID: l.product.productID, quantity: l.quantity })),
      });
      setConfirmation(res.orderConfirmation);
      clear();
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  if (confirmation) {
    return (
      <section>
        <div className="card" style={{ textAlign: "center", maxWidth: 520, margin: "2rem auto" }}>
          <div style={{ display: "grid", placeItems: "center", margin: "0.5rem 0 1rem" }}>
            <span className="tile-icon" style={{ width: 56, height: 56, borderRadius: 14 }}>
              <Icon name="check" size={28} />
            </span>
          </div>
          <h2>Order placed!</h2>
          <p className="muted">Thank you for shopping GreenGrow.</p>
          <p>Confirmation number: <code>{confirmation}</code></p>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1rem", flexWrap: "wrap" }}>
            <button onClick={() => nav("/orders")}>View my orders</button>
            <button className="secondary" onClick={() => nav("/products")}>Keep shopping</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Your cart</h2>
          <p className="subtitle muted">Review your items before checking out.</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {lines.length === 0 ? (
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Add plants, soil, or tools from the catalog to get started.</p>
          <button onClick={() => nav("/products")} style={{ marginTop: "0.5rem" }}>
            <Icon name="sprout" /> Browse products
          </button>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th>
              </tr>
            </thead>
            <tbody>
              {lines.map(l => (
                <tr key={l.product.productID}>
                  <td>
                    <strong>{l.product.productName}</strong>
                    <div className="muted" style={{ fontSize: "0.8rem" }}>{l.product.categoryName}</div>
                  </td>
                  <td>${l.product.productCost.toFixed(2)}</td>
                  <td>
                    <input
                      type="number" min={1} max={l.product.quantity}
                      value={l.quantity}
                      onChange={e => setQuantity(l.product.productID, Number(e.target.value))}
                      style={{ width: 72, padding: "0.35rem 0.5rem", borderRadius: 6, border: "1px solid var(--border)" }}
                    />
                  </td>
                  <td>${(l.product.productCost * l.quantity).toFixed(2)}</td>
                  <td>
                    <button className="danger" onClick={() => remove(l.product.productID)}>
                      <Icon name="trash" size={14} /> Remove
                    </button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} style={{ textAlign: "right" }}><strong>Total</strong></td>
                <td><strong style={{ fontSize: "1.1rem", color: "var(--moss-800)" }}>${total.toFixed(2)}</strong></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="checkout-controls">
        <div className="muted" style={{ fontSize: "0.9rem" }}>
          Ordering as <strong>{current?.fname} {current?.lname}</strong>
          {current?.email ? <> · {current.email}</> : null}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "0.5rem" }}>
          <button className="secondary" onClick={clear} disabled={lines.length === 0}>Clear cart</button>
          <button onClick={checkout} disabled={lines.length === 0 || busy}>
            {busy ? "Placing order…" : "Checkout"}
          </button>
        </div>
      </div>
    </section>
  );
}
