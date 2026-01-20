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
    navigate("/dashboard"); // admin allowed
  }

  // USER LOGIN
  else if (email === "user@gmail.com" && password === "123456") {
    login({ email, role: "user" });
    navigate("/record"); // user redirected to Record
  }

  else {
    alert("Invalid login credentials");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow w-96"
      >

        <h2 className="text-2xl font-bold mb-4 text-center">
          Login
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="border p-2 w-full mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 w-full mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="bg-black text-white w-full py-2 rounded">
          Login
        </button>

        <div className="text-sm text-gray-500 mt-4">
          Admin → admin@gmail.com / 123456 <br />
          User → user@gmail.com / 123456
        </div>

      </form>

    </div>
  );
}
