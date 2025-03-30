import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/SideBar';

const Header = () => {
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const fetchWalletBalance = async () => {
      const token = localStorage.getItem('token');
      // console.log(token)
      if (token) {
        setIsLoggedIn(true);
        try {
          const { data } = await axios.get(
            'https://backend-pbn5.onrender.com/api/wallet/balance',
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setWalletBalance(data.walletBalance);
        } catch (error) {
          console.error('Error fetching wallet balance:', error);
        }
      } else {
        setIsLoggedIn(false);
      }
    };

    fetchWalletBalance();
  }, []);

  return (
    <header className="flex justify-between items-center p-4 bg-gray-900 text-white shadow-lg">
      <div className="flex items-center space-x-4">
        <button
          aria-label="Toggle Sidebar"
          className="material-icons-outlined text-3xl hover:text-purple-300 cursor-pointer"
          onClick={toggleSidebar}
        >
          menu
        </button>
        <h1
          className="text-2xl font-bold cursor-pointer"
          onClick={() => navigate('/')}
        >
          DP Matka King
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        {isLoggedIn ? (
          <div
            className="flex items-center bg-purple-700 text-white px-6 py-2 rounded-lg shadow text-sm font-bold cursor-pointer hover:bg-purple-600 transition-colors"
            onClick={() => navigate('/wallet')}
          >
            <span className="material-icons-outlined mr-2">
              account_balance_wallet
            </span>
            Points: {walletBalance}
          </div>
        ) : (
          <button
            className="px-5 py-2 text-lg bg-purple-600 text-white rounded-lg font-bold cursor-pointer transition-colors duration-300 ease-in-out hover:bg-purple-500"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        )}
      </div>

      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
    </header>
  );
};

export default Header;
