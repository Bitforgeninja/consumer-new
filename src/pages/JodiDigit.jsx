import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// 🔧 Converts "9:45 PM" to total minutes of the day
const getTimeInMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [time, ampm] = timeStr.trim().split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

// ✅ Determines if Open betting is currently allowed
const isOpenBettingAllowed = (openTime) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = getTimeInMinutes(openTime);
  return currentMinutes < openMinutes - 10;
};

const JodiDigit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [input, setInput] = useState("");
  const [points, setPoints] = useState("");
  const [bets, setBets] = useState([]);
  const [placedBets, setPlacedBets] = useState([]);
  const [coins, setCoins] = useState(0);
  const [error, setError] = useState("");
  const [betType, setBetType] = useState("Open");
  const [currentMarket, setCurrentMarket] = useState(null);
  const [markets, setMarkets] = useState([]);

  const marketName = location.state?.marketName || "Milan Day";
  const gameName = "Jodi Digit";

  useEffect(() => {
    fetchWalletBalanceAndBets();
    fetchMarkets();
  }, [marketName, gameName]);

  const fetchMarkets = async () => {
    try {
      const response = await axios.get("https://backend-pbn5.onrender.com/api/markets");
      setMarkets(response.data);
      const market = response.data.find(
        (m) => m.name.toLowerCase() === marketName.toLowerCase()
      );
      if (market) {
        setCurrentMarket(market);
      }
    } catch (error) {
      console.error("Error fetching markets:", error);
      setError("Failed to fetch market data!");
    }
  };

  const fetchWalletBalanceAndBets = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You need to log in to view your balance and bets.");
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      const walletResponse = axios.get(
        "https://backend-pbn5.onrender.com/api/wallet/balance",
        { headers }
      );
      const betsResponse = axios.get(
        "https://backend-pbn5.onrender.com/api/bets/user",
        { headers }
      );

      const [walletData, betsData] = await Promise.all([
        walletResponse,
        betsResponse,
      ]);
      setCoins(walletData.data.walletBalance);

      const filteredBets = betsData.data.bets.filter(
        (bet) =>
          bet.marketName === marketName &&
          bet.gameName === gameName &&
          bet.status === "pending"
      );
      setPlacedBets(filteredBets);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data!");
    }
  };

  const handleAddBet = () => {
    // ✅ Block Open betting 10 min before market opens
    if (
      betType === "Open" &&
      currentMarket &&
      !isOpenBettingAllowed(currentMarket.openTime)
    ) {
      setError(`⚠️ Open betting is currently closed for ${marketName}`);
      return;
    }

    if (!input || !points) {
      setError("Both input and points are required!");
      return;
    }

    if (!/^\d{2}$/.test(input)) {
      setError("Input must be a two-digit number!");
      return;
    }

    if (parseInt(points) <= 0) {
      setError("Points must be greater than 0!");
      return;
    }

    const newBet = {
      betId: Math.random().toString(36).substr(2, 9),
      input,
      points,
      betType,
    };

    setBets([...bets, newBet]);
    setInput("");
    setPoints("");
    setError("");
  };

  const handleDeleteBet = (index) => {
    setBets(bets.filter((_, i) => i !== index));
  };

  const handlePlaceBet = async () => {
    const totalPoints = bets.reduce(
      (sum, bet) => sum + parseInt(bet.points, 10),
      0
    );

    if (totalPoints === 0) {
      setError("No bets to place!");
      return;
    }

    if (coins < totalPoints) {
      setError("Insufficient coins!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You need to log in to place bets.");
      return;
    }

    try {
      await Promise.all(
        bets.map((bet) =>
          axios.post(
            "https://backend-pbn5.onrender.com/api/bets/place",
            {
              marketName,
              gameName,
              number: bet.input,
              amount: bet.points,
              winningRatio: 9,
              betType: bet.betType,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
        )
      );
      setCoins(coins - totalPoints);
      setBets([]);
      fetchWalletBalanceAndBets();
      setError("");
      alert("Submitted successfully!");
    } catch (error) {
      console.error("Error placing bets:", error);
      setError("Failed submitting!");
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      <header className="flex items-center bg-gray-800 p-3 shadow-md mb-4">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 bg-transparent text-white p-1 rounded-full hover:bg-gray-700 transition duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <h2 className="text-lg font-semibold">Jodi Digit</h2>
        <div className="ml-auto bg-yellow-500 text-gray-900 px-3 py-1 rounded-full font-medium">
          💰 Coins: {coins}
        </div>
      </header>

      {betType === "Open" &&
        currentMarket &&
        !isOpenBettingAllowed(currentMarket.openTime) && (
          <div className="bg-red-600 text-white px-3 py-2 rounded-md text-center mb-4 text-sm">
            ⚠️ Open betting is currently closed for {marketName}
          </div>
        )}

      <div className="flex justify-center mb-4">
        <button className="px-5 py-1 rounded-md text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 transition duration-200">
          Open
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <input
          type="text"
          placeholder="Enter Jodi (2-digit)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="col-span-1 px-3 py-1 bg-white text-black rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
        <input
          type="number"
          placeholder="Enter Points"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          className="col-span-1 px-3 py-1 bg-white text-black rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
        <button
          onClick={handleAddBet}
          className="col-span-1 bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-md text-sm font-medium transition duration-200"
        >
          Proceed
        </button>
      </div>

      {error && (
        <div className="bg-red-600 text-white px-3 py-1 rounded-md text-center mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="bg-gray-800 p-4 rounded-md shadow-md mb-4">
        <h3 className="text-sm font-semibold mb-3">Current Bets</h3>
        <table className="w-full text-sm table-auto mb-3">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-3 py-1">Jodi</th>
              <th className="px-3 py-1">Points</th>
              <th className="px-3 py-1">Open/Close</th>
              <th className="px-3 py-1 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet, index) => (
              <tr key={bet.betId} className="border-b border-gray-700">
                <td className="px-3 py-1">{bet.input}</td>
                <td className="px-3 py-1">{bet.points}</td>
                <td className="px-3 py-1">{bet.betType}</td>
                <td className="px-3 py-1 text-right">
                  <button
                    onClick={() => handleDeleteBet(index)}
                    className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded-md text-white text-xs font-medium transition duration-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={handlePlaceBet}
        className="w-full bg-green-600 hover:bg-green-700 py-2 rounded-md text-sm font-medium transition duration-200 mb-4"
      >
        Submit
      </button>

      <div className="bg-gray-800 p-4 rounded-md shadow-md">
        <h3 className="text-sm font-semibold mb-3">Placed Bets</h3>
        <table className="w-full text-sm table-auto">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-3 py-1">Jodi</th>
              <th className="px-3 py-1">Points</th>
              <th className="px-3 py-1">Open/Close</th>
              <th className="px-3 py-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {placedBets.map((bet, index) => (
              <tr key={bet.betId || index} className="border-b border-gray-700">
                <td className="px-3 py-1">{bet.number}</td>
                <td className="px-3 py-1">{bet.amount}</td>
                <td className="px-3 py-1">{bet.betType}</td>
                <td className="px-3 py-1">
                  <span
                    className={`font-medium ${
                      bet.status === "win"
                        ? "text-green-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {bet.status
                      ? bet.status.charAt(0).toUpperCase() +
                        bet.status.slice(1)
                      : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JodiDigit;
