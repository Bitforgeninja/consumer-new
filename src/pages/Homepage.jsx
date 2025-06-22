allMarkets.map((market) => {
  const getTimeInMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [time, ampm] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const openMinutes = getTimeInMinutes(market.openTime);
  const closeMinutes = getTimeInMinutes(market.closeTime);

  const openCutoff = openMinutes - 10;
  const closeCutoff = closeMinutes - 10;

  let bettingStatus = 'Closed';
  if (currentMinutes < openCutoff) {
    bettingStatus = 'Upcoming';
  } else if (currentMinutes >= openCutoff && currentMinutes < closeCutoff) {
    bettingStatus = 'Open';
  } else if (currentMinutes >= closeCutoff && currentMinutes <= closeMinutes) {
    bettingStatus = 'Closing Soon';
  }

  const isBettingAllowed = bettingStatus === 'Open';

  return (
    <div
      key={market._id}
      className="relative p-3 bg-gray-800 rounded-lg shadow-md transition-all duration-300 ease-in-out hover:scale-105 cursor-pointer"
      onClick={() => isBettingAllowed && navigate(`/play/${market.name}`)}
    >
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-sm font-semibold">{market.name}</h3>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            bettingStatus === 'Open'
              ? 'bg-green-500'
              : bettingStatus === 'Closing Soon'
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
        >
          {bettingStatus === 'Open'
            ? 'Market Open'
            : bettingStatus === 'Closing Soon'
            ? 'Closing Soon'
            : 'Closed'}
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
      {isBettingAllowed && (
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
