import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../state/AuthContext";
import Icon from "../components/Icon";
import type { Order } from "../types";

const CANCEL_WINDOW_MS = 24 * 60 * 60 * 1000;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { current, isCustomer, isEmployee } = useAuth();

  function load() {
    setLoading(true);
    api
      .get<Order[]>("/api/orders")
      .then((o) => {
        setOrders(o);
        setError(null);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    if (isCustomer && current) return orders.filter((o) => o.userID === current.id);
    return orders;
  }, [orders, isCustomer, current]);

  const revenue = useMemo(
    () => visible.reduce((s, o) => s + o.orderTotal, 0),
    [visible]
  );

  async function cancelOrder(orderId: number) {
    if (!current) return;
    if (!confirm("Cancel this order? Stock will be restored.")) return;
    setCancelling(orderId);
    setError(null);
    setToast(null);
    try {
      await api.post<void>(`/api/orders/${orderId}/cancel?userId=${current.id}`, {});
      setToast(`Order cancelled — stock restored.`);
      load();
    } catch (err) {
      setError(String(err));
    } finally {
      setCancelling(null);
    }
  }

  function canCancel(o: Order): boolean {
    if (!isCustomer || !current || o.userID !== current.id) return false;
    const placed = new Date(o.orderDate).getTime();
    if (Number.isNaN(placed)) return false;
    return Date.now() - placed <= CANCEL_WINDOW_MS;
  }

  function timeLeft(o: Order): string {
    const placed = new Date(o.orderDate).getTime();
    const msLeft = CANCEL_WINDOW_MS - (Date.now() - placed);
    if (msLeft <= 0) return "Cancellation window closed";
    const hours = Math.floor(msLeft / (60 * 60 * 1000));
    const mins = Math.floor((msLeft % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${mins}m left to cancel`;
  }

  if (error && orders.length === 0) return <p className="error">{error}</p>;

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>{isCustomer ? "My orders" : "All orders"}</h2>
          <p className="subtitle muted">
            {isCustomer
              ? "Past purchases tied to your account. You can cancel any order placed in the last 24 hours."
              : "Every order placed through the storefront."}
          </p>
        </div>
        <div className="page-actions">
          <span
            className="chip"
            style={{
              background: "var(--sage-100)",
              color: "var(--moss-800)",
              padding: "0.35rem 0.75rem",
              borderRadius: 999,
              fontSize: "0.85rem",
            }}
          >
            {visible.length} order{visible.length === 1 ? "" : "s"} · ${revenue.toFixed(2)}
          </span>
        </div>
      </div>

      {toast && <p className="toast">{toast}</p>}
      {error && orders.length > 0 && <p className="error">{error}</p>}
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
              <Link
                to="/products"
                className="btn"
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Icon name="sprout" /> Browse products
              </Link>
            </p>
          )}
        </div>
      )}

      {visible.map((o) => {
        const cancellable = canCancel(o);
        return (
          <article key={o.orderID} className="order-card">
            <header>
              <span className="conf">{o.orderConfirmation}</span>
              <span className="date">{new Date(o.orderDate).toLocaleString()}</span>
              {isEmployee && <span className="muted">· Customer #{o.userID}</span>}
              <span className="total">${o.orderTotal.toFixed(2)}</span>
            </header>
            <ul>
              {o.lines.map((l) => (
                <li key={l.productID}>
                  {l.quantity} × {l.productName ?? `Product #${l.productID}`} — ${l.lineTotal.toFixed(2)}
                </li>
              ))}
            </ul>
            {isCustomer && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  marginTop: "0.75rem",
                  paddingTop: "0.65rem",
                  borderTop: "1px dashed var(--border)",
                  flexWrap: "wrap",
                }}
              >
                <span className="muted" style={{ fontSize: "0.82rem" }}>
                  {cancellable ? timeLeft(o) : "Cancellation window closed (24h limit)"}
                </span>
                <button
                  type="button"
                  className="danger"
                  onClick={() => cancelOrder(o.orderID)}
                  disabled={!cancellable || cancelling === o.orderID}
                  style={{ marginLeft: "auto" }}
                >
                  <Icon name="trash" size={14} />{" "}
                  {cancelling === o.orderID ? "Cancelling…" : "Cancel order"}
                </button>
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
}
