import { Link, NavLink, Route, Routes } from "react-router-dom";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import OrdersPage from "./pages/OrdersPage";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import CartPage from "./pages/CartPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import ReportsPage from "./pages/ReportsPage";
import RequireRole from "./components/RequireRole";
import Icon from "./components/Icon";
import { useAuth } from "./state/AuthContext";
import { useCart } from "./state/CartContext";

export default function App() {
  const { current, logout, isEmployee, isCustomer } = useAuth();
  const { lines } = useCart();
  const cartCount = lines.reduce((n, l) => n + l.quantity, 0);

  const initials = current ? `${current.fname[0] ?? ""}${current.lname[0] ?? ""}`.toUpperCase() : "";

  return (
    <div className="app">
      <header className="app-header">
        <Link to="/" className="brand" aria-label="GreenGrow home">
          <span className="brand-mark"><Icon name="leaf" size={22} /></span>
          <span className="brand-text">
            <span className="brand-name">GreenGrow</span>
            <span className="brand-tag">Garden · MySQL dashboard</span>
          </span>
        </Link>

        <nav aria-label="Main navigation">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/products">Products</NavLink>

          {isCustomer && (
            <>
              <NavLink to="/cart">
                Cart{cartCount ? ` (${cartCount})` : ""}
              </NavLink>
              <NavLink to="/orders">My Orders</NavLink>
              <NavLink to="/profile">My Profile</NavLink>
            </>
          )}

          {isEmployee && (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/orders">Orders</NavLink>
              <NavLink to="/reports">Reports</NavLink>
              <NavLink to="/admin">Admin</NavLink>
            </>
          )}
        </nav>

        <div className="user-box">
          {current ? (
            <>
              <span className="pill">
                <span className="avatar" aria-hidden>{initials || "?"}</span>
                <span>
                  {current.fname} {current.lname}
                </span>
                <span className={`role-badge ${current.kind === "employee" ? "employee" : "customer"}`}>
                  {current.kind === "employee" ? (current.jobPosition ?? "Staff") : "Customer"}
                </span>
              </span>
              <button className="btn-link" onClick={logout}>Log out</button>
            </>
          ) : (
            <NavLink to="/login" className="login-cta">Log in</NavLink>
          )}
        </div>
      </header>

      <main className="app-main">
        <Routes>
          <Route path="/"              element={<HomePage />} />
          <Route path="/products"      element={<ProductsPage />} />
          <Route path="/products/:id"  element={<ProductDetailPage />} />
          <Route path="/login"         element={<LoginPage />} />

          <Route
            path="/cart"
            element={
              <RequireRole role="customer">
                <CartPage />
              </RequireRole>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireRole role="customer">
                <ProfilePage />
              </RequireRole>
            }
          />
          <Route
            path="/orders"
            element={
              <RequireRole role="any">
                <OrdersPage />
              </RequireRole>
            }
          />
          <Route
            path="/dashboard"
            element={
              <RequireRole role="employee">
                <DashboardPage />
              </RequireRole>
            }
          />
          <Route
            path="/reports"
            element={
              <RequireRole role="employee">
                <ReportsPage />
              </RequireRole>
            }
          />
          <Route
            path="/admin"
            element={
              <RequireRole role="employee">
                <AdminPage />
              </RequireRole>
            }
          />
        </Routes>
      </main>

      <footer className="app-footer">
        <span>GreenGrow Garden · MIS 330 Group Project, Spring 2026</span>
      </footer>
    </div>
  );
}
