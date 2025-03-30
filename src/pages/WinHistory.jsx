import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const WinHistory = () => {
  const navigate = useNavigate();
  const [wins, setWins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWinningBets = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to view this page.");
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(
          "https://backend-pbn5.onrender.com/api/bets/user",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const winningBets = data.bets.filter((bet) => bet.status === "won");
        setWins(winningBets);
      } catch (err) {
        console.error("Error fetching winning bets:", err);
        setError("Failed to fetch winning bets.");
      } finally {
        setLoading(false);
      }
    };

    fetchWinningBets();
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
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
        <h2 className="text-lg font-bold">Win History</h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center">
          <div className="loader w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-600 text-white p-3 rounded-md text-center">
          {error}
        </div>
      ) : wins.length === 0 ? (
        <div className="text-center text-gray-400">No wins found.</div>
      ) : (
        <div className="overflow-auto max-h-[75vh]">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-2 text-left">Market</th>
                <th className="p-2 text-left">Game</th>
                <th className="p-2 text-left">Number</th>
                <th className="p-2 text-left">Bet Amount</th>
                <th className="p-2 text-left">Win Amount</th>
                <th className="p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {wins.map((win) => (
                <tr
                  key={win._id}
                  className="border-b border-gray-700 hover:bg-gray-700 transition"
                >
                  <td className="p-2">{win.marketName}</td>
                  <td className="p-2">{win.gameName}</td>
                  <td className="p-2">{win.number}</td>
                  <td className="p-2">{win.amount}</td>
                  <td className="p-2 text-green-500 font-semibold">
                    {win.amount * win.winningRatio}
                  </td>
                  <td className="p-2">
                    {new Date(win.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WinHistory;
