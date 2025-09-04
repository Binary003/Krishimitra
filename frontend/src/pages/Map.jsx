import React from "react";
import Header from "../components/Header";
import { Wind, Droplets, Sun, AlertTriangle } from "lucide-react";

const Map = () => {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80')`,
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen p-4 lg:p-6">
        <Header />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Large Map */}
          {/* Left Column: Large Map */}
          <div className="lg:col-span-2 flex flex-col">
            {/* Map */}
            <div className="relative h-[55vh] bg-white/5 rounded-2xl overflow-hidden shadow-lg border border-white/20">
              <img
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Farm Map"
                className="w-full h-full object-cover"
              />

              {/* Overlay on map */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            </div>

            {/* Farming Warnings & Trends */}
            <div className="mt-4 flex-1 bg-white/10 backdrop-blur-md rounded-3xl p-4 shadow-lg border border-white/20 overflow-y-auto">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span>Farming Trends & Warnings</span>
              </h2>

              <ul className="space-y-2 text-white/80 text-sm">
                <li>
                  🌱 Ideal time to sow{" "}
                  <span className="text-green-300 font-medium">Wheat</span>.
                </li>
                <li>
                  🌧️ Next 7 days:{" "}
                  <span className="text-blue-300 font-medium">
                    heavy rainfall
                  </span>
                  . Plan irrigation.
                </li>
                <li>
                  ☀️ Strong sunlight → good for{" "}
                  <span className="text-yellow-300 font-medium">
                    Rice transplantation
                  </span>
                  .
                </li>
                <li>🪲 No pest warnings. Monitor humidity for fungal risk.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Detailed Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Soil Fertility */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">
                Soil Fertility
              </h2>
              <p className="text-white/80 text-sm mb-2">Nitrogen: 75%</p>
              <p className="text-white/80 text-sm mb-2">Phosphorus: 65%</p>
              <p className="text-white/80 text-sm mb-2">Potassium: 80%</p>
            </div>

            {/* Weather Conditions */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Weather</h2>
              <div className="flex items-center space-x-2 mb-2">
                <Sun className="w-4 h-4 text-yellow-400" />
                <span className="text-white/80">Clear / Sunny, 21°C</span>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <Wind className="w-4 h-4 text-white/60" />
                <span className="text-white/80">Wind Speed: 3.5 km/h</span>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-white/80">Rainfall: 0.89 inches</span>
              </div>
            </div>

            {/* Plant Health */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">
                Plant Health
              </h2>
              <p className="text-white/80 mb-2">Health Index: 95%</p>
              <p className="text-white/80 mb-2">Pest Status: None</p>
              <p className="text-white/80 mb-2">Water Depth: 56%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
