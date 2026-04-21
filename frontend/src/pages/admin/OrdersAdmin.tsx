import { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { Order } from "../../types";

export default function OrdersAdmin() {
  const [rows, setRows] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  function refresh() {
    api.get<Order[]>("/api/orders").then(setRows).catch(e => setError(String(e)));
  }
  useEffect(() => { refresh(); }, []);

  async function del(id: number) {
    if (!confirm("Delete this order? Line items will also be removed.")) return;
    try { await api.del(`/api/orders/${id}`); refresh(); }
    catch (err) { setError(String(err)); }
  }

  return (
    <div>
      {error && <p className="error">{error}</p>}
      <p className="muted">
        Orders are created from the cart. This tab lets you review and delete.
      </p>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Confirmation</th><th>Date</th><th>User</th>
            <th>Lines (Quantity ✕ Product)</th><th>Total</th><th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(o => (
            <tr key={o.orderID}>
              <td>{o.orderID}</td>
              <td>{o.orderConfirmation}</td>
              <td>{new Date(o.orderDate).toLocaleString()}</td>
              <td>{o.userID}</td>
              <td>
                <ul className="inline-list">
                  {o.lines.map(l => (
                    <li key={l.productID}>
                      {l.quantity} × {l.productName ?? `#${l.productID}`} (${l.lineTotal.toFixed(2)})
                    </li>
                  ))}
                </ul>
              </td>
              <td>${o.orderTotal.toFixed(2)}</td>
              <td><button onClick={() => del(o.orderID)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
