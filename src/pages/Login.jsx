import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // ADMIN LOGIN
    if (email === "admin@gmail.com" && password === "123456") {
      login({ email, role: "admin" });
      navigate("/dashboard");
    }

    // USER LOGIN
    else if (email === "user@gmail.com" && password === "123456") {
      login({ email, role: "user" });
      navigate("/local-order");
    }

    else {
      alert("Invalid login credentials");
    }
  };

  return (

    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">

      <form
        onSubmit={handleSubmit}
        className="card p-4 shadow"
        style={{ width: "24rem" }}
      >

        <h2 className="text-center fw-bold mb-4">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="form-control mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="form-control mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn btn-dark w-100">
          Login
        </button>

        <div className="text-muted small mt-4">
          <strong>Admin</strong> → admin@gmail.com / 123456 <br />
          <strong>User</strong> → user@gmail.com / 123456
        </div>

      </form>

    </div>
  );
}
