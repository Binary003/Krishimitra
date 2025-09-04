import React from "react";
import { Wind, Droplets, Sprout, Activity } from "lucide-react";

const MapView = () => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20 h-full">
      <div className="relative w-full h-full rounded-2xl overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          alt="Aerial farm view"
          className="w-full h-full object-cover"
        />

        {/* Overlay with farm statistics */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
          <div className="absolute bottom-6 left-6 right-6">
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 text-white">
              {/* Top stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center">
                  <Wind className="w-6 h-6 text-white/80 mb-1" />
                  <p className="text-xl font-bold">24</p>
                  <p className="text-sm opacity-80">kg/h</p>
                </div>
                <div className="flex flex-col items-center">
                  <Activity className="w-6 h-6 text-white/80 mb-1" />
                  <p className="text-xl font-bold">14</p>
                  <p className="text-sm opacity-80">hrs</p>
                </div>
                <div className="flex flex-col items-center">
                  <Sprout className="w-6 h-6 text-green-400 mb-1" />
                  <p className="text-lg font-semibold">Plant Health</p>
                  <p className="text-xl font-bold text-green-400">95%</p>
                </div>
                <div className="flex flex-col items-center">
                  <Droplets className="w-6 h-6 text-blue-400 mb-1" />
                  <p className="text-lg font-semibold">Water Depth</p>
                  <p className="text-xl font-bold text-blue-400">56%</p>
                </div>
              </div>

              {/* Bottom stats */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="flex flex-col items-center">
                  <Sprout className="w-6 h-6 text-yellow-400 mb-1" />
                  <p className="text-lg font-semibold">Soil</p>
                  <p className="text-xl font-bold text-yellow-400">75%</p>
                </div>
                <div className="flex flex-col items-center">
                  <Activity className="w-6 h-6 text-red-400 mb-1" />
                  <p className="text-lg font-semibold">Pest</p>
                  <p className="text-xl font-bold text-red-400">-</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
