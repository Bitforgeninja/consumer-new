import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const { data } = await axios.post(
        "https://backend-pbn5.onrender.com/api/users/forgot-password",
        { email }
      );

      setMessage("✅ Reset link sent! Check your email.");
    } catch (error) {
      setMessage("❌ Error: Unable to send reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 to-gray-700 p-6">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-300 mb-2">Forgot Password?</h1>
        <p className="text-sm text-gray-400 mb-6">Enter your email to reset your password</p>

        {message && (
          <p className={`mb-4 ${message.includes("✅") ? "text-green-400" : "text-red-400"}`}>
            {message}
          </p>
        )}

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-300 bg-gray-700"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 text-gray-800 bg-white rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-800"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-4">
          <span
            onClick={() => navigate("/login")}
            className="font-bold text-gray-300 cursor-pointer hover:underline"
          >
            Back to Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
