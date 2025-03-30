import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';

const BetsHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const marketName = location.state?.marketName; // Receive market name from previous page

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No token found, please log in again.");
      setLoading(false); // Stop loading if token not found
      return;
    }

    const fetchBets = async () => {
      try {
        const response = await axios.get('https://backend-pbn5.onrender.com/api/bets/user', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        // Filter bets to only include those that match the passed marketName
        const filteredBets = response.data.bets.filter(bet => bet.marketName === marketName);
        setBets(filteredBets);
      } catch (error) {
        console.error('Error fetching bets:', error);
      } finally {
        setLoading(false); // Set loading to false regardless of success or failure
      }
    };

    fetchBets();
  }, [marketName]);

  // Loader component
  const Loader = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
    </div>
  );

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4">
      {/* Show loader when loading is true */}
      {loading && <Loader />}
      
      {/* Header */}
      <div className="flex items-center bg-gray-800 p-3 rounded-lg shadow-md mb-5">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-3 bg-transparent text-white p-2 rounded-full hover:bg-gray-700 transition duration-300"
          disabled={loading} // Disable button when loading
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 className="text-lg font-bold">{marketName ? `${marketName} Play History` : "Play History"}</h2>
      </div>

      {/* Bets Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : bets.length === 0 ? (
        <div className="bg-gray-800 p-8 rounded-lg shadow-md text-center text-gray-400">
          No plays found for {marketName}.
        </div>
      ) : (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-2 text-left">Game</th>
                <th className="p-2 text-left">Play Type</th>
                <th className="p-2 text-left">Amount</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {bets.map((bet, index) => (
                <tr key={index} className="border-b border-gray-700 hover:bg-gray-700 transition">
                  <td className="p-2">{bet.gameName}</td>
                  <td className="p-2">{bet.number}</td>
                  <td className="p-2">{bet.amount}</td>
                  <td className={`p-2 ${bet.status === 'won' ? 'text-green-500' : bet.status === 'lost' ? 'text-red-500' : 'text-yellow-500'}`}>
                    {bet.status}
                  </td>
                  <td className="p-2">{new Date(bet.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BetsHistory;