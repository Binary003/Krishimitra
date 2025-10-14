import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { getApiUrl } from '../config/api';

const MandiPricesPage = () => {
  // State management
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Search states
  const [cropSearch, setCropSearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [mandiSearch, setMandiSearch] = useState("");

  // Fetch mandi prices from API
  const fetchMandiPrices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(getApiUrl("/api/mandi/prices"));
      const data = await response.json();

      if (data.success) {
        setPrices(data.data || []);
        setLastUpdated(new Date(data.lastUpdated));
      } else {
        throw new Error(data.error || "Failed to fetch prices");
      }
    } catch (err) {
      console.error("Error fetching mandi prices:", err);
      setError(err.message);

      // Fallback to sample data
      setPrices([
        {
          crop: "Wheat",
          mandi: "Delhi",
          state: "Delhi",
          minPrice: 2100,
          maxPrice: 2500,
          unit: "₹/Quintal",
          source: "fallback",
        },
        {
          crop: "Rice",
          mandi: "Punjab",
          state: "Punjab",
          minPrice: 1800,
          maxPrice: 2200,
          unit: "₹/Quintal",
          source: "fallback",
        },
        {
          crop: "Maize",
          mandi: "Maharashtra",
          state: "Maharashtra",
          minPrice: 1600,
          maxPrice: 2000,
          unit: "₹/Quintal",
          source: "fallback",
        },
        {
          crop: "Sugarcane",
          mandi: "UP",
          state: "Uttar Pradesh",
          minPrice: 3500,
          maxPrice: 4000,
          unit: "₹/Ton",
          source: "fallback",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh
  const handleRefresh = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl("/api/mandi/refresh"), { method: "POST" });
      const data = await response.json();
      if (data.success) {
        await fetchMandiPrices();
      } else {
        throw new Error(data.error || "Failed to refresh data");
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError(err.message);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchMandiPrices();
    const refreshInterval = setInterval(fetchMandiPrices, 30 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, []);

  // Filtering logic
  const filteredPrices = prices.filter((item) => {
    const cropMatch = cropSearch
      ? item.crop.toLowerCase().includes(cropSearch.toLowerCase())
      : true;
    const stateMatch = stateSearch
      ? item.state.toLowerCase().includes(stateSearch.toLowerCase())
      : true;
    const mandiMatch = mandiSearch
      ? item.mandi.toLowerCase().includes(mandiSearch.toLowerCase())
      : true;

    return cropMatch && stateMatch && mandiMatch;
  });

  // Format last updated
  const formatLastUpdated = (date) => {
    if (!date) return "Unknown";

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;

    return (
      date.toLocaleDateString("en-IN") +
      " at " +
      date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=2940&q=80')`,
      }}
    >
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="relative z-10 min-h-screen flex flex-col p-3 sm:p-4 lg:p-6">
        <Header />

        {/* Page Title */}
        <div className="flex justify-between items-center mt-4 sm:mt-6 mb-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white">
            Mandi Prices
          </h1>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition duration-200"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Updating...
              </>
            ) : (
              <>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>

        {/* Data Status */}
        {(lastUpdated || error) && (
          <div className="mb-4 flex flex-col sm:flex-row gap-2 text-sm">
            {lastUpdated && (
              <div className="bg-green-500/80 text-white px-3 py-1 rounded-lg">
                Last updated: {formatLastUpdated(lastUpdated)}
              </div>
            )}
            {error && (
              <div className="bg-yellow-500/80 text-white px-3 py-1 rounded-lg">
                Using cached data - {error}
              </div>
            )}
          </div>
        )}

        {/* Search Inputs */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search by crop..."
            value={cropSearch}
            onChange={(e) => setCropSearch(e.target.value)}
            className="w-full sm:w-1/3 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="text"
            placeholder="Search by state..."
            value={stateSearch}
            onChange={(e) => setStateSearch(e.target.value)}
            className="w-full sm:w-1/3 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="text"
            placeholder="Search by mandi..."
            value={mandiSearch}
            onChange={(e) => setMandiSearch(e.target.value)}
            className="w-full sm:w-1/3 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Price Table */}
        <div className="overflow-x-auto rounded-lg bg-white/90 shadow-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-green-500 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Crop</th>
                <th className="px-4 py-2 text-left">State</th>
                <th className="px-4 py-2 text-left">Mandi</th>
                <th className="px-4 py-2 text-left">Min Price</th>
                <th className="px-4 py-2 text-left">Max Price</th>
                <th className="px-4 py-2 text-left">Unit</th>
                <th className="px-4 py-2 text-left">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPrices.length > 0 ? (
                filteredPrices.map((item, index) => (
                  <tr
                    key={`${item.crop}-${item.state}-${item.mandi}-${index}`}
                    className="hover:bg-green-100 transition duration-150"
                  >
                    <td className="px-4 py-2 font-medium">{item.crop}</td>
                    <td className="px-4 py-2">{item.state}</td>
                    <td className="px-4 py-2">{item.mandi}</td>
                    <td className="px-4 py-2">
                      ₹{item.minPrice.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-2">
                      ₹{item.maxPrice.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-2">{item.unit}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.source === "government"
                            ? "bg-green-100 text-green-800"
                            : item.source === "estimated"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.source === "government"
                          ? "Official"
                          : item.source === "estimated"
                          ? "Market Est."
                          : "Cached"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    {cropSearch || stateSearch || mandiSearch
                      ? "No results found for your search"
                      : "No data available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Results Summary */}
        <div className="text-white mt-2 text-sm flex justify-between items-center">
          <span>
            {filteredPrices.length} result
            {filteredPrices.length !== 1 ? "s" : ""}
            {cropSearch || stateSearch || mandiSearch ? " (filtered)" : ""}
          </span>
          {prices.length > 0 && (
            <span className="text-green-200">
              Total {prices.length} price entries available
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MandiPricesPage;
