import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSpinner } from "@fortawesome/free-solid-svg-icons";

// 🛠 Utility: Convert "YYYY-MM-DD" to Date object
const parseDate = (str) => {
  return new Date(str + "T00:00:00");
};

// 🛠 Format date as "DD-MM-YYYY"
const formatDate = (date) => {
  return date.toLocaleDateString("en-GB");
};

// 🛠 Get weekday name from Date object
const getDayName = (date) => {
  return date.toLocaleDateString("en-US", { weekday: "long" });
};

const MarketChart = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const marketName = location.state?.marketName || "";
  const [marketId, setMarketId] = useState("");
  const [weeklyResults, setWeeklyResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Market ID by Name
  useEffect(() => {
    if (!marketName) return;
    const fetchMarketId = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `https://backend-pbn5.onrender.com/api/markets/get-market-id/${marketName}`
        );
        setMarketId(res.data.marketId);
      } catch (error) {
        console.error("❌ Error fetching Market ID:", error.message);
        setIsLoading(false);
      }
    };
    fetchMarketId();
  }, [marketName]);

  // Fetch & Transform Market Results
  useEffect(() => {
    if (!marketId) return;
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/login");

        const res = await axios.get(
          `https://backend-pbn5.onrender.com/api/markets/get-results/${marketId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const rawData = res.data;

        // 🧹 Deduplicate by date with valid entry preferred
        const latestByDate = {};
        rawData.forEach((entry) => {
          const dateKey = entry.date;
          const isDummy =
            (entry.openNumber === "000" || entry.openNumber === "0") &&
            (entry.closeNumber === "000" || entry.closeNumber === "0");

          if (!latestByDate[dateKey]) {
            latestByDate[dateKey] = entry;
          } else {
            const existing = latestByDate[dateKey];
            const existingIsDummy =
              (existing.openNumber === "000" || existing.openNumber === "0") &&
              (existing.closeNumber === "000" || existing.closeNumber === "0");

            // Keep the valid one if it exists
            if (existingIsDummy && !isDummy) {
              latestByDate[dateKey] = entry;
            }
          }
        });

        // 🗓️ Organize into weekly results
        const weeklyData = {};

        Object.values(latestByDate).forEach((entry) => {
          const date = parseDate(entry.date);
          if (isNaN(date)) return;

          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - (date.getDay() === 0 ? 6 : date.getDay() - 1));
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);

          const weekKey = `${formatDate(startOfWeek)} to ${formatDate(endOfWeek)}`;
          const dayName = getDayName(date);

          if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = {
              dateRange: weekKey,
              weekStart: startOfWeek.getTime(),
              results: {},
            };
          }

          weeklyData[weekKey].results[dayName] = {
            left: entry.openNumber?.split("") || ["-", "-", "-"],
            center: entry.jodiResult || "-",
            right: entry.closeNumber?.split("") || ["-", "-", "-"],
          };
        });

        const sortedWeeks = Object.values(weeklyData).sort(
          (a, b) => b.weekStart - a.weekStart
        );

        setWeeklyResults(sortedWeeks);
        setIsLoading(false);
      } catch (error) {
        console.error("❌ Error fetching market results:", error.message);
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [marketId, navigate]);

  // Loader Component
  const Loader = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <FontAwesomeIcon 
        icon={faSpinner} 
        spin 
        className="text-yellow-500 text-5xl mb-4" 
      />
      <p className="text-xl text-yellow-400">Loading market data...</p>
    </div>
  );

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <button
        className="text-white text-lg mb-4 flex items-center space-x-2 hover:scale-110 transition-transform"
        onClick={() => navigate(-1)}
      >
        <FontAwesomeIcon icon={faArrowLeft} />
        <span>Back</span>
      </button>

      <h2 className="text-2xl font-bold text-center mb-4">
        Matka Market Panel Record
      </h2>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-700">
            <thead>
              <tr className="bg-yellow-500 text-black">
                <th className="p-2 border border-gray-700">Date Range</th>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                  (day) => (
                    <th key={day} className="p-2 border border-gray-700">
                      {day}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {weeklyResults.length > 0 ? (
                weeklyResults.map((week, index) => (
                  <tr key={index} className="text-center bg-gray-800">
                    <td className="p-2 border border-gray-700 font-semibold text-yellow-400">
                      {week.dateRange}
                    </td>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                      (day, idx) => {
                        const dayData = week.results[day] || {
                          left: ["-", "-", "-"],
                          center: "-",
                          right: ["-", "-", "-"],
                        };
                        return (
                          <td key={idx} className="p-2 border border-gray-700">
                            <table className="w-full border-collapse border border-gray-500">
                              <tbody>
                                {[0, 1, 2].map((rowIndex) => (
                                  <tr key={rowIndex} className="text-center">
                                    <td className="border border-gray-700 p-1">
                                      {dayData.left[rowIndex]}
                                    </td>
                                    <td className="border border-gray-700 p-1">
                                      {rowIndex === 1 ? (
                                        <strong className="text-2xl text-red-500">
                                          {dayData.center}
                                        </strong>
                                      ) : (
                                        ""
                                      )}
                                    </td>
                                    <td className="border border-gray-700 p-1">
                                      {dayData.right[rowIndex]}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </td>
                        );
                      }
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="p-4 text-yellow-400 text-center">
                    No results found for this market.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MarketChart;