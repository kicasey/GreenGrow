import { useEffect, useState } from "react";
import { api } from "../../api/client";
import Icon from "../../components/Icon";
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
        Orders are created by customers from the cart. This view lets staff review and delete them.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Confirmation</th><th>Date</th><th>Customer</th>
              <th>Lines (Qty ✕ Product)</th><th>Total</th><th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(o => (
              <tr key={o.orderID}>
                <td>{o.orderID}</td>
                <td><code>{o.orderConfirmation}</code></td>
                <td className="muted">{new Date(o.orderDate).toLocaleString()}</td>
                <td>#{o.userID}</td>
                <td>
                  <ul className="inline-list">
                    {o.lines.map(l => (
                      <li key={l.productID}>
                        {l.quantity} × {l.productName ?? `#${l.productID}`} (${l.lineTotal.toFixed(2)})
                      </li>
                    ))}
                  </ul>
                </td>
                <td><strong>${o.orderTotal.toFixed(2)}</strong></td>
                <td>
                  <button className="danger" onClick={() => del(o.orderID)}>
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
