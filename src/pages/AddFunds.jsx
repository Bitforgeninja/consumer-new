import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddFunds = () => {
  const navigate = useNavigate();
  const [transactionId, setTransactionId] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(
          "https://backend-pbn5.onrender.com/api/admin/platform-settings"
        );
        if (res.data.upiId) setUpiId(res.data.upiId);
        if (res.data.qrCodeUrl)
          setQrCodeUrl(res.data.qrCodeUrl + "?t=" + Date.now()); // 💥 Cache-busting
      } catch (err) {
        console.error("❌ Cannot fetch QR or UPI ID:", err);
      }
    };

    fetchSettings();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleReceiptChange = (e) => {
    setReceipt(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!transactionId || !amount || !receipt) {
      setError("All fields are required.");
      return;
    }

    const formData = new FormData();
    formData.append("transactionId", transactionId.trim());
    formData.append("amount", parseFloat(amount));
    formData.append("type", "deposit");
    formData.append("receipt", receipt);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://backend-pbn5.onrender.com/api/wallet/add-funds",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage(res.data.message);
      setError("");
      setAmount("");
      setTransactionId("");
      setReceipt(null);
    } catch (err) {
      setMessage("");
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen p-5 flex flex-col items-center">
      <div className="flex items-center w-full max-w-md mb-5">
        <button
          onClick={() => navigate(-1)}
          className="bg-transparent text-white p-2 rounded-full hover:bg-gray-700"
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
        {qrCodeUrl ? (
          <img
            src={qrCodeUrl}
            alt="QR Code"
            className="w-full h-auto rounded-lg"
          />
        ) : (
          <div className="text-yellow-400 text-center">
            QR Code not available
          </div>
        )}
      </div>

      <div className="bg-gray-800 p-4 rounded-lg shadow-md text-center w-full max-w-md mb-4">
        <h3 className="text-lg font-semibold mb-2">UPI ID for Payment</h3>
        <div className="flex justify-between items-center bg-gray-700 px-3 py-2 rounded-lg">
          <span className="text-yellow-400 font-bold">{upiId || "Not set"}</span>
          {upiId && (
            <button
              onClick={handleCopy}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              {copySuccess ? "Copied!" : "Copy"}
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm mb-1">
              Enter Number of Coins:
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white"
              placeholder="e.g. 100"
            />
          </div>

          <div>
            <label htmlFor="transactionId" className="block text-sm mb-1">
              UTR / Transaction ID:
            </label>
            <input
              id="transactionId"
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg bg-gray-700 text-white"
              placeholder="e.g. 12345UTR6789"
            />
          </div>

          <div>
            <label htmlFor="receipt" className="block text-sm mb-1">
              Upload Payment Receipt:
            </label>
            <input
              id="receipt"
              type="file"
              accept="image/*"
              onChange={handleReceiptChange}
              required
              className="w-full bg-gray-700 text-white py-2 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-semibold"
          >
            Submit
          </button>

          {message && (
            <p className="text-green-500 text-center mt-4">{message}</p>
          )}
          {error && (
            <p className="text-red-500 text-center mt-4">{error}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default AddFunds;
