import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const CoinSettlements = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem('token'); // Assumes token is stored in localStorage
      console.log(token)
      if (!token) {
        console.error("No token found, please log in again.");
        setLoading(false); // Stop loading if token not found
        return;
      }

      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        const response = await axios.get('https://backend-pbn5.onrender.com/api/wallet/transactions', { headers });
        const filteredTransactions = response.data.transactions.filter(
          tx => tx.status === "approved" || tx.status === "Rejected"
        );
        setTransactions(filteredTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false); // Set loading to false regardless of success or failure
      }
    };

    fetchTransactions();
  }, []);

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
        <h2 className="text-lg font-bold">Coin Settlements</h2>
      </div>

      {/* Transactions Table */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-auto max-h-[400px]">
            <table className="w-full table-auto text-sm">
              <thead className="sticky top-0 bg-gray-700">
                <tr>
                  <th className="p-2 text-left">Transaction ID</th>
                  <th className="p-2 text-left">Amount</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-700 hover:bg-gray-700 transition"
                  >
                    <td className="p-2">{transaction.transactionId}</td>
                    <td className="p-2">{transaction.amount}</td>
                    <td
                      className={`p-2 font-semibold ${
                        transaction.status === "approved"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {transaction.status}
                    </td>
                    <td className="p-2">{transaction.type}</td>
                    <td className="p-2">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p>No settled transactions found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoinSettlements;