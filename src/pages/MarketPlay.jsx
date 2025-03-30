import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faChartBar, faTrophy } from '@fortawesome/free-solid-svg-icons';

const MarketPlay = () => {
  const { marketName } = useParams(); // Get market name from route
  const navigate = useNavigate();
  const { gameName } = useParams();

  const options = [
    {
      name: 'Single Digit',
      path: '/single-digit',
      image: 'https://res.cloudinary.com/dwroh4zkk/image/upload/v1735050664/single_digit_dtpwhz.webp',
    },
    {
      name: 'Jodi Digit',
      path: '/jodi-digit',
      image: 'https://res.cloudinary.com/dwroh4zkk/image/upload/v1735050664/jodi_digit_bpn6m8.webp',
    },
    {
      name: 'Single Pana',
      path: '/single-pana',
      image: 'https://res.cloudinary.com/dwroh4zkk/image/upload/v1735050664/single-pana_uup7nq.webp',
    },
    {
      name: 'Double Pana',
      path: '/double-pana',
      image: 'https://res.cloudinary.com/dwroh4zkk/image/upload/v1735050664/double-pana_o6zfol.webp',
    },
    {
      name: 'Triple Pana',
      path: '/triple-pana',
      image: 'https://res.cloudinary.com/dwroh4zkk/image/upload/v1735050664/triple-pana_pmzep7.webp',
    },
    {
      name: 'Half Sangam',
      path: '/half-sangam',
      image: 'https://github.com/Bitforgeninja/backend/blob/main/WhatsApp%20Image%202025-03-25%20at%2012.51.34_3a11b3fe.jpg?raw=true',
    },
    {
      name: 'Full Sangam',
      path: '/full-sangam',
      image: 'https://github.com/Bitforgeninja/backend/blob/main/WhatsApp%20Image%202025-03-25%20at%2012.51.34_6589ea01.jpg?raw=true',  // Replace with actual URL
    }
  ];

  return (
    <div className="p-4 min-h-screen bg-gray-900 text-white">
      {/* Back Arrow and Market Info Container */}
      <div className="bg-gray-800 p-3 shadow-md flex items-center space-x-3 rounded-md">
      <button
      onClick={() => navigate(-1)}
      className="mr-3 bg-transparent text-white flex items-center space-x-1 p-1 rounded-full hover:bg-gray-700 transition duration-300"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
      <span>Back</span>
    </button>
        <div>
          <h2 className="text-lg font-bold"> {marketName}</h2>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-between space-x-3 mt-4">
        <button
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-md shadow-md text-sm font-semibold hover:scale-105 transition-transform"
          onClick={() => navigate("/bets-history", { state: { marketName } })}
        >
          <FontAwesomeIcon icon={faHistory} />
          Play History
        </button>

        <button
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-md shadow-md text-sm font-semibold hover:scale-105 transition-transform"
          onClick={() => navigate("/market-chart", { state: { marketName } })}
        >
          <FontAwesomeIcon icon={faChartBar} />
          Chart
        </button>

        <button
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-4 py-3 rounded-md shadow-md text-sm font-semibold hover:scale-105 transition-transform"
          onClick={() => navigate("/win-history", { state: { marketName } })}
        >
          <FontAwesomeIcon icon={faTrophy} />
          Win History
        </button>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
        {options.map((option, index) => (
          <div
            key={index}
            className="bg-gray-800 rounded-md shadow-md hover:scale-105 transform transition-all p-3 text-center cursor-pointer"
            onClick={() =>
              navigate(option.path, {
                state: { marketName },
              })
            }
          >
            <img
              src={option.image}
              alt={option.name}
              className="w-20 h-20 mx-auto rounded-md mb-2 object-cover"
            />
            <button className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-2 py-1 rounded-md shadow-md text-xs font-medium hover:from-purple-700 hover:to-purple-800 transition-all">
              {option.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketPlay;
