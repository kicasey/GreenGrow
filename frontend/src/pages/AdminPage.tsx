import { useState } from "react";
import ProductsAdmin from "./admin/ProductsAdmin";
import CategoriesAdmin from "./admin/CategoriesAdmin";
import UsersAdmin from "./admin/UsersAdmin";
import EmployeesAdmin from "./admin/EmployeesAdmin";
import OrdersAdmin from "./admin/OrdersAdmin";

type Tab = "products" | "categories" | "users" | "employees" | "orders";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("products");

  return (
    <section>
      <h2>Admin</h2>
      <p className="muted">
        Anything you add / edit / delete here hits the MySQL database through the
        C# API. Refresh the Dashboard page afterward to watch the aggregations update.
      </p>
      <nav className="tabs">
        {(["products", "categories", "users", "employees", "orders"] as Tab[]).map(t => (
          <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>

      {tab === "products"   && <ProductsAdmin />}
      {tab === "categories" && <CategoriesAdmin />}
      {tab === "users"      && <UsersAdmin />}
      {tab === "employees"  && <EmployeesAdmin />}
      {tab === "orders"     && <OrdersAdmin />}
    </section>
  );
}
