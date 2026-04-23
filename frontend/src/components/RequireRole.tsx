import { Link } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import Icon from "./Icon";

type Role = "customer" | "employee" | "any";

interface Props {
  role: Role;
  children: React.ReactNode;
}

export default function RequireRole({ role, children }: Props) {
  const { current, isEmployee, isCustomer } = useAuth();

  if (role === "any") {
    if (!current) return <NotLoggedIn />;
    return <>{children}</>;
  }

  if (role === "employee") {
    if (!current) return <NotLoggedIn hint="Sign in with an employee account to access this area." />;
    if (!isEmployee) return <WrongRole wanted="Employees only" />;
    return <>{children}</>;
  }

  if (role === "customer") {
    if (!current) return <NotLoggedIn hint="Sign in as a customer to continue." />;
    if (!isCustomer) return <WrongRole wanted="Customers only" />;
    return <>{children}</>;
  }

  return <>{children}</>;
}

function NotLoggedIn({ hint }: { hint?: string }) {
  return (
    <div className="locked">
      <Icon name="lock" size={32} />
      <h3>Please log in</h3>
      <p className="muted">{hint ?? "You need to be signed in to view this page."}</p>
      <p><Link to="/login">Go to the login page →</Link></p>
    </div>
  );
}

function WrongRole({ wanted }: { wanted: string }) {
  return (
    <div className="locked">
      <Icon name="lock" size={32} />
      <h3>{wanted}</h3>
      <p className="muted">Your current account doesn't have access to this section.</p>
      <p><Link to="/">Return home →</Link></p>
    </div>
  );
}
