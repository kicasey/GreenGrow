import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../state/AuthContext";
import Icon from "../components/Icon";
import type { Order } from "../types";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { current, isCustomer, isEmployee } = useAuth();

  useEffect(() => {
    setLoading(true);
    api.get<Order[]>("/api/orders")
      .then(o => { setOrders(o); setError(null); })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    if (isCustomer && current) return orders.filter(o => o.userID === current.id);
    return orders;
  }, [orders, isCustomer, current]);

  const revenue = useMemo(
    () => visible.reduce((s, o) => s + o.orderTotal, 0),
    [visible]
  );

  if (error) return <p className="error">{error}</p>;

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>{isCustomer ? "My orders" : "All orders"}</h2>
          <p className="subtitle muted">
            {isCustomer
              ? "Past purchases tied to your account."
              : "Every order placed through the storefront."}
          </p>
        </div>
        <div className="page-actions">
          <span className="chip" style={{
            background: "var(--sage-100)", color: "var(--moss-800)",
            padding: "0.35rem 0.75rem", borderRadius: 999, fontSize: "0.85rem",
          }}>
            {visible.length} order{visible.length === 1 ? "" : "s"} · ${revenue.toFixed(2)}
          </span>
        </div>
      </div>

      {loading && <p className="muted">Loading orders…</p>}

      {!loading && visible.length === 0 && (
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>
            {isCustomer
              ? "Head to the catalog and place your first order."
              : "No customer orders have been placed in the system."}
          </p>
          {isCustomer && (
            <p>
              <Link to="/products" className="btn" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Icon name="sprout" /> Browse products
              </Link>
            </p>
          )}
        </div>
      )}

      {visible.map(o => (
        <article key={o.orderID} className="order-card">
          <header>
            <span className="conf">{o.orderConfirmation}</span>
            <span className="date">{new Date(o.orderDate).toLocaleString()}</span>
            {isEmployee && <span className="muted">· Customer #{o.userID}</span>}
            <span className="total">${o.orderTotal.toFixed(2)}</span>
          </header>
          <ul>
            {o.lines.map(l => (
              <li key={l.productID}>
                {l.quantity} × {l.productName ?? `Product #${l.productID}`} — ${l.lineTotal.toFixed(2)}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
