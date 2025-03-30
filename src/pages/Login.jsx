import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import ForgotPassword from "./ForgotPassword";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        "https://backend-pbn5.onrender.com/api/auth/login",
        { email, password }
      );

      // Save token and wallet balance to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("walletBalance", data.user.walletBalance);

      // Redirect to the attempted page or home
      const redirectTo = location.state?.from?.pathname || "/";
      navigate(redirectTo);
    } catch (error) {
      console.error("Login failed:", error);
      alert("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-6">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-300 mb-2">Welcome Back</h1>
        <p className="text-sm text-gray-400 mb-6">
          Log in to access your account
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-300 bg-gray-700"
              required
            />
          </div>
          <div className="relative">
            <input
              type={isPasswordVisible ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-300 bg-gray-700"
              required
            />
            <button
              type="button"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="absolute inset-y-0 right-4 text-sm text-gray-500 hover:text-gray-300 focus:outline-none"
            >
              {isPasswordVisible ? "Hide" : "Show"}
            </button>
          </div>

          {/* Forgot Password Button */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-gray-400 hover:text-gray-300 focus:outline-none"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-2 text-gray-800 bg-white rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800"
            disabled={isLoading}
          >
            {isLoading ? "Logging In..." : "Log In"}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-4">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="font-bold text-gray-300 cursor-pointer hover:underline"
          >
            Register Here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
