import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import WeatherWidget from "../components/WeatherWidget";
import MandiPrices from "../components/MandiPrices";
import MapView from "../components/MapView";
import CultivatedArea from "../components/CultivatedArea";

const Dashboard = () => {
  return (
    <div
      className="min-h-screen lg:h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=2940&q=80')`,
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Page Content */}
      <div className="relative z-10 min-h-screen lg:h-screen flex flex-col p-3 sm:p-4 lg:p-6">
        {/* Top Header */}
        <Header />

        {/* Dashboard Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6 min-h-0">
          {/* Left Column */}
          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6 min-h-0">
            {/* Weather + Activity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 flex-none">
              <Link to="/Map" className="block">
                <WeatherWidget />
              </Link>
              <Link to="/MandiPrice" className="block">
                <MandiPrices />
              </Link>
            </div>

            {/* Map Preview */}
            <Link to="/Map" className="flex-1 min-h-0 block">
              <div className="w-full h-full">
                <MapView />
              </div>
            </Link>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 flex flex-col min-h-0">
            <Link to="/Services" className="flex-1 block min-h-0">
              <div className="w-full h-full">
                <CultivatedArea />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
