import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {

  const { logout, user } = useAuth(); // <-- get user from context
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-black text-white p-4 flex justify-between items-center">

      {/* LOGO */}
      <div className="font-bold text-lg">
        DTF
      </div>

      {/* MENU */}
      <div className="flex gap-6 items-center">

        {/* ADMIN ONLY DASHBOARD */}
        {user?.role === "admin" && (
          <Link to="/dashboard">Dashboard</Link>
        )}

        <Link to="/local-order">Local Order</Link>
        <Link to="/stock">Stock</Link>
        <Link to="/order-online">Online Order</Link>

        <button
          onClick={handleLogout}
          className="bg-red-600 px-3 py-1 rounded"
        >
          Sign Out
        </button>

      </div>

    </div>
  );
}
