import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import Icon from "../components/Icon";
import type { DashboardStats } from "../types";

type IconName = React.ComponentProps<typeof Icon>["name"];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.get<DashboardStats>("/api/dashboard/stats")
      .then(s => { setStats(s); setRefreshedAt(new Date()); setError(null); })
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const maxTopSold = useMemo(() => {
    if (!stats?.topProducts?.length) return 0;
    return Math.max(...stats.topProducts.map(p => p.totalSold));
  }, [stats]);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p className="muted">Loading dashboard…</p>;

  const kpis: { label: string; value: string | number; icon: IconName }[] = [
    { label: "Products",        value: stats.totalProducts,                            icon: "sprout" },
    { label: "Categories",      value: stats.totalCategories,                          icon: "tag" },
    { label: "Customers",       value: stats.totalUsers,                               icon: "users" },
    { label: "Employees",       value: stats.totalEmployees,                           icon: "employee" },
    { label: "Orders",          value: stats.totalOrders,                              icon: "receipt" },
    { label: "Revenue",         value: `$${stats.totalRevenue.toFixed(2)}`,            icon: "chart" },
    { label: "Inventory units", value: stats.totalInventoryUnits,                      icon: "box" },
  ];

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Operations dashboard</h2>
          <p className="subtitle muted">
            Live metrics pulled from MySQL — every card and table reflects the current state of the database.
          </p>
        </div>
        <div className="page-actions">
          <span className="muted" style={{ fontSize: "0.8rem" }}>
            Last refresh {refreshedAt.toLocaleTimeString()}
          </span>
          <button className="secondary" onClick={load} disabled={loading}>
            <Icon name="refresh" size={14} /> {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map(k => (
          <div className="kpi" key={k.label}>
            <div className="kpi-icon"><Icon name={k.icon} /></div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-label">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3 className="section-title" style={{ marginTop: 0 }}>
            Top sellers <span className="chip">Sales</span>
          </h3>
          {stats.topProducts.length === 0 ? (
            <p className="muted">No sales yet.</p>
          ) : (
            <div className="table-wrap" style={{ boxShadow: "none", border: "none" }}>
              <table>
                <thead><tr><th>Product</th><th>Units sold</th><th>Revenue</th></tr></thead>
                <tbody>
                  {stats.topProducts.map(p => (
                    <tr key={p.productID}>
                      <td><strong>{p.productName}</strong></td>
                      <td className="bar-cell">
                        {p.totalSold}
                        <span
                          className="bar"
                          style={{ width: `${maxTopSold ? (p.totalSold / maxTopSold) * 100 : 0}%` }}
                        />
                      </td>
                      <td>${p.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="section-title" style={{ marginTop: 0 }}>
            Low-stock alerts <span className="chip">Qty &lt; 10</span>
          </h3>
          {stats.lowStock.length === 0 ? (
            <p className="muted">Inventory looks healthy.</p>
          ) : (
            <div className="table-wrap" style={{ boxShadow: "none", border: "none" }}>
              <table>
                <thead><tr><th>Product</th><th>Category</th><th>Qty</th></tr></thead>
                <tbody>
                  {stats.lowStock.map(l => (
                    <tr key={l.productID}>
                      <td>{l.productName}</td>
                      <td className="muted">{l.categoryName}</td>
                      <td className="warn">{l.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <h3 className="section-title">
        Category breakdown <span className="chip">Inventory</span>
      </h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Category</th><th>Products</th><th>Total stock</th></tr></thead>
          <tbody>
            {stats.categoryBreakdown.map(c => (
              <tr key={c.categoryName}>
                <td><strong>{c.categoryName}</strong></td>
                <td>{c.productCount}</td>
                <td>{c.totalStock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="section-title">
        Employee tracking <span className="chip">Tracks relationship</span>
      </h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Employee</th><th>Role</th><th>Products tracked</th></tr></thead>
          <tbody>
            {stats.employeeTracking.map(e => (
              <tr key={e.employeeID}>
                <td><strong>{e.name}</strong></td>
                <td className="muted">{e.jobPosition}</td>
                <td>{e.productsTracked}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="section-title">
        Recent orders <span className="chip">Latest</span>
      </h3>
      {stats.recentOrders.length === 0 ? (
        <p className="muted">No orders yet — place one from the cart.</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Confirmation</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map(o => (
                <tr key={o.orderID}>
                  <td><code>{o.orderConfirmation}</code></td>
                  <td className="muted">{new Date(o.orderDate).toLocaleString()}</td>
                  <td>{o.customer}</td>
                  <td>{o.itemCount}</td>
                  <td><strong>${o.total.toFixed(2)}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
