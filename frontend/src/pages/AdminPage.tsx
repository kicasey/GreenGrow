import { useState } from "react";
import ProductsAdmin from "./admin/ProductsAdmin";
import CategoriesAdmin from "./admin/CategoriesAdmin";
import UsersAdmin from "./admin/UsersAdmin";
import EmployeesAdmin from "./admin/EmployeesAdmin";
import OrdersAdmin from "./admin/OrdersAdmin";
import Icon from "../components/Icon";

type Tab = "products" | "categories" | "users" | "employees" | "orders";

const tabs: { id: Tab; label: string; icon: React.ComponentProps<typeof Icon>["name"] }[] = [
  { id: "products",   label: "Products",   icon: "sprout" },
  { id: "categories", label: "Categories", icon: "tag" },
  { id: "users",      label: "Customers",  icon: "users" },
  { id: "employees",  label: "Employees",  icon: "employee" },
  { id: "orders",     label: "Orders",     icon: "receipt" },
];

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("products");

  return (
    <section>
      <div className="page-header">
        <div>
          <h2>Admin workspace</h2>
          <p className="subtitle muted">
            Create, update, and remove records. Every action is committed to the MySQL database through the C# API —
            refresh the Dashboard afterward to watch aggregates update live.
          </p>
        </div>
      </div>

      <nav className="tabs" aria-label="Admin sections">
        {tabs.map(t => (
          <button
            key={t.id}
            className={tab === t.id ? "active" : ""}
            onClick={() => setTab(t.id)}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Icon name={t.icon} size={14} /> {t.label}
            </span>
          </button>
        ))}
      </nav>

      <div style={{ marginTop: "1rem" }}>
        {tab === "products"   && <ProductsAdmin />}
        {tab === "categories" && <CategoriesAdmin />}
        {tab === "users"      && <UsersAdmin />}
        {tab === "employees"  && <EmployeesAdmin />}
        {tab === "orders"     && <OrdersAdmin />}
      </div>
    </section>
  );
}
