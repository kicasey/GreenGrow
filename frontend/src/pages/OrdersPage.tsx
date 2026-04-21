import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { Order } from "../types";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<Order[]>("/api/orders")
      .then(setOrders)
      .catch(e => setError(String(e)));
  }, []);

  if (error) return <p className="error">{error}</p>;

  return (
    <section>
      <h2>Orders</h2>
      {orders.length === 0 && <p>No orders yet.</p>}
      {orders.map(o => (
        <article key={o.orderID} className="order-card">
          <header>
            <strong>{o.orderConfirmation}</strong>
            <span> · {new Date(o.orderDate).toLocaleDateString()}</span>
            <span> · ${o.orderTotal.toFixed(2)}</span>
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
