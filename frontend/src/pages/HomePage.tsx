import { Link } from "react-router-dom";
import Icon from "../components/Icon";
import { useAuth } from "../state/AuthContext";

interface Tile {
  to: string;
  icon: React.ComponentProps<typeof Icon>["name"];
  title: string;
  blurb: string;
}

const customerTiles: Tile[] = [
  { to: "/products", icon: "sprout", title: "Browse the garden",   blurb: "Shop plants, soil, seeds, and tools." },
  { to: "/cart",     icon: "cart",   title: "Your cart",           blurb: "Review items and check out." },
  { to: "/orders",   icon: "receipt", title: "My orders",          blurb: "Track past purchases and confirmations." },
];

const employeeTiles: Tile[] = [
  { to: "/dashboard", icon: "dashboard", title: "Live dashboard", blurb: "Revenue, inventory, top sellers, low stock." },
  { to: "/admin",     icon: "box",       title: "Manage catalog", blurb: "Products, categories, users, employees." },
  { to: "/orders",    icon: "receipt",   title: "All orders",     blurb: "Review every order in the system." },
];

const publicTiles: Tile[] = [
  { to: "/products", icon: "sprout", title: "Browse products", blurb: "See what's growing in the greenhouse." },
  { to: "/login",    icon: "login",  title: "Sign in",         blurb: "Customers shop · Staff manage the store." },
];

export default function HomePage() {
  const { current, isEmployee, isCustomer } = useAuth();

  const tiles = isEmployee ? employeeTiles : isCustomer ? customerTiles : publicTiles;
  const greeting = current ? `Welcome back, ${current.fname}` : "Welcome to GreenGrow";
  const eyebrow = isEmployee
    ? "Staff workspace"
    : isCustomer
    ? "Customer garden"
    : "A garden database, grown in MySQL";

  return (
    <section className="home">
      <div className="hero">
        <div className="eyebrow">{eyebrow}</div>
        <h2>{greeting}.</h2>
        <p>
          GreenGrow is a full-stack gardening storefront backed by a live MySQL
          database. Browse the catalog, place orders, and watch inventory,
          revenue, and operational metrics update in real time.
        </p>
        <div className="hero-actions">
          {isEmployee ? (
            <>
              <Link to="/dashboard" className="btn btn-primary">
                <Icon name="dashboard" /> Open dashboard
              </Link>
              <Link to="/admin" className="btn btn-outline">
                <Icon name="box" /> Manage catalog
              </Link>
            </>
          ) : isCustomer ? (
            <>
              <Link to="/products" className="btn btn-primary">
                <Icon name="sprout" /> Shop the catalog
              </Link>
              <Link to="/orders" className="btn btn-outline">
                <Icon name="receipt" /> My orders
              </Link>
            </>
          ) : (
            <>
              <Link to="/products" className="btn btn-primary">
                <Icon name="sprout" /> Browse products
              </Link>
              <Link to="/login" className="btn btn-outline">
                <Icon name="login" /> Log in
              </Link>
            </>
          )}
        </div>
      </div>

      <h3 className="section-title">
        {isEmployee ? "Quick actions" : "Where to next"}
        <span className="chip">{tiles.length}</span>
      </h3>

      <div className="home-grid">
        {tiles.map(t => (
          <Link key={t.to} to={t.to} className="home-tile">
            <span className="tile-icon"><Icon name={t.icon} /></span>
            <h3>{t.title}</h3>
            <p>{t.blurb}</p>
          </Link>
        ))}
      </div>

      {!current && (
        <details>
          <summary>About this project</summary>
          <ul>
            <li><strong>Backend:</strong> ASP.NET Core 8 Web API + EF Core + MySQL (Pomelo provider)</li>
            <li><strong>Frontend:</strong> React 18 + TypeScript + Vite</li>
            <li><strong>Auth:</strong> BCrypt-hashed passwords stored in the database</li>
            <li><strong>Deploy:</strong> Heroku (JawsDB MySQL add-on)</li>
          </ul>
        </details>
      )}
    </section>
  );
}
