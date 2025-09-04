import React, { useState } from "react";
import Header from "../components/Header";

const MandiPricesPage = () => {
  // Sample data, will be fetched from API later
  const [prices, setPrices] = useState([
    {
      crop: "Wheat",
      mandi: "Delhi",
      minPrice: 2100,
      maxPrice: 2500,
      unit: "₹/Quintal",
    },
    {
      crop: "Rice",
      mandi: "Punjab",
      minPrice: 1800,
      maxPrice: 2200,
      unit: "₹/Quintal",
    },
    {
      crop: "Maize",
      mandi: "Maharashtra",
      minPrice: 1600,
      maxPrice: 2000,
      unit: "₹/Quintal",
    },
    {
      crop: "Sugarcane",
      mandi: "UP",
      minPrice: 3500,
      maxPrice: 4000,
      unit: "₹/Ton",
    },
    {
      crop: "Wheat",
      mandi: "UP",
      minPrice: 2150,
      maxPrice: 2600,
      unit: "₹/Quintal",
    },
    {
      crop: "Rice",
      mandi: "Delhi",
      minPrice: 1850,
      maxPrice: 2250,
      unit: "₹/Quintal",
    },
  ]);

  // Search states
  const [cropSearch, setCropSearch] = useState("");
  const [mandiSearch, setMandiSearch] = useState("");

  // Advanced filter logic
  const filteredPrices = prices.filter((item) => {
    const cropMatch = cropSearch
      ? item.crop.toLowerCase().includes(cropSearch.toLowerCase())
      : true;
    const mandiMatch = mandiSearch
      ? item.mandi.toLowerCase().includes(mandiSearch.toLowerCase())
      : true;
    return cropMatch && mandiMatch;
  });

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=2940&q=80')`,
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Page Content */}
      <div className="relative z-10 min-h-screen flex flex-col p-3 sm:p-4 lg:p-6">
        {/* Header */}
        <Header />

        {/* Page Title */}
        <h1 className="text-2xl sm:text-3xl font-semibold text-white mt-4 sm:mt-6 mb-4">
          Mandi Prices
        </h1>

        {/* Advanced Search */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search by crop..."
            value={cropSearch}
            onChange={(e) => setCropSearch(e.target.value)}
            className="w-full sm:w-1/2 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <input
            type="text"
            placeholder="Search by mandi..."
            value={mandiSearch}
            onChange={(e) => setMandiSearch(e.target.value)}
            className="w-full sm:w-1/2 p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Price Table */}
        <div className="overflow-x-auto rounded-lg bg-white/90 shadow-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-green-500 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Crop</th>
                <th className="px-4 py-2 text-left">Mandi</th>
                <th className="px-4 py-2 text-left">Min Price</th>
                <th className="px-4 py-2 text-left">Max Price</th>
                <th className="px-4 py-2 text-left">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPrices.length > 0 ? (
                filteredPrices.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-green-100 transition duration-150"
                  >
                    <td className="px-4 py-2 font-medium">{item.crop}</td>
                    <td className="px-4 py-2">{item.mandi}</td>
                    <td className="px-4 py-2">{item.minPrice}</td>
                    <td className="px-4 py-2">{item.maxPrice}</td>
                    <td className="px-4 py-2">{item.unit}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Optional: Show total results */}
        <div className="text-white mt-2 text-sm">
          {filteredPrices.length} result{filteredPrices.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
};

export default MandiPricesPage;
