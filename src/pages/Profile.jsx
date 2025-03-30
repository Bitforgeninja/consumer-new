import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfileAndBalance = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login"); // Redirect to login if no token
        return;
      }

      try {
        // Fetch profile data
        const profileResponse = await axios.get(
          "https://backend-pbn5.onrender.com/api/users/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch wallet balance
        const balanceResponse = await axios.get(
          "https://backend-pbn5.onrender.com/api/wallet/balance",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setProfile(profileResponse.data);
        setWalletBalance(balanceResponse.data.walletBalance);
      } catch (err) {
        console.error("Error fetching profile or balance:", err);
        setError("Failed to fetch profile or wallet balance.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndBalance();
  }, [navigate]);

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center bg-gray-800 p-3 rounded-lg shadow-md mb-5">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 bg-transparent text-white p-2 rounded-full hover:bg-gray-700 transition duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <h2 className="text-lg font-bold">Profile</h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <div className="loader w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-600 text-white p-3 rounded-md text-center">
          {error}
        </div>
      ) : (
        profile && (
          <div className="bg-gray-800 p-5 rounded-lg shadow-md">
            <div className="flex items-center mb-5">
              <img
                src={
                  profile.avatarUrl ||
                  "https://res.cloudinary.com/dwroh4zkk/image/upload/v1735050663/profile_cidlht.png"
                }
                alt="Profile"
                className="w-20 h-20 rounded-full mr-4"
              />
              <div>
                <h3 className="text-xl font-semibold">{profile.name}</h3>
                <p className="text-gray-400 text-sm">
                  Member since {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Email</span>
                <span className="font-semibold">{profile.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Phone</span>
                <span className="font-semibold">
                  {profile.phone || "Not Provided"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Coins</span>
                <span className="font-semibold text-yellow-400">💰 {walletBalance}</span>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => alert("Edit profile functionality coming soon!")}
              className="mt-5 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-lg shadow-md transition duration-300"
            >
              Edit Profile
            </button>
          </div>
        )
      )}
    </div>
  );
};

export default Profile;
