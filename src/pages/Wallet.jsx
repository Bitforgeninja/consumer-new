import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const Wallet = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log(token);
    if (!token) {
      setLoading(false);
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    const fetchBalanceAndTransactions = async () => {
      try {
        const [balanceResponse, transactionsResponse] = await Promise.all([
          axios.get('https://backend-pbn5.onrender.com/api/wallet/balance', { headers }),
          axios.get('https://backend-pbn5.onrender.com/api/wallet/transactions', { headers })
        ]);

        setBalance(balanceResponse.data.walletBalance);
        const transactions = transactionsResponse.data.transactions
          .filter(tx => tx.status === "pending")
          .map(tx => ({
            id: tx._id,
            type: tx.type,
            amount: tx.amount,
            status: tx.status
          }));
        setPendingRequests(transactions);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError("Failed to fetch data from the server");
      } finally {
        setLoading(false); // Set loading to false regardless of success or failure
      }
    };

    fetchBalanceAndTransactions();
  }, []);

  const postTransaction = async (type, amount) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("No token found, please log in again.");
      return;
    }
    
    setLoading(true); // Show loader when transaction is in progress
    const transactionId = uuidv4();
    const receiptUrl = "https://example.com/receipt.jpg"; // Placeholder receipt URL
  
    try {
      console.log("📢 Sending Withdrawal Request:", {
        transactionId,
        amount,
        type // ✅ Ensure type is included 
      });
  
      const response = await axios.post(
        'https://backend-pbn5.onrender.com/api/wallet/add-funds',
        {
          transactionId,
          amount,
          receiptUrl,
          type // ✅ Ensure this field is sent
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      console.log("✅ Withdrawal Request Success:", response.data);
  
      if (response.data.transaction.status === "pending") {
        const newTransaction = {
          id: response.data.transaction._id,
          type: type,
          amount: amount,
          status: response.data.transaction.status
        };
        setPendingRequests(prev => [...prev, newTransaction]);
      }
  
      alert(`Transaction request for ${amount} coins has been logged as ${type}.`);
    } catch (error) {
      console.error('❌ Error posting transaction:', error);
      setError("Failed to post transaction");
    } finally {
      setLoading(false); // Hide loader when transaction is complete
    }
  
    // ✅ Send WhatsApp Notification for Withdrawals
    if (type === "withdrawal") {
      const whatsappNumber = "7051098359";
      const whatsappMessage = `I want to withdraw ${amount} coins.`;
      const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        whatsappMessage
      )}`;
      window.open(whatsappURL, "_blank");
    }
  };
  
  const handleDeposit = () => {
    navigate('/add-funds'); // Redirect to the Add Funds page
  };

  const handleWithdraw = () => {
    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || withdrawAmount < 500) {
      setError("The minimum withdrawal amount is 500.");
      return;
    }
    if (withdrawAmount > balance) {
      setError("Insufficient balance for this withdrawal.");
      return;
    }

    postTransaction("withdrawal", withdrawAmount);
    setAmount("");
  };

  // Loader component
  const Loader = () => (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
    </div>
  );

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 flex flex-col items-center">
      {/* Show loader when loading is true */}
      {loading && <Loader />}

      {/* Header */}
      <div className="flex items-center bg-gray-800 p-3 rounded-lg shadow-md w-full max-w-md mb-5">
        <button onClick={() => navigate(-1)} className="mr-3 bg-transparent text-white p-2 rounded-full hover:bg-gray-700 transition duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h2 className="text-lg font-bold">Wallet</h2>
      </div>

      {/* Wallet Balance */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 w-full max-w-md p-6 rounded-lg shadow-lg text-center mb-5">
        <h3 className="text-lg font-bold mb-3">Wallet Balance</h3>
        <p className="text-4xl font-bold text-yellow-300">💰 {balance} Coins</p>
      </div>

      {/* Input Field for Amount */}
      <div className="w-full max-w-md mb-5">
        <input 
          type="number" 
          placeholder="Enter Amount" 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          disabled={loading} // Disable input when loading
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-center mb-3">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-between gap-4 w-full max-w-md">
        <button 
          onClick={handleWithdraw} 
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 px-4 py-3 rounded-lg font-bold text-white shadow-lg transition duration-300 transform hover:scale-105"
          disabled={loading} // Disable button when loading
        >
          Withdraw
        </button>
        <button 
          onClick={handleDeposit} 
          className="flex-1 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 px-4 py-3 rounded-lg font-bold text-white shadow-lg transition duration-300 transform hover:scale-105"
          disabled={loading} // Disable button when loading
        >
          Deposit
        </button>
      </div>

      {/* Pending Requests Table */}
      <div className="w-full max-w-md my-5">
        <h3 className="text-lg font-bold mb-3 text-center">Pending Requests</h3>
        {pendingRequests.length > 0 ? (
          <table className="w-full text-sm text-left text-white">
            <thead className="text-xs uppercase bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3">Type</th>
                <th scope="col" className="px-6 py-3">Amount</th>
                <th scope="col" className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800">
              {pendingRequests.map((request) => (
                <tr key={request.id} className="border-b border-gray-700 hover:bg-gray-600">
                  <td className="px-6 py-4">{request.type}</td>
                  <td className="px-6 py-4">{request.amount} Coins</td>
                  <td className="px-6 py-4">{request.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          !loading && <p className="text-center text-gray-400">No pending requests</p>
        )}
      </div>
    </div>
  );
};

export default Wallet;