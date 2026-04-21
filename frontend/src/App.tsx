import { NavLink, Route, Routes } from "react-router-dom";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import OrdersPage from "./pages/OrdersPage";
import AdminPage from "./pages/AdminPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import CartPage from "./pages/CartPage";
import DashboardPage from "./pages/DashboardPage";
import { useAuth } from "./state/AuthContext";
import { useCart } from "./state/CartContext";

export default function App() {
  const { current, logout } = useAuth();
  const { lines } = useCart();
  const cartCount = lines.reduce((n, l) => n + l.quantity, 0);

  return (
    <div className="app">
      <header className="app-header">
        <h1>GreenGrow</h1>
        <nav>
          <NavLink to="/">Home</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/cart">Cart{cartCount ? ` (${cartCount})` : ""}</NavLink>
          <NavLink to="/orders">Orders</NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </nav>
        <div className="user-box">
          {current ? (
            <>
              <span>
                {current.fname} {current.lname}
                {current.kind === "employee" ? ` (${current.jobPosition})` : ""}
              </span>
              <button onClick={logout}>Log out</button>
            </>
          ) : (
            <NavLink to="/login">Log in</NavLink>
          )}
        </div>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/"              element={<HomePage />} />
          <Route path="/dashboard"     element={<DashboardPage />} />
          <Route path="/products"      element={<ProductsPage />} />
          <Route path="/products/:id"  element={<ProductDetailPage />} />
          <Route path="/cart"          element={<CartPage />} />
          <Route path="/orders"        element={<OrdersPage />} />
          <Route path="/admin"         element={<AdminPage />} />
          <Route path="/login"         element={<LoginPage />} />
        </Routes>
      </main>
      <footer className="app-footer">
        MIS 330 Group Project — Spring 2026
      </footer>
    </div>
  );
}
