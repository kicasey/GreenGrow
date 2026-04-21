import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../state/AuthContext";
import { useCart } from "../state/CartContext";
import type { User } from "../types";

export default function CartPage() {
  const { lines, setQuantity, remove, clear, total } = useCart();
  const { current } = useAuth();
  const nav = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [chosenUserId, setChosenUserId] = useState<number | "">("");
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load users so employees / anonymous visitors can still place an order on behalf of someone.
    api.get<User[]>("/api/users").then(setUsers).catch(() => {});
  }, []);

  useEffect(() => {
    if (current?.kind === "user") setChosenUserId(current.id);
    else if (users.length && chosenUserId === "") setChosenUserId(users[0].userID);
  }, [current, users]);

  async function checkout() {
    setError(null);
    setConfirmation(null);
    if (!chosenUserId) { setError("Pick a customer first."); return; }
    if (lines.length === 0) { setError("Cart is empty."); return; }

    try {
      const res = await api.post<{ orderConfirmation: string }>("/api/orders", {
        userID: chosenUserId,
        lines: lines.map(l => ({ productID: l.product.productID, quantity: l.quantity })),
      });
      setConfirmation(res.orderConfirmation);
      clear();
    } catch (err) {
      setError(String(err));
    }
  }

  if (confirmation) {
    return (
      <section>
        <h2>Order placed!</h2>
        <p>Confirmation number: <code>{confirmation}</code></p>
        <p>
          <button onClick={() => nav("/orders")}>View all orders</button>{" "}
          <button onClick={() => nav("/dashboard")}>See it in the dashboard</button>
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2>Cart</h2>
      {error && <p className="error">{error}</p>}

      {lines.length === 0 ? <p>Your cart is empty.</p> : (
        <table>
          <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th><th></th></tr></thead>
          <tbody>
            {lines.map(l => (
              <tr key={l.product.productID}>
                <td>{l.product.productName}</td>
                <td>${l.product.productCost.toFixed(2)}</td>
                <td>
                  <input
                    type="number" min={1} max={l.product.quantity}
                    value={l.quantity}
                    onChange={e => setQuantity(l.product.productID, Number(e.target.value))}
                    style={{ width: 70 }}
                  />
                </td>
                <td>${(l.product.productCost * l.quantity).toFixed(2)}</td>
                <td><button onClick={() => remove(l.product.productID)}>Remove</button></td>
              </tr>
            ))}
            <tr>
              <td colSpan={3} style={{ textAlign: "right" }}><strong>Total</strong></td>
              <td><strong>${total.toFixed(2)}</strong></td>
              <td></td>
            </tr>
          </tbody>
        </table>
      )}

      <div className="checkout-controls">
        <label>Place order for:{" "}
          <select
            value={chosenUserId}
            onChange={e => setChosenUserId(e.target.value === "" ? "" : Number(e.target.value))}
          >
            <option value="">-- select customer --</option>
            {users.map(u => (
              <option key={u.userID} value={u.userID}>
                {u.fname} {u.lname} (ID {u.userID})
              </option>
            ))}
          </select>
        </label>
        <button onClick={checkout} disabled={lines.length === 0}>Checkout</button>
      </div>
    </section>
  );
}
