import React from "react";
import { Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CultivatedArea = ({ suggestedCrops }) => {
  const navigate = useNavigate();

  const crops = suggestedCrops || [
    {
      id: 1,
      name: "Wheat",
      coordinates: "40.7128°N | 74.0060°W",
      status: "High Yield",
      statusColor: "bg-green-500",
      activity: "3 Steps Completed",
      image:
        "https://images.unsplash.com/photo-1590080871104-62ed8f82f247?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 2,
      name: "Rice",
      coordinates: "40.7128°N | 74.0060°W",
      status: "Moderate Yield",
      statusColor: "bg-yellow-500",
      activity: "2 Steps Completed",
      image:
        "https://images.unsplash.com/photo-1605561381605-9789e6f23b2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    },
    {
      id: 3,
      name: "Maize",
      coordinates: "39.7391°N | 104.9847°W",
      status: "High Yield",
      statusColor: "bg-green-500",
      activity: "4 Steps Completed",
      image:
        "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    },
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Cultivated Area</h3>
        <button className="text-white/60 hover:text-white text-sm">
          View Map
        </button>
      </div>

      <div className="space-y-3 h-full overflow-y-auto pr-1 custom-scrollbar">
        {crops.map((crop, index) => (
          <div
            key={crop.id}
            className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center space-x-3 p-3 transform opacity-0 animate-slide-in"
            style={{ animationDelay: `${index * 300}ms` }} // slower stagger
            onClick={() => navigate(`/crop-details/${crop.id}`)}
          >
            <img
              src={crop.image}
              alt={crop.name}
              className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-sm truncate">
                {crop.name}
              </h4>
              <p className="text-white/60 text-xs truncate">
                {crop.coordinates}
              </p>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span
                  className={`px-2 py-0.5 rounded-lg font-medium text-white ${crop.statusColor}`}
                >
                  {crop.status}
                </span>
                <div className="flex items-center space-x-1 text-white/60">
                  <Activity className="w-3 h-3" />
                  <span>{crop.activity}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CultivatedArea;
