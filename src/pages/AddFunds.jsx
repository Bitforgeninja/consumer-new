import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddFunds = () => {
  const navigate = useNavigate();
  const [transactionId, setTransactionId] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('deposit'); // Default selection to Deposit
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    const fetchPlatformSettings = async () => {
      try {
        const response = await axios.get('https://backend-pbn5.onrender.com/api/admin/platform-settings');
        setUpiId(response.data.upiId);
        setQrCodeUrl(response.data.qrCodeUrl);
      } catch (error) {
        console.error('Failed to fetch platform settings:', error);
        // Handle error appropriately
      }
    };

    fetchPlatformSettings();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const trimmedTransactionId = transactionId.trim();
    const parsedAmount = parseFloat(amount);
  
    if (!trimmedTransactionId || isNaN(parsedAmount) || parsedAmount <= 0 || !receipt || !type) {
      setError('Amount, Transaction ID, Type (Deposit/Withdrawal), and Receipt are required.');
      return;
    }
  
    const formData = new FormData();
    formData.append('transactionId', trimmedTransactionId);
    formData.append('amount', parsedAmount);
    formData.append('type', type);
    formData.append('receipt', receipt);
  
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://backend-pbn5.onrender.com/api/wallet/add-funds',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
  
      setMessage(response.data.message);
      setError('');
      setTransactionId('');
      setAmount('');
      setReceipt(null);
      setType('deposit'); // Reset to default after submission
    } catch (err) {
      console.error('❌ Error submitting fund request:', err.response);
      setMessage('');
      setError(err.response?.data?.message || 'Failed to submit fund request.');
    }
  };

  const handleReceiptChange = (e) => {
    setReceipt(e.target.files[0]);
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-5 flex flex-col items-center">
      <div className="flex items-center w-full max-w-md mb-5">
        <button
          onClick={() => navigate(-1)}
          className="bg-transparent text-white p-2 rounded-full hover:bg-gray-700 transition duration-300"
          aria-label="Go Back"
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
        <h2 className="text-xl font-bold ml-4">Add Coins</h2>
      </div>

      <div className="w-full max-w-md mb-4">
        <img
          src={qrCodeUrl}
          alt="Payment QR Code"
          className="w-full h-auto rounded-lg"
        />
      </div>

      <div className="w-full max-w-md bg-gray-800 p-4 rounded-lg shadow-md text-center mb-4">
        <h3 className="text-lg font-semibold mb-2">UPI ID for Payment</h3>
        <div className="flex justify-between items-center bg-gray-700 px-3 py-2 rounded-lg">
          <span className="text-yellow-400 font-bold">{upiId}</span>
          <button
            onClick={handleCopy}
            className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            {copySuccess ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium mb-1">
              Enter Number of Coins:
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter number of coins."
              className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>

          <div>
            <label htmlFor="transactionId" className="block text-sm font-medium mb-1">
              Settlement ID (UTR Number):
            </label>
            <input
              type="text"
              id="transactionId"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Enter transaction ID"
              className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>

          <div>
            <label htmlFor="receipt" className="block text-sm font-medium mb-1">
              Upload Receipt (Required):
            </label>
            <input
              type="file"
              id="receipt"
              accept="image/*"
              onChange={handleReceiptChange}
              className="w-full bg-gray-700 text-white py-2 rounded-lg"
              required
            />
            {error && !receipt && (
              <p className="text-red-500 text-sm mt-1">Receipt is required.</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold transition duration-300"
          >
            Submit
          </button>
        </form>

        {message && (
          <p className="text-green-500 text-center mt-4 font-semibold">{message}</p>
        )}
        {error && (
          <p className="text-red-500 text-center mt-4 font-semibold">{error}</p>
        )}
      </div>
    </div>
  );
};

export default AddFunds;
