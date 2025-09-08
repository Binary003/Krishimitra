import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import { Wind, Droplets, Sun, AlertTriangle } from "lucide-react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ImageOverlay,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useMapContext } from "../context/MapContext";
import { useNavigate } from "react-router-dom";

// Fix default Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      // Instead of setView, use flyTo for smooth transition
      map.flyTo([center.lat, center.lon], map.getZoom(), {
        duration: 1.5, // duration in seconds
        easeLinearity: 0.25, // optional, smoothness
      });
    }
  }, [center, map]);
  return null;
};

// Fit map bounds helper
const FitBoundsHelper = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds);
  }, [bounds, map]);
  return null;
};

// LULC Code Mapping (Bhuvan 50k)
const LULC_NAMES = {
  l01: "Built-up / Urban",
  l02: "Water bodies",
  l03: "Rock / barren land",
  l04: "Scrub / shrub",
  l05: "Grassland",
  l06: "Agriculture - irrigated",
  l07: "Agriculture - rainfed",
  l08: "Forest - dense",
  l09: "Forest - open",
  l10: "Plantation",
  l11: "Wetlands",
  l12: "Snow / Ice",
  l13: "Mining / quarry",
  l14: "Sand / coastal",
  l15: "Salt pans",
  l16: "Mangroves",
  l17: "Orchards",
  l18: "Barren rocky area",
  l19: "Other",
  l20: "Reserved / Protected",
  l21: "Grassland degraded",
  l22: "Forest degraded",
  l23: "Water logged / marsh",
  l24: "Miscellaneous",
};

