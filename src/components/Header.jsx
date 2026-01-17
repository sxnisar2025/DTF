import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-black text-white p-4 flex justify-between">

      <div className="font-bold text-lg">
        DTF
      </div>

      <div className="flex gap-6 items-center">

        <Link to="/dashboard">Dashboard</Link>
        <Link to="/record">Record</Link>
        <Link to="/social">Social Data</Link>

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
