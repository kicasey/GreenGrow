import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <section className="home">
      <h2>Welcome to GreenGrow</h2>
      <p>
        MIS 330 full-stack demo. Every button on this site is backed by a real
        MySQL table — use the nav above to browse, add to cart, check out, and
        manage the catalog. Watch the Dashboard update in real time.
      </p>
      <div className="home-grid">
        <Link to="/products"  className="home-tile">Browse products</Link>
        <Link to="/admin"     className="home-tile">Manage data</Link>
        <Link to="/dashboard" className="home-tile">Live dashboard</Link>
        <Link to="/login"     className="home-tile">Log in</Link>
      </div>
      <details>
        <summary>Tech stack</summary>
        <ul>
          <li><strong>Backend:</strong> ASP.NET Core 8 Web API + EF Core + MySQL (Pomelo provider)</li>
          <li><strong>Frontend:</strong> React 18 + TypeScript + Vite</li>
          <li><strong>Auth:</strong> BCrypt-hashed passwords stored in the database</li>
          <li><strong>Deploy:</strong> Heroku (JawsDB MySQL add-on)</li>
        </ul>
      </details>
    </section>
  );
}
