import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { FaBuilding } from "react-icons/fa";
let intranetLogo;
try {
  intranetLogo = require("../../assets/intranet-logo.png");
} catch (e) {
  intranetLogo = null;
}

export default function Login() {
  const [email, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:8000/auth/login", {
        email,
        password,
      });
      const token = res.data.access_token;
      const user = res.data.user;
      login(token);
      const isAdmin = user?.roles?.includes("Admin") || user?.roles?.includes("Super Admin");
      if (isAdmin) {
        navigate("/user-management");
      } else {
        navigate("/home");
      }
    } catch (err) {
      alert("Login failed: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#101a36]">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-10 flex flex-col items-center">
        <div className="bg-[#27348b] rounded-xl p-4 mb-6 flex items-center justify-center">
          {intranetLogo ? (
            <img src={intranetLogo} alt="Intranet Logo" className="w-16 h-16" />
          ) : (
            <FaBuilding className="text-white text-4xl" />
          )}
        </div>
        <h2 className="text-3xl font-bold text-blue-900 text-center mb-6">Enterprise Intranet</h2>
        <div className="w-full space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setMail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#276ef1] text-white py-2 rounded-lg hover:bg-[#1d265c] transition disabled:opacity-50 text-lg font-semibold"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>
        <div className="flex justify-between mt-6 text-sm text-gray-600 w-full">
          <button
            onClick={() => navigate("/register")}
            className="hover:underline hover:text-blue-600"
            type="button"
          >
            Create Account
          </button>
          <button
            onClick={() => navigate("/forgot")}
            className="hover:underline hover:text-blue-600"
            type="button"
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
}
