import React, { useEffect, useState } from "react";
import {
  Sun,
  Wind,
  Droplets,
  Thermometer,
  Cloud,
  Eye,
  Clock,
} from "lucide-react";
import { useMapContext } from "../context/MapContext"; // ✅ import context
import { getApiUrl } from "../config/api";

const WeatherWidget = () => {
  const { mapLocation } = useMapContext(); // ✅ get current location
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapLocation?.lat || !mapLocation?.lon) return; // prevent undefined error

    const fetchWeather = async () => {
      try {
        const res = await fetch(
          getApiUrl(
            "/api/mapDetails/map-details",
            `?lat=${mapLocation.lat}&lon=${mapLocation.lon}&distcode=2301`
          )
        );
        if (!res.ok) throw new Error("Failed to fetch weather");

        const data = await res.json();
        if (data.weather) {
          setWeather(data.weather);
        }
      } catch (err) {
        console.error("WeatherWidget fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [mapLocation]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-yellow-400/20 to-green-500/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20 h-full flex items-center justify-center">
        <p className="text-white/80">Loading weather...</p>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-gradient-to-br from-yellow-400/20 to-green-500/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20 h-full flex items-center justify-center">
        <p className="text-red-400">Weather data not available</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-yellow-400/20 to-green-500/20 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-6xl font-bold text-white">
            {weather.temperature}°C
          </h2>
          <div className="flex items-center space-x-2 mt-2">
            <Sun className="w-5 h-5 text-yellow-400" />
            <span className="text-white/80">{weather.description}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white/60 text-sm">
            {new Date().toLocaleDateString()} |{" "}
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Basic weather info */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <Wind className="w-4 h-4 text-white/60" />
          <span className="text-white/80 text-sm">
            {weather.wind_speed} km/h
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Droplets className="w-4 h-4 text-white/60" />
          <span className="text-white/80 text-sm">{weather.humidity}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <Thermometer className="w-4 h-4 text-white/60" />
          <span className="text-white/80 text-sm">{weather.feels_like}°C</span>
        </div>
      </div>

      {/* Additional info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Cloud className="w-4 h-4 text-white/60" />
          <span className="text-white/80 text-sm">
            Pressure: {weather.pressure} hPa
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Eye className="w-4 h-4 text-white/60" />
          <span className="text-white/80 text-sm">
            Visibility: {weather.visibility} m
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Droplets className="w-4 h-4 text-white/60" />
          <span className="text-white/80 text-sm">
            Dew Point: {weather.dew_point}°C
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-white/60" />
          <span className="text-white/80 text-sm">
            Sunrise:{" "}
            {new Date(weather.sunrise * 1000).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-white/60" />
          <span className="text-white/80 text-sm">
            Sunset:{" "}
            {new Date(weather.sunset * 1000).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
