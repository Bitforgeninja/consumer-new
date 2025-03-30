import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Plays = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBets = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const { data } = await axios.get(
          'https://backend-pbn5.onrender.com/api/bets/user',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setBets(data.bets);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching bets:', error);
        setError('Failed to load your bets. Please try again later.');
        setLoading(false);
      }
    };

    fetchBets();
  }, [navigate]);

  // Function to format date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function to get status class for styling
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'won':
        return 'text-green-500';
      case 'lost':
        return 'text-red-500';
      case 'pending':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

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
        <h2 className="text-lg font-bold">My Plays</h2>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="bg-gray-800 border border-red-500 text-red-400 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : bets.length === 0 ? (
        <div className="bg-gray-800 border border-gray-700 text-gray-300 px-4 py-8 rounded text-center shadow-md">
          <p className="text-lg">You haven't placed any bets yet.</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded transition duration-300"
          >
            Place Your First Bet
          </button>
        </div>
      ) : (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="overflow-auto max-h-[400px]">
            <table className="w-full table-auto text-sm">
              <thead className="sticky top-0 bg-gray-700">
                <tr>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Market</th>
                  <th className="p-2 text-left">Game</th>
                  <th className="p-2 text-left">Number</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Ratio</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {bets.map((bet) => (
                  <tr key={bet._id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                    <td className="p-2">
                      {formatDate(bet.createdAt)}
                    </td>
                    <td className="p-2 font-medium">
                      {bet.marketName}
                    </td>
                    <td className="p-2">
                      {bet.gameName}
                    </td>
                    <td className="p-2 font-semibold">
                      {bet.number}
                    </td>
                    <td className="p-2">
                      {bet.betType}
                    </td>
                    <td className="p-2">
                      ₹{bet.amount}
                    </td>
                    <td className="p-2">
                      {bet.winningRatio}x
                    </td>
                    <td className="p-2 font-semibold">
                      <span className={getStatusClass(bet.status)}>
                        {bet.status.charAt(0).toUpperCase() + bet.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plays;