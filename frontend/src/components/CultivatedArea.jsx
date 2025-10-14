import React, { useState, useEffect } from "react";
import { Activity, MapPin, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMapContext } from "../context/MapContext";
import { useLanguage } from "../context/LanguageContext";
import {
  fetchCropRecommendations,
  geocodeLocation,
} from "../utils/cropRecommendations";

const CultivatedArea = ({ suggestedCrops }) => {
  const navigate = useNavigate();
  const { mapLocation } = useMapContext();
  const { t, translateLocation } = useLanguage();
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentLocationName, setCurrentLocationName] =
    useState("Current Location");

  // Fetch crop recommendations based on location
  useEffect(() => {
    const loadCropRecommendations = async () => {
      console.log(
        "🚀 CultivatedArea: Loading recommendations for:",
        mapLocation
      );
      setLoading(true);
      try {
        // Use mapLocation from context (updated by Header search)
        const coords = mapLocation;
        let locationName = "your current location";

        // Try to get a readable location name if coordinates seem to be searched location
        const isDefaultLocation =
          Math.abs(coords.lat - 26.8381) < 0.01 &&
          Math.abs(coords.lon - 80.9346) < 0.01;

        if (!isDefaultLocation) {
          // This looks like a searched location, try to get readable name
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lon}`,
              {
                headers: {
                  "User-Agent": "KrishiMitraApp/1.0",
                },
              }
            );
            const reverseGeoData = await response.json();
            if (reverseGeoData.display_name) {
              const parts = reverseGeoData.display_name.split(",");
              locationName = parts.slice(0, 2).join(", "); // Get first 2 parts for concise name
              // Translate location name for display
              const translatedName = translateLocation(locationName);
              setCurrentLocationName(translatedName);
            } else {
              setCurrentLocationName(translateLocation("Searched Location"));
            }
          } catch (error) {
            setCurrentLocationName(translateLocation("Searched Location"));
          }
        } else {
          setCurrentLocationName(translateLocation("Current Location"));
        }

        // Fetch recommendations using the coordinates
        const recommendations = await fetchCropRecommendations(
          coords.lat,
          coords.lon,
          locationName,
          t
        );

        console.log("✅ CultivatedArea: Setting crops:", recommendations);
        setCrops(recommendations);
      } catch (error) {
        console.error(
          "❌ CultivatedArea: Error loading crop recommendations:",
          error
        );
        // Set default crops on error
        setCrops([
          {
            id: 1,
            name: "Wheat",
            coordinates: "Check conditions",
            status: "General Crop",
            statusColor: "bg-gray-500",
            activity: "Enable location access",
            image:
              "https://images.unsplash.com/photo-1590080871104-62ed8f82f247?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    // Load recommendations when mapLocation changes (from Header search or GPS)
    if (mapLocation?.lat && mapLocation?.lon) {
      console.log(
        "🎯 CultivatedArea: Triggering load for location:",
        mapLocation
      );
      loadCropRecommendations();
    } else {
      console.log("⚠️ CultivatedArea: No valid location:", mapLocation);
    }
  }, [mapLocation]);

  // Use provided suggestedCrops if available, otherwise use fetched crops
  const displayCrops = suggestedCrops || crops;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-white">
            {t("recommendedCrops")}
          </h3>
          <div className="flex items-center mt-1 text-white/60 text-sm">
            <MapPin className="w-3 h-3 mr-1" />
            <span>{currentLocationName}</span>
          </div>
        </div>
        <button
          className="text-white/60 hover:text-white text-sm"
          onClick={() => navigate("/map")}
        >
          {t("viewMap")}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader className="w-6 h-6 animate-spin text-white/60" />
          <span className="ml-2 text-white/60">{t("loading")}...</span>
        </div>
      ) : (
        <div className="space-y-3 h-full overflow-y-auto pr-1 custom-scrollbar">
          {displayCrops.length === 0 ? (
            <div className="text-center text-white/60 py-8">
              <p>No crop recommendations available.</p>
              <p className="text-xs mt-1">Please enable location access.</p>
            </div>
          ) : (
            displayCrops.map((crop, index) => (
              <div
                key={crop.id}
                className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center space-x-3 p-3 transform opacity-0 animate-slide-in cursor-pointer hover:bg-white/10 transition-colors"
                style={{ animationDelay: `${index * 150}ms` }}
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
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CultivatedArea;
