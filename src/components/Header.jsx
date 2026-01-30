import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = (path) =>
    location.pathname === path
      ? "nav-link active text-warning fw-bold"
      : "nav-link text-white";

  return (
    <div class="container-fluid ">
    <nav className="navbar navbar-dark bg-dark shadow">
      <div className="container-fluid">

        {/* LOGO */}
        <Link className="navbar-brand fw-bold" to="/">
          DTF System
        </Link>

        {/* MENU LINKS - full width, always visible */}
        <ul className="nav flex-grow-1 justify-content-center align-items-center">
          {user?.role === "admin" && (
            <li className="nav-item">
              <Link className={linkClass("/dashboard")} to="/dashboard">
                Dashboard
              </Link>
            </li>
          )}
          <li className="nav-item">
            <Link className={linkClass("/customers")} to="/customers">
              Customers
            </Link>
          </li>
          <li className="nav-item">
            <Link className={linkClass("/local-order")} to="/local-order">
              Local Order
            </Link>
          </li>
          <Link className={linkClass("/order")}  to="/order">
  Orders
</Link>
   <Link className={linkClass("/payment")}  to="/payment">
  Payment
</Link>

          <li className="nav-item">
            <Link className={linkClass("/stock")} to="/stock">
              Stock
            </Link>
          </li>
          <li className="nav-item">
            <Link className={linkClass("/cashflow")} to="/cashflow">
              Cashflow
            </Link>
          </li>
        </ul>

        {/* LOGOUT BUTTON */}
        <div className="d-flex">
          <button
            onClick={handleLogout}
            className="btn btn-danger btn-sm"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
    </div>
  );
}
