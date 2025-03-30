import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ResetPasswordPage = () => {
  const { token } = useParams(); // Extract token from URL
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `https://backend-pbn5.onrender.com/api/users/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword }),
        }
      );
      const data = await response.json();
      console.log("Extracted token from URL:", token);

      if (response.ok) {
        setMessage("Password reset successfully! Redirecting...");
        setTimeout(() => navigate("/login"), 2000); // Redirect to login
      } else {
        setMessage(data.message || "Failed to reset password.");
      }
    } catch (error) {
      setMessage("Error resetting password. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FCF9F2]">

      {/* Reset Password Form */}
      <div className="flex-grow flex items-center justify-center my-16">
        <div className="bg-[#F5EDE7] p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-3xl mb-6 text-[#4F2F1D]">Reset Password</h2>

          {message && <p className="text-red-500">{message}</p>}

          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label className="block text-[#6B4132] mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border border-[#6B4132] rounded-lg focus:ring-2 focus:ring-[#4F2F1D] bg-white"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-[#6B4132] mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-[#6B4132] rounded-lg focus:ring-2 focus:ring-[#4F2F1D] bg-white"
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className={`bg-[#990000] hover:bg-[#800000] text-white font-bold py-2 px-6 rounded-lg transition duration-300 ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
