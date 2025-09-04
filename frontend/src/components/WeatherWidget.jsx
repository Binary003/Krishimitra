import React from "react";
import { Sun, Wind, Droplets } from "lucide-react";

const WeatherWidget = () => {
  return (
    <div className="bg-gradient-to-br from-yellow-400/20 to-green-500/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-6xl font-bold text-white">21°C</h2>
          <div className="flex items-center space-x-2 mt-2">
            <Sun className="w-5 h-5 text-yellow-400" />
            <span className="text-white/80">Clear / Sunny</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white/60 text-sm">7 May, 2023 | 8:25 PM</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Wind className="w-4 h-4 text-white/60" />
          <span className="text-white/80 text-sm">3.5 km/h</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-white/80 text-sm">76.3%</span>
        </div>
        <div className="flex items-center space-x-2">
          <Droplets className="w-4 h-4 text-white/60" />
          <span className="text-white/80 text-sm">0.89 inches</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div className="text-center">
          <p className="text-white/60 text-xs">Morning</p>
          <p className="text-white font-medium">18°C</p>
        </div>
        <div className="text-center">
          <p className="text-white/60 text-xs">Afternoon</p>
          <p className="text-white font-medium">24°C</p>
        </div>
        <div className="text-center">
          <p className="text-white/60 text-xs">Evening</p>
          <p className="text-white font-medium">21°C</p>
        </div>
        <div className="text-center">
          <p className="text-white/60 text-xs">Overnight</p>
          <p className="text-white font-medium">16°C</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
