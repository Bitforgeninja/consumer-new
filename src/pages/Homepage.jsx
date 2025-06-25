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
  const [whatsAppNumber, setWhatsAppNumber] = useState("");
  const [marketClosedMessage, setMarketClosedMessage] = useState("");

  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutesInDay = currentHours * 60 + now.getMinutes();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const marketsResponse = await axios.get(
          "https://backend-pbn5.onrender.com/api/markets"
        );

        const sortedMarkets = marketsResponse.data.sort((a, b) => {
          const getTimeInMinutes = (timeStr) => {
            if (!timeStr) return 0;
            const [time, ampm] = timeStr.split(" ");
            let [hours, minutes] = time.split(":").map(Number);
            if (ampm === "PM" && hours < 12) hours += 12;
            if (ampm === "AM" && hours === 12) hours = 0;
            return hours * 60 + minutes;
          };
          return getTimeInMinutes(a.openTime) - getTimeInMinutes(b.openTime);
        });

        setAllMarkets(sortedMarkets);

        const settingsResponse = await axios.get(
          "https://backend-pbn5.onrender.com/api/admin/platform-settings"
        );

        const { bannerImageUrl, whatsAppNumber } = settingsResponse.data;

        if (bannerImageUrl) {
          setBannerImageUrl(bannerImageUrl + "?v=" + Date.now());
        }

        if (whatsAppNumber) {
          setWhatsAppNumber(whatsAppNumber);
        }
      } catch (error) {
        if (error.response?.status === 403) {
          setMarketClosedMessage("Market closed. Please come back later.");
        } else {
          console.error("Error fetching data:", error);
          setMarketClosedMessage("Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatMarketResult = (results) => {
    if (currentHours >= 0 && currentHours < 6) return "***-**-***";
    if (!results) return "xxx-xx-xxx";
    const open = results.openNumber?.padEnd(3, "x").slice(0, 3) || "xxx";
    const close = results.closeNumber?.padEnd(3, "x").slice(0, 3) || "xxx";
    const jodi =
      results.jodiResult?.toString().padEnd(2, "x").slice(0, 2) || "xx";
    return `${open}-${jodi}-${close}`;
  };

  return (
    <div className="font-sans bg-[#f7f7f7] text-gray-900 p-4 min-h-screen">
      {/* ✅ Banner Image */}
      <div className="my-4 max-w-3xl mx-auto overflow-hidden rounded-lg shadow">
        <img
          src={bannerImageUrl || "https://via.placeholder.com/1000x400?text=No+Banner"}
          alt="Banner"
          className="w-full h-48 object-cover rounded-md"
        />
      </div>

      <div className="bg-yellow-100 text-yellow-800 text-sm p-2 rounded text-center font-medium mb-4">
        100% Genuine! Deposits and Withdrawals available 24x7
      </div>

      <div className="flex justify-center items-center gap-4 mb-6">
        <button
          className="text-base font-medium py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          onClick={() => navigate("/contact")}
        >
          📞 Contact Us
        </button>
        <button
          className="text-base font-medium py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
          onClick={() => navigate("/add-funds")}
        >
          + Add Points
        </button>
      </div>

      <h2 className="text-2xl font-bold text-center mb-4">All Markets</h2>

      {marketClosedMessage && (
        <div className="text-center text-red-600 font-semibold text-lg mb-4">
          {marketClosedMessage}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[150px]">
          <div className="loader w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allMarkets.length === 0 ? (
            <p className="text-center text-gray-500">No markets available.</p>
          ) : (
            allMarkets.map((market) => {
              const getTimeInMinutes = (timeStr) => {
                if (!timeStr) return 0;
                const [time, ampm] = timeStr.split(" ");
                let [hours, minutes] = time.split(":").map(Number);
                if (ampm === "PM" && hours < 12) hours += 12;
                if (ampm === "AM" && hours === 12) hours = 0;
                return hours * 60 + minutes;
              };

              const openMinutes = getTimeInMinutes(market.openTime);
              const closeMinutes = getTimeInMinutes(market.closeTime);
              const openCutoff = openMinutes - 10;
              const closeCutoff = closeMinutes - 10;

              let bettingStatus = "Closed";
              if (currentMinutesInDay < openCutoff) {
                bettingStatus = "Full";
              } else if (
                currentMinutesInDay >= openCutoff &&
                currentMinutesInDay < closeCutoff
              ) {
                bettingStatus = "CloseOnly";
              }

              const statusText =
                bettingStatus === "Full"
                  ? "Market Open"
                  : bettingStatus === "CloseOnly"
                  ? "Close Market Only"
                  : "Closed";

              const badgeClass =
                bettingStatus === "Full"
                  ? "bg-green-100 text-green-700"
                  : bettingStatus === "CloseOnly"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700";

              return (
                <div
                  key={market._id}
                  className="relative p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer"
                  onClick={() =>
                    bettingStatus !== "Closed" &&
                    navigate(`/play/${market.name}`)
                  }
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-base font-semibold">{market.name}</h3>
                    <div className="flex gap-1">
                      <span
                        className={`text-sm font-medium px-3 py-1 rounded-full ${badgeClass}`}
                      >
                        {statusText}
                      </span>
                      <button
                        className="bg-gray-100 text-gray-800 px-2 py-1 text-xs rounded font-medium hover:bg-gray-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/market-chart", {
                            state: {
                              marketName: market.name.trim().toLowerCase()
                            }
                          });
                        }}
                      >
                        📊 Chart
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p>
                      Open: {market.openTime} | Close: {market.closeTime}
                    </p>
                    <p className="text-lg mt-1 text-blue-600 font-bold">
                      {formatMarketResult(market.results)}
                    </p>
                  </div>
                  {bettingStatus !== "Closed" && (
                    <button
                      className="absolute bottom-3 right-3 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-blue-700"
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

      {/* ✅ WhatsApp Button */}
      {whatsAppNumber && (
        <a
          href={`https://wa.me/${whatsAppNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 bg-green-600 p-4 rounded-full text-white shadow-lg hover:bg-green-700 transition-transform duration-300 transform hover:scale-110 flex items-center justify-center"
          style={{ zIndex: 1000 }}
        >
          <FontAwesomeIcon icon={faWhatsapp} size="lg" />
        </a>
      )}
    </div>
  );
};

export default HomePage;
