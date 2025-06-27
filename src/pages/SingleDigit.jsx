import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const getTimeInMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [time, ampm] = timeStr.trim().split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

const isOpenBettingAllowed = (openTime) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = getTimeInMinutes(openTime);
  return currentMinutes < openMinutes - 10;
};

const SingleDigit = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [digit, setDigit] = useState("");
  const [points, setPoints] = useState("");
  const [bets, setBets] = useState([]);
  const [placedBets, setPlacedBets] = useState([]);
  const [coins, setCoins] = useState();
  const [error, setError] = useState("");
  const [betType, setBetType] = useState("Open");
  const [markets, setMarkets] = useState([]);
  const [currentMarket, setCurrentMarket] = useState(null);

  const marketName = location.state?.marketName || "Milan Day";
  const gameName = "Single Digit";

  useEffect(() => {
    fetchMarkets();
    fetchWalletBalance();
    fetchPlacedBets();
  }, []);

  const fetchMarkets = async () => {
    try {
      const response = await axios.get("https://backend-pbn5.onrender.com/api/markets");
      setMarkets(response.data);
      const market = response.data.find((m) => m.name.toLowerCase() === marketName.toLowerCase());
      if (market) setCurrentMarket(market);
    } catch (error) {
      console.error("Error fetching markets:", error);
      setError("Failed to fetch markets!");
    }
  };

  const fetchWalletBalance = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You need to log in to see your balance.");
      return;
    }
    try {
      const response = await axios.get("https://backend-pbn5.onrender.com/api/wallet/balance", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setCoins(response.data.walletBalance);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      setError("Failed to fetch wallet balance!");
    }
  };

  const fetchPlacedBets = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You need to log in to see your bets.");
      return;
    }
    try {
      const response = await axios.get("https://backend-pbn5.onrender.com/api/bets/user/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const filteredBets = response.data.bets.filter(
        (bet) => bet.marketName === marketName && bet.gameName === gameName && bet.status === "pending"
      );
      setPlacedBets(filteredBets);
    } catch (error) {
      console.error("Error fetching placed bets:", error);
      setError("Failed to fetch bets!");
    }
  };

  const handleAddBet = () => {
    if (betType === "Open" && currentMarket && !isOpenBettingAllowed(currentMarket.openTime)) {
      setError(`⚠️ Open betting is currently closed for ${marketName}`);
      return;
    }

    if (!digit || !points) {
      setError("Both digit and points are required!");
      return;
    }

    if (parseInt(digit) < 0 || parseInt(digit) > 9) {
      setError("Digit must be between 0 and 9!");
      return;
    }

    if (parseInt(points) <= 0) {
      setError("Points must be greater than 0!");
      return;
    }

    const newBet = {
      betId: Math.random().toString(36).substr(2, 9),
      digit,
      points,
      betType,
    };

    setBets([...bets, newBet]);
    setDigit("");
    setPoints("");
    setError("");
  };

  const handleDeleteBet = (index) => {
    setBets(bets.filter((_, i) => i !== index));
  };

  const handlePlaceBet = async () => {
    const totalPoints = bets.reduce((sum, bet) => sum + parseInt(bet.points, 10), 0);
    if (totalPoints === 0) {
      setError("No bets to place!");
      return;
    }

    if (coins < totalPoints) {
      setError("Insufficient coins!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      let confirmedBets = [];

      for (const bet of bets) {
        const response = await axios.post(
          "https://backend-pbn5.onrender.com/api/bets/place",
          {
            marketName: marketName,
            gameName: gameName,
            number: parseInt(bet.digit),
            amount: parseInt(bet.points),
            winningRatio: 9,
            betType: bet.betType,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 201 || response.status === 200) {
          confirmedBets.push({
            ...bet,
            isPlaced: true,
            status: response.data.status || "Pending",
          });
        }
      }

      setPlacedBets([...placedBets, ...confirmedBets]);
      setCoins(coins - totalPoints);
      setBets([]);
      setError("");
      fetchPlacedBets();
      alert("Submitted successfully!");
    } catch (error) {
      console.error("Error submitting:", error);
      setError("Failed submitting!");
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      <header className="flex items-center bg-gray-800 p-3 shadow-md mb-4">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 bg-transparent text-white p-1 rounded-full hover:bg-gray-700 transition duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 className="text-lg font-bold">Single Digit</h2>
        <div className="ml-auto bg-yellow-500 text-gray-900 px-3 py-1 rounded-full font-bold text-sm">
          💰 Coins: {coins}
        </div>
      </header>

      {betType === "Open" && currentMarket && !isOpenBettingAllowed(currentMarket.openTime) && (
        <div className="bg-red-600 text-white px-3 py-2 rounded-md text-center text-sm mb-4">
          ⚠️ Open betting is currently closed for {marketName}
        </div>
      )}

      <div className="flex justify-center mb-4">
        <button
          onClick={() => setBetType("Open")}
          className={`px-4 py-1 rounded-l-md font-bold text-sm ${
            betType === "Open" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400"
          } hover:bg-purple-700 transition duration-300`}
        >
          Open
        </button>
        <button
          onClick={() => setBetType("Close")}
          className={`px-4 py-1 rounded-r-md font-bold text-sm ${
            betType === "Close" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400"
          } hover:bg-purple-700 transition duration-300`}
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <input
          type="number"
          placeholder="Enter Digit"
          value={digit}
          onChange={(e) => setDigit(e.target.value)}
          className="col-span-1 px-3 py-2 bg-white text-black rounded-md text-sm"
        />
        <input
          type="number"
          placeholder="Enter Points"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          className="col-span-1 px-3 py-2 bg-white text-black rounded-md text-sm"
        />
        <button
          onClick={handleAddBet}
          className="col-span-1 bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-md font-bold text-sm transition duration-300"
        >
          Proceed
        </button>
      </div>

      {error && (
        <div className="bg-red-600 text-white px-3 py-2 rounded-md text-center text-sm mb-4">{error}</div>
      )}

      <div className="bg-gray-800 p-4 rounded-md shadow-md mb-4">
        <table className="w-full table-auto mb-3 text-sm">
          <thead>
            <tr className="bg-gray-700 text-left">
              <th className="px-3 py-2">Digit</th>
              <th className="px-3 py-2">Points</th>
              <th className="px-3 py-2">Open/Close</th>
              <th className="px-3 py-2 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet, index) => (
              <tr key={bet.betId} className="border-b border-gray-700">
                <td className="px-3 py-2">{bet.digit}</td>
                <td className="px-3 py-2">{bet.points}</td>
                <td className="px-3 py-2">{bet.betType}</td>
                <td className="px-3 py-2 text-right">
                  <button
                    onClick={() => handleDeleteBet(index)}
                    className="bg-red-600 hover:bg-red-700 px-2 py-1 rounded-md text-white font-bold text-xs"
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
        disabled={bets.length === 0}
        className={`w-full bg-green-600 hover:bg-green-700 py-2 rounded-md font-bold text-sm mb-4 ${
          bets.length === 0 ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Submit
      </button>

      <div className="bg-gray-800 p-4 rounded-md shadow-md">
        <h3 className="text-base font-bold mb-3">Submitted</h3>
        <table className="w-full table-auto text-sm">
          <thead>
            <tr className="bg-gray-700 text-left">
              <th className="px-3 py-2">Digit</th>
              <th className="px-3 py-2">Points</th>
              <th className="px-3 py-2">Open/Close</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {placedBets.map((bet) => (
              <tr key={bet._id} className="border-b border-gray-700">
                <td className="px-3 py-2">{bet.number}</td>
                <td className="px-3 py-2">{bet.amount}</td>
                <td className="px-3 py-2">{bet.betType}</td>
                <td className="px-3 py-2">
                  <span
                    className={`font-bold ${
                      bet.status === "win" ? "text-green-500" : "text-yellow-500"
                    }`}
                  >
                    {bet.status
                      ? bet.status.charAt(0).toUpperCase() + bet.status.slice(1)
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

export default SingleDigit;
