import { useEffect, useState } from "react";
import { api } from "../api/client";
import type { DashboardStats } from "../types";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date>(new Date());

  function load() {
    api.get<DashboardStats>("/api/dashboard/stats")
      .then(s => { setStats(s); setRefreshedAt(new Date()); })
      .catch(e => setError(String(e)));
  }

  useEffect(() => { load(); }, []);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p>Loading dashboard…</p>;

  const kpis: [string, string | number][] = [
    ["Products",          stats.totalProducts],
    ["Categories",        stats.totalCategories],
    ["Users",             stats.totalUsers],
    ["Employees",         stats.totalEmployees],
    ["Orders",            stats.totalOrders],
    ["Revenue",           `$${stats.totalRevenue.toFixed(2)}`],
    ["Inventory units",   stats.totalInventoryUnits],
  ];

  return (
    <section>
      <div className="dashboard-head">
        <h2>Dashboard</h2>
        <div>
          <small>Last refresh: {refreshedAt.toLocaleTimeString()}</small>{" "}
          <button onClick={load}>Refresh</button>
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map(([label, value]) => (
          <div className="kpi" key={label}>
            <div className="kpi-value">{value}</div>
            <div className="kpi-label">{label}</div>
          </div>
        ))}
      </div>

      <h3>Top sellers</h3>
      {stats.topProducts.length === 0 ? <p>No sales yet.</p> : (
        <table>
          <thead><tr><th>Product</th><th>Units sold</th><th>Revenue</th></tr></thead>
          <tbody>
            {stats.topProducts.map(p => (
              <tr key={p.productID}>
                <td>{p.productName}</td>
                <td>{p.totalSold}</td>
                <td>${p.revenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Low-stock alerts <small>(qty &lt; 10)</small></h3>
      {stats.lowStock.length === 0 ? <p>Inventory looks healthy.</p> : (
        <table>
          <thead><tr><th>Product</th><th>Category</th><th>Qty</th></tr></thead>
          <tbody>
            {stats.lowStock.map(l => (
              <tr key={l.productID}>
                <td>{l.productName}</td>
                <td>{l.categoryName}</td>
                <td className="warn">{l.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Category breakdown</h3>
      <table>
        <thead><tr><th>Category</th><th>Products</th><th>Total stock</th></tr></thead>
        <tbody>
          {stats.categoryBreakdown.map(c => (
            <tr key={c.categoryName}>
              <td>{c.categoryName}</td><td>{c.productCount}</td><td>{c.totalStock}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Employee tracking (Tracks relationship)</h3>
      <table>
        <thead><tr><th>Employee</th><th>Role</th><th>Products tracked</th></tr></thead>
        <tbody>
          {stats.employeeTracking.map(e => (
            <tr key={e.employeeID}>
              <td>{e.name}</td><td>{e.jobPosition}</td><td>{e.productsTracked}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Recent orders</h3>
      {stats.recentOrders.length === 0 ? <p>No orders yet — place one from the cart.</p> : (
        <table>
          <thead><tr><th>Confirmation</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th></tr></thead>
          <tbody>
            {stats.recentOrders.map(o => (
              <tr key={o.orderID}>
                <td>{o.orderConfirmation}</td>
                <td>{new Date(o.orderDate).toLocaleString()}</td>
                <td>{o.customer}</td>
                <td>{o.itemCount}</td>
                <td>${o.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