const Map = () => {
  const { mapLocation, setMapLocation, zoom, fieldImage } = useMapContext();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const currentLoc = mapLocation || { lat: 30.7333, lon: 76.7794 };

  // Real-time data states
  const [soilData, setSoilData] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [lulcData, setLulcData] = useState(null); // LULC state

  // Fetch real-time soil, weather, and LULC data
  useEffect(() => {
    if (!currentLoc.lat || !currentLoc.lon) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/mapDetails/map-details?lat=${currentLoc.lat}&lon=${currentLoc.lon}&distcode=2301`
        );
        if (!res.ok) throw new Error("Backend fetch failed");

        const data = await res.json();

        // Weather
        if (data.weather) {
          setWeatherData({
            temperature: data.weather.temperature ?? "N/A",
            wind_speed: data.weather.wind_speed ?? "N/A",
            description: data.weather.description ?? "N/A",
            humidity: data.weather.humidity ?? "N/A",
          });
        }

        // Soil
        if (data.soil) {
          setSoilData({
            nitrogen: data.soil.nitrogen ?? "N/A",
            phosphorus: data.soil.phosphorus ?? "N/A",
            potassium: data.soil.potassium ?? "N/A",
            pH: data.soil.pH ?? "N/A",
            organic_carbon: data.soil.organic_carbon ?? "N/A",
            clay: data.soil.clay ?? "N/A",
            sand: data.soil.sand ?? "N/A",
            silt: data.soil.silt ?? "N/A",
            moisture: data.soil.moisture ?? null,
            temperature: data.soil.temperature ?? null,
            health_index: data.soil.health_index ?? null,
            pest_status: data.soil.pest_status ?? null,
            water_depth: data.soil.water_depth ?? null,
          });
        }

        // Warnings
        const newWarnings = [];
        if (data.weather) {
          if (data.weather.temperature > 35)
            newWarnings.push("⚠️ High temperature, irrigate fields carefully.");
          if (data.weather.humidity > 85)
            newWarnings.push("🌧️ High humidity, monitor for fungal diseases.");
          if (data.weather.wind_speed > 20)
            newWarnings.push("💨 Strong winds, secure crops and structures.");
        }
        if (data.soil) {
          if (data.soil.moisture < 30)
            newWarnings.push("💧 Low soil moisture, consider watering.");
          if (data.soil.pH < 5.5 || data.soil.pH > 7.5)
            newWarnings.push(
              "🌱 Soil pH is outside optimal range for most crops."
            );
        }
        setWarnings(newWarnings);

        // LULC
        if (data.lulc) {
          setLulcData(data.lulc);
        }
      } catch (err) {
        console.error("Error fetching map details:", err);
      }
    };

    fetchData();
  }, [currentLoc.lat, currentLoc.lon]);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2940&q=80')`,
      }}
    >
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative z-10 min-h-screen p-4 lg:p-6">
        <Header />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="relative h-[55vh] bg-white/5 rounded-2xl overflow-hidden shadow-lg border border-white/20 z-0">
              <MapContainer
                center={[currentLoc.lat, currentLoc.lon]}
                zoom={zoom || 13}
                scrollWheelZoom={true}
                touchZoom={true}
                dragging={true}
                doubleClickZoom={true}
                whenCreated={(map) => {
                  map.scrollWheelZoom.enable();
                  map.dragging.enable();
                }}
                ref={mapRef}
                className="w-full h-full"
                style={{ minHeight: "300px", zIndex: 0 }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />

                <MapUpdater center={currentLoc} />

                {fieldImage && (
                  <>
                    <ImageOverlay
                      url={fieldImage.url}
                      bounds={fieldImage.bounds}
                      opacity={0.6}
                    />
                    <FitBoundsHelper bounds={fieldImage.bounds} />
                  </>
                )}

                <Marker
                  position={[currentLoc.lat, currentLoc.lon]}
                  draggable={true}
                  eventHandlers={{
                    dragend: (e) => {
                      const { lat, lng } = e.target.getLatLng();
                      setMapLocation({ lat, lon: lng });
                      navigate(`/Map?lat=${lat}&lon=${lng}`);
                    },
                  }}
                >
                  <Popup>Selected Location</Popup>
                </Marker>
              </MapContainer>

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none z-10"></div>
            </div>

            {/* Farming Trends & Warnings */}
            <div className="mt-4 flex-1 bg-white/10 backdrop-blur-md rounded-3xl p-4 shadow-lg border border-white/20 overflow-y-auto">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span>Farming Trends & Warnings</span>
              </h2>

              <ul className="space-y-2 text-white/80 text-sm">
                {warnings.length > 0 ? (
                  warnings.map((warning, idx) => <li key={idx}>{warning}</li>)
                ) : (
                  <li>🌱 No immediate warnings. Conditions are normal.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Soil Fertility */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">
                Soil Fertility
              </h2>
              <p className="text-white/80 text-sm mb-2">
                Nitrogen: {soilData ? soilData.nitrogen : "Loading..."}
              </p>
              <p className="text-white/80 text-sm mb-2">
                Phosphorus: {soilData ? soilData.phosphorus : "Loading..."}
              </p>
              <p className="text-white/80 text-sm mb-2">
                Potassium: {soilData ? soilData.potassium : "Loading..."}
              </p>
            </div>

            {/* Weather */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Weather</h2>
              <div className="flex items-center space-x-2 mb-2">
                <Sun className="w-4 h-4 text-yellow-400" />
                <span className="text-white/80">
                  {weatherData
                    ? `${weatherData.description}, ${weatherData.temperature}°C`
                    : "Loading..."}
                </span>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <Wind className="w-4 h-4 text-white/60" />
                <span className="text-white/80">
                  {weatherData
                    ? `Wind Speed: ${weatherData.wind_speed} km/h`
                    : "Loading..."}
                </span>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <Droplets className="w-4 h-4 text-blue-400" />
                <span className="text-white/80">
                  {weatherData
                    ? `Humidity: ${weatherData.humidity}%`
                    : "Loading..."}
                </span>
              </div>
            </div>

            {/* Plant Health */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">
                Plant Health
              </h2>
              <p className="text-white/80 mb-2">
                Health Index: {soilData ? soilData.health_index : "Loading..."}
              </p>
              <p className="text-white/80 mb-2">
                Pest Status: {soilData ? soilData.pest_status : "Loading..."}
              </p>
              <p className="text-white/80 mb-2">
                Water Depth: {soilData ? soilData.water_depth : "Loading..."}
              </p>
            </div>

            {/* Bhuvan LULC */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20 max-h-[300px] overflow-y-auto">
              <h2 className="text-xl font-semibold text-white mb-4">
                LULC 50k Statistics
              </h2>
              {lulcData ? (
                <ul className="text-white/80 text-sm space-y-1">
                  {Object.keys(lulcData)
                    .filter((key) => key.startsWith("l"))
                    .map((key) => (
                      <li key={key}>
                        {LULC_NAMES[key] || key}:{" "}
                        {parseFloat(lulcData[key]).toFixed(2)}
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-white/80">Loading LULC data...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
