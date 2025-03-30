import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const DoublePana = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const marketName = location.state?.marketName || "Milan Day"; // Default to "Milan Day" if not provided
  const gameName = "Double Pana";

  const [input, setInput] = useState("");
  const [points, setPoints] = useState("");
  const [bets, setBets] = useState([]);
  const [placedBets, setPlacedBets] = useState([]);
  const [coins, setCoins] = useState(1000);
  const [error, setError] = useState("");
  const [betType, setBetType] = useState("Open");
  const [markets, setMarkets] = useState([]);
  const [currentMarket, setCurrentMarket] = useState(null);

  useEffect(() => {
    fetchMarkets();
    fetchBetsAndBalance();
  }, []);

  // Fetch markets data from API
  const fetchMarkets = async () => {
    try {
      const response = await axios.get(
        "https://backend-pbn5.onrender.com/api/markets"
      );
      
      setMarkets(response.data);
      
      // Find the current market by name
      const market = response.data.find(
        (m) => m.name.toLowerCase() === marketName.toLowerCase()
      );
      
      if (market) {
        setCurrentMarket(market);
      }
    } catch (error) {
      console.error("Error fetching markets:", error);
      setError("Failed to fetch markets!");
    }
  };

  const fetchBetsAndBalance = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("You need to log in to access this information.");
      return;
    }

    try {
      const [walletResponse, betsResponse] = await Promise.all([
        axios.get('https://backend-pbn5.onrender.com/api/wallet/balance', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }),
        axios.get('https://backend-pbn5.onrender.com/api/bets/user/', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      setCoins(walletResponse.data.walletBalance);
      setPlacedBets(betsResponse.data.bets.filter(bet => 
        bet.gameName === gameName && 
        bet.marketName === marketName && 
        bet.status === "pending"
      ));
    } catch (error) {
      console.error('Error fetching data:', error);
      setError("Failed to fetch data!");
    }
  };

  // Check if inputs should be disabled
  const isInputDisabled = () => {
    if (!currentMarket) return false;
    return betType === "Open" && currentMarket.openBetting === false;
  };

  const handleAddBet = () => {
    if (isInputDisabled()) {
      setError("Open betting is currently closed for this market!");
      return;
    }

    if (!input || !points) {
      setError("Both input and points are required!");
      return;
    }

    if (!/^\d{3}$/.test(input)) {
      setError("Input must be a three-digit number!");
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
      isPlaced: false,
      isWin: false
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
    const totalPoints = bets.reduce((sum, bet) => sum + parseInt(bet.points, 10), 0);

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
      const responses = await Promise.all(
        bets.map(bet =>
          axios.post(
            "https://backend-pbn5.onrender.com/api/bets/place",
            {
              marketName: marketName,
              gameName: gameName,
              number: bet.input,
              amount: bet.points,
              winningRatio: 9,
              betType: bet.betType
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          )
        )
      );

      const confirmedBets = responses.map((resp, index) => ({
        ...bets[index],
        isPlaced: true,
        status: resp.data.status || "Pending"
      }));

      setPlacedBets([...placedBets, ...confirmedBets]);
      setCoins(coins - totalPoints);
      setBets([]);
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
          className="mr-3 bg-transparent text-white p-1 rounded-full hover:bg-gray-700 transition duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <h2 className="text-lg font-bold">Double Pana</h2>
        <div className="ml-auto bg-yellow-500 text-gray-900 px-3 py-1 rounded-full font-bold text-sm">
          💰 Coins: {coins}
        </div>
      </header>

      {/* Market status banner */}
      {currentMarket && betType === "Open" && !currentMarket.openBetting && (
        <div className="bg-red-500 text-white px-3 py-1 rounded-lg text-center mb-3 text-xs">
          ⚠️ Open betting is currently closed for {marketName}
        </div>
      )}

      {/* Bet Type Buttons */}
      <div className="flex justify-center mb-3">
        <button
          onClick={() => setBetType("Open")}
          className={`px-4 py-1 rounded-l-lg font-bold text-sm ${betType === "Open" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400"} hover:bg-purple-700 transition duration-300`}
        >
          Open
        </button>
        <button
          onClick={() => setBetType("Close")}
          className={`px-4 py-1 rounded-r-lg font-bold text-sm ${betType === "Close" ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400"} hover:bg-purple-700 transition duration-300`}
        >
          Close
        </button>
      </div>

      {/* Input Fields and Add Bet Button */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <input
          type="text"
          placeholder="Enter Double Pana (3-digit)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isInputDisabled()}
          className={`col-span-1 px-3 py-1 bg-white text-black rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600 ${
            isInputDisabled() ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />
        <input
          type="number"
          placeholder="Enter Points"
          value={points}
          onChange={(e) => setPoints(e.target.value)}
          disabled={isInputDisabled()}
          className={`col-span-1 px-3 py-1 bg-white text-black rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-600 ${
            isInputDisabled() ? "opacity-50 cursor-not-allowed" : ""
          }`}
        />
        <button
          onClick={handleAddBet}
          disabled={isInputDisabled()}
          className={`col-span-1 bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-lg font-bold text-sm transition duration-300 ${
            isInputDisabled() ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Proceed
        </button>
      </div>

      {/* Error Message Display */}
      {error && (
        <div className="bg-red-500 text-white px-3 py-1 rounded-lg text-center mb-3 text-xs">
          {error}
        </div>
      )}

      {/* Current Bets Table */}
      <div className="bg-gray-800 p-3 rounded-lg shadow-md mb-3">
        <h3 className="text-sm font-bold mb-3">Current Bets</h3>
        <table className="w-full table-auto text-xs">
          <thead>
            <tr className="bg-gray-700 text-left">
              <th className="px-2 py-1">Double Pana</th>
              <th className="px-2 py-1">Points</th>
              <th className="px-2 py-1">Open/Close</th>
              <th className="px-2 py-1 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {bets.map((bet, index) => (
              <tr key={bet.betId || `bet-${index}`} className="border-b border-gray-700">
                <td className="px-2 py-1">{bet.input}</td>
                <td className="px-2 py-1">{bet.points}</td>
                <td className="px-2 py-1">{bet.betType}</td>
                <td className="px-2 py-1 text-right">
                  <button
                    onClick={() => handleDeleteBet(index)}
                    className="bg-red-500 hover:bg-red-600 px-1 py-0 rounded-lg text-white font-bold transition duration-300 text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Place Bet Button */}
      <button
        onClick={handlePlaceBet}
        disabled={bets.length === 0}
        className={`w-full bg-green-500 hover:bg-green-600 py-2 rounded-lg font-bold text-sm mb-3 transition duration-300 ${
          bets.length === 0 ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        Submit
      </button>

      {/* Placed Bets Table */}
      <div className="bg-gray-800 p-3 rounded-lg shadow-md">
        <h3 className="text-sm font-bold mb-3">Placed Bets</h3>
        <table className="w-full table-auto text-xs">
          <thead>
            <tr className="bg-gray-700 text-left">
              <th className="px-2 py-1">Double Pana</th>
              <th className="px-2 py-1">Points</th>
              <th className="px-2 py-1">Open/Close</th>
              <th className="px-2 py-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {placedBets.map((bet, index) => (
              <tr key={bet._id || bet.betId || `placed-${index}`} className="border-b border-gray-700">
                <td className="px-2 py-1">{bet.number}</td>
                <td className="px-2 py-1">{bet.amount}</td>
                <td className="px-2 py-1">{bet.betType}</td>
                <td className="px-2 py-1">
                  {bet.status === "win" ? (
                    <span className="text-green-400 font-bold">Win</span>
                  ) : (
                    <span className="text-yellow-400 font-bold">Pending</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoublePana;