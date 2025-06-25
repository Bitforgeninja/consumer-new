import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faSpinner } from "@fortawesome/free-solid-svg-icons";
// ⚠️ Removed invalid import of missing JSON file

const MarketChart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const marketName = location.state?.marketName;

  const [weeklyResults, setWeeklyResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🛑 Fallback data if no API or JSON
  const marketData = [];

  const parseDate = (str) => new Date(str + "T00:00:00");
  const formatDate = (date) => date.toLocaleDateString("en-GB");
  const getDayName = (date) =>
    date.toLocaleDateString("en-US", { weekday: "long" });

  if (!marketName) {
    return (
      <div className="p-4 bg-gray-900 text-white min-h-screen text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Market Missing</h2>
        <p className="text-yellow-400">
          Please return to homepage and click the Chart again.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-yellow-400 text-black mt-6 py-2 px-4 rounded hover:bg-yellow-500"
        >
          ⬅ Go Back
        </button>
      </div>
    );
  }

  useEffect(() => {
    const filteredData = marketData.filter(
      (entry) =>
        entry.marketName?.toLowerCase().trim() ===
        marketName?.toLowerCase().trim()
    );

    if (filteredData.length === 0) {
      setWeeklyResults([]);
      setIsLoading(false);
      return;
    }

    const latestByDate = {};
    filteredData.forEach((entry) => {
      const dateKey = entry.date;
      latestByDate[dateKey] = entry;
    });

    const weeklyData = {};
    Object.values(latestByDate).forEach((entry) => {
      const date = parseDate(entry.date);
      const startOfWeek = new Date(date);
      startOfWeek.setDate(
        date.getDate() - (date.getDay() === 0 ? 6 : date.getDay() - 1)
      );

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
  }, [marketName]);

  const Loader = () => (
    <div className="flex flex-col items-center py-12">
      <FontAwesomeIcon
        icon={faSpinner}
        spin
        className="text-yellow-500 text-5xl mb-4"
      />
      <p className="text-xl text-yellow-400">Loading chart...</p>
    </div>
  );

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="text-white text-lg mb-4 flex items-center space-x-2 hover:scale-110 transition-transform"
      >
        <FontAwesomeIcon icon={faArrowLeft} /> <span>Back</span>
      </button>

      <h2 className="text-2xl font-bold text-center mb-4">
        📊 {marketName} Panel Record
      </h2>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-700">
            <thead>
              <tr className="bg-yellow-500 text-black">
                <th className="p-2 border">Date Range</th>
                {[
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ].map((day) => (
                  <th key={day} className="p-2 border">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeklyResults.length > 0 ? (
                weeklyResults.map((week, index) => (
                  <tr key={index} className="text-center bg-gray-800">
                    <td className="font-semibold text-yellow-400 p-2 border">
                      {week.dateRange}
                    </td>
                    {[
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                      "Friday",
                      "Saturday",
                      "Sunday",
                    ].map((day, idx) => {
                      const dayData = week.results[day] || {
                        left: ["-", "-", "-"],
                        center: "-",
                        right: ["-", "-", "-"],
                      };
                      return (
                        <td key={idx} className="p-2 border">
                          <table className="w-full border-collapse border border-gray-500">
                            <tbody>
                              {[0, 1, 2].map((i) => (
                                <tr key={i}>
                                  <td className="border px-1 text-sm">
                                    {dayData.left[i]}
                                  </td>
                                  <td className="border px-1">
                                    {i === 1 && (
                                      <strong className="text-red-500 text-xl">
                                        {dayData.center}
                                      </strong>
                                    )}
                                  </td>
                                  <td className="border px-1 text-sm">
                                    {dayData.right[i]}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      );
                    })}
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
