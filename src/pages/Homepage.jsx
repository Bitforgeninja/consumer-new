import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

const HomePage = () => {
  const navigate = useNavigate();
  const [allMarkets, setAllMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [marketClosedMessage, setMarketClosedMessage] = useState(""); // 🚨 Market closed msg

  const formatMarketResult = (results) => {
    if (!results) return "xxx-xx-xxx";
    const open = results.openNumber?.padEnd(3, 'x').slice(0, 3) || "xxx";
    const close = results.closeNumber?.padEnd(3, 'x').slice(0, 3) || "xxx";
    const jodi = results.jodiResult?.toString().padEnd(2, 'x').slice(0, 2) || "xx";
    return `${open}-${jodi}-${close}`;
  };

  const convertTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [timePart, ampm] = timeStr.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🚀 FETCH MARKET DATA
        let marketsResponse;
        try {
          marketsResponse = await axios.get('https://backend-pbn5.onrender.com/api/markets');
        } catch (error) {
          if (error.response && error.response.status === 403) {
            setMarketClosedMessage(error.response.data.message);
            return; // stop execution if market is closed
          } else {
            throw error;
          }
        }

        const openMarkets = marketsResponse.data.filter(market => market.isBettingOpen);
        const closedMarkets = marketsResponse.data.filter(market => !market.isBettingOpen);
        const sortedOpenMarkets = openMarkets.sort((a, b) =>
          convertTimeToMinutes(a.openTime) - convertTimeToMinutes(b.openTime)
        );
        const sortedMarkets = [...sortedOpenMarkets, ...closedMarkets];
        setAllMarkets(sortedMarkets);

        // 🖼️ FETCH SETTINGS
        const settingsResponse = await axios.get('https://backend-pbn5.onrender.com/api/admin/platform-settings');
        setBannerImageUrl(settingsResponse.data.bannerImageUrl);
      } catch (error) {
        console.error('Error fetching data:', error);
        setMarketClosedMessage("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="font-sans bg-gray-900 text-white p-4 min-h-screen">
      {/* 🖼️ Banner Section */}
      <div className="my-4 flex justify-center items-center overflow-hidden rounded-lg shadow-lg max-w-3xl mx-auto">
        <img
          src={bannerImageUrl || "https://via.placeholder.com/1000x400?text=Loading+Image"}
          alt="Casino Banner"
          className="object-cover rounded-lg w-full max-h-48"
        />
      </div>

      {/* 🏁 Marquee */}
      <marquee className="text-sm font-medium bg-gray-800 py-2">
        100% Genuine! Deposits and Withdrawals are available 24x7
      </marquee>

      {/* 📞 Action Buttons */}
      <div className="flex justify-center items-center gap-4 mb-4">
        <button
          className="text-sm font-medium py-2 px-4 bg-gradient-to-r from-red-700 to-red-900 text-white rounded-lg shadow-md hover:from-red-800 hover:to-red-900"
          onClick={() => navigate("/contact")}
        >
          📞 Contact Us
        </button>
        <button
          className="text-sm font-medium py-2 px-4 bg-gradient-to-r from-yellow-500 to-yellow-700 text-white rounded-lg shadow-md hover:from-yellow-600 hover:to-yellow-800"
          onClick={() => navigate('/add-funds')}
        >
          + Add Points
        </button>
      </div>

      {/* 📍 Markets Section */}
      <h2 className="text-xl font-bold text-center mb-4">All Markets</h2>

      {/* 🚫 Market Closed Message */}
      {marketClosedMessage && (
        <div className="text-center text-red-500 font-semibold text-lg mb-4">
          {marketClosedMessage}
        </div>
      )}

      {/* 🔄 Loader or Markets */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[150px]">
          <div className="loader w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : !marketClosedMessage ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allMarkets.length === 0 ? (
            <p className="text-center text-gray-400">No markets available.</p>
          ) : (
            allMarkets.map((market) => (
              <div
                key={market._id}
                className="relative p-3 bg-gray-800 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer"
                onClick={() => market.isBettingOpen && navigate(`/play/${market.name}`)}
              >
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm font-semibold">{market.name}</h3>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      market.isBettingOpen ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  >
                    {market.isBettingOpen ? 'Market is Open' : 'Market is Closed'}
                  </span>
                </div>
                <div className="text-gray-300">
                  <p className="text-xs">Open: {market.openTime} | Close: {market.closeTime}</p>
                  <p className="text-sm mt-1 text-yellow-500 font-bold">
                    {formatMarketResult(market.results)}
                  </p>
                </div>
                {market.isBettingOpen && (
                  <button
                    className="absolute bottom-3 right-3 bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-purple-700 transition-colors duration-300 ease-in-out"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/play/${market.name}`);
                    }}
                  >
                    <FontAwesomeIcon icon={faPlay} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      ) : null}

      {/* ✅ WhatsApp */}
      <a
        href="https://wa.me/917051098359"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-600 p-4 rounded-full text-white shadow-lg hover:bg-green-700 transition-transform duration-300 transform hover:scale-110 flex items-center justify-center"
        style={{
          zIndex: 1000,
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
        }}
      >
        <FontAwesomeIcon icon={faWhatsapp} size="lg" />
      </a>
    </div>
  );
};

export default HomePage;