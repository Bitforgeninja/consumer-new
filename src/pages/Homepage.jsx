import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";

const HomePage = () => {
  const navigate = useNavigate();
  const [allMarkets, setAllMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [marketClosedMessage, setMarketClosedMessage] = useState("");

  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutesInDay = currentHours * 60 + now.getMinutes();

  // Format result or hide after midnight
  const formatMarketResult = (results) => {
    if (currentHours >= 0 && currentHours < 6) return "***-**-***";
    if (!results) return "xxx-xx-xxx";
    const open = results.openNumber?.padEnd(3, "x").slice(0, 3) || "xxx";
    const close = results.closeNumber?.padEnd(3, "x").slice(0, 3) || "xxx";
    const jodi =
      results.jodiResult?.toString().padEnd(2, "x").slice(0, 2) || "xx";
    return `${open}-${jodi}-${close}`;
  };

  // Converts AM/PM time to minutes
  const getTimeInMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [time, ampm] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        let marketsResponse;
        try {
          marketsResponse = await axios.get(
            "https://backend-pbn5.onrender.com/api/markets"
          );
        } catch (error) {
          if (error.response && error.response.status === 403) {
            setMarketClosedMessage(error.response.data.message);
            return;
          } else {
            throw error;
          }
        }

        const sortedMarkets = marketsResponse.data.sort(
          (a, b) => getTimeInMinutes(a.openTime) - getTimeInMinutes(b.openTime)
        );

        setAllMarkets(sortedMarkets);

        const settingsResponse = await axios.get(
          "https://backend-pbn5.onrender.com/api/admin/platform-settings"
        );
        setBannerImageUrl(settingsResponse.data.bannerImageUrl);
      } catch (error) {
        console.error("Error fetching data:", error);
        setMarketClosedMessage("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Show only message from 12 AM to 6 AM
  if (currentHours >= 0 && currentHours < 6) {
    return (
      <div className="font-sans bg-gray-900 text-white p-4 min-h-screen">
        <div className="my-4 flex justify-center items-center overflow-hidden rounded-lg shadow-lg max-w-3xl mx-auto">
          <img
            src={
              bannerImageUrl ||
              "https://via.placeholder.com/1000x400?text=Loading+Image"
            }
            alt="Casino Banner"
            className="object-cover rounded-lg w-full max-h-48"
          />
        </div>

        <marquee className="text-sm font-medium bg-gray-800 py-2">
          100% Genuine! Deposits and Withdrawals available 24x7
        </marquee>

        <h2 className="text-xl text-center font-bold mt-6 mb-4">
          Markets will be open after 6 AM
        </h2>
      </div>
    );
  }

  return (
    <div className="font-sans bg-gray-900 text-white p-4 min-h-screen">
      {/* Banner */}
      <div className="my-4 flex justify-center items-center overflow-hidden rounded-lg shadow-lg max-w-3xl mx-auto">
        <img
          src={
            bannerImageUrl ||
            "https://via.placeholder.com/1000x400?text=Loading+Image"
          }
          alt="Casino Banner"
          className="object-cover rounded-lg w-full max-h-48"
        />
      </div>

      <marquee className="text-sm font-medium bg-gray-800 py-2">
        100% Genuine! Deposits and Withdrawals available 24x7
      </marquee>

      <div className="flex justify-center items-center gap-4 mb-4">
        <button
          className="text-sm font-medium py-2 px-4 bg-red-700 text-white rounded-lg shadow-md"
          onClick={() => navigate("/contact")}
        >
          📞 Contact Us
        </button>
        <button
          className="text-sm font-medium py-2 px-4 bg-yellow-600 text-white rounded-lg shadow-md"
          onClick={() => navigate("/add-funds")}
        >
          + Add Points
        </button>
      </div>

      <h2 className="text-xl font-bold text-center mb-4">All Markets</h2>

      {marketClosedMessage && (
        <div className="text-center text-red-500 font-semibold text-lg mb-4">
          {marketClosedMessage}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[150px]">
          <div className="loader w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allMarkets.length === 0 ? (
            <p className="text-center text-gray-400">No markets available.</p>
          ) : (
            allMarkets.map((market) => {
              const openMinutes = getTimeInMinutes(market.openTime);
              const closeMinutes = getTimeInMinutes(market.closeTime);
              const openCutoff = openMinutes - 10;
              const closeCutoff = closeMinutes - 10;

              let bettingStatus = "Closed";

              // ✅ FIXED LOGIC
              if (currentMinutesInDay < openCutoff) {
                bettingStatus = "Full"; // Full betting allowed
              } else if (
                currentMinutesInDay >= openCutoff &&
                currentMinutesInDay < closeCutoff
              ) {
                bettingStatus = "CloseOnly"; // Open betting closed, Close only
              } else {
                bettingStatus = "Closed"; // Both closed
              }

              const statusText =
                bettingStatus === "Full"
                  ? "Market Open"
                  : bettingStatus === "CloseOnly"
                  ? "Close Market Only"
                  : "Closed";

              const badgeColor =
                bettingStatus === "Full"
                  ? "bg-green-500"
                  : bettingStatus === "CloseOnly"
                  ? "bg-yellow-500"
                  : "bg-red-500";

              return (
                <div
                  key={market._id}
                  className="relative p-3 bg-gray-800 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer"
                  onClick={() =>
                    bettingStatus !== "Closed" &&
                    navigate(`/play/${market.name}`)
                  }
                >
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-semibold">{market.name}</h3>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeColor}`}
                    >
                      {statusText}
                    </span>
                  </div>
                  <div className="text-gray-300">
                    <p className="text-xs">
                      Open: {market.openTime} | Close: {market.closeTime}
                    </p>
                    <p className="text-sm mt-1 text-yellow-500 font-bold">
                      {formatMarketResult(market.results)}
                    </p>
                  </div>
                  {bettingStatus !== "Closed" && (
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
              );
            })
          )}
        </div>
      )}

      {/* WhatsApp Button */}
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
