import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import {
  Wind,
  Droplets,
  Sun,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
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
import { getApiUrl } from "../config/api";

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

// Helper function to format soil values
const formatSoilValue = (value, unit = "") => {
  if (value === "N/A" || value === null || value === undefined) return "N/A";
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return "N/A";
  return `${numValue.toFixed(1)}${unit}`;
};

// Helper function to get health color
const getHealthColor = (healthIndex) => {
  if (healthIndex >= 80) return "text-green-400";
  if (healthIndex >= 60) return "text-yellow-400";
  return "text-red-400";
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
  const [lulcData, setLulcData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Enhanced warning generation
  const generateWarnings = (weather, soil) => {
    const newWarnings = [];

    // Weather-based warnings
    if (weather) {
      if (weather.temperature > 35) {
        newWarnings.push({
          type: "danger",
          icon: "🌡️",
          message:
            "High temperature detected! Increase irrigation frequency and consider shade nets.",
        });
      }
      if (weather.temperature < 10) {
        newWarnings.push({
          type: "warning",
          icon: "❄️",
          message:
            "Low temperature warning. Protect sensitive crops from frost damage.",
        });
      }
      if (weather.humidity > 85) {
        newWarnings.push({
          type: "warning",
          icon: "🌧️",
          message:
            "High humidity levels. Monitor crops for fungal diseases and improve ventilation.",
        });
      }
      if (weather.wind_speed > 20) {
        newWarnings.push({
          type: "warning",
          icon: "💨",
          message:
            "Strong wind conditions. Secure crops, structures, and check for wind damage.",
        });
      }
    }

    // Soil-based warnings
    if (soil) {
      // pH warnings
      if (soil.pH !== "N/A" && soil.pH !== null) {
        const pH = parseFloat(soil.pH) / 10; // SoilGrids pH format
        if (pH < 5.5) {
          newWarnings.push({
            type: "danger",
            icon: "🧪",
            message: `Soil is too acidic (pH: ${pH.toFixed(
              1
            )}). Consider lime application to raise pH.`,
          });
        } else if (pH > 7.5) {
          newWarnings.push({
            type: "warning",
            icon: "🧪",
            message: `Soil is alkaline (pH: ${pH.toFixed(
              1
            )}). May affect nutrient availability.`,
          });
        }
      }

      // Organic carbon warning
      if (soil.organic_carbon !== "N/A" && soil.organic_carbon !== null) {
        const oc = parseFloat(soil.organic_carbon);
        if (oc < 10) {
          newWarnings.push({
            type: "warning",
            icon: "🌱",
            message:
              "Low soil organic matter detected. Consider adding compost or organic fertilizers.",
          });
        }
      }

      // Soil texture warnings
      if (soil.clay !== "N/A" && parseFloat(soil.clay) > 600) {
        newWarnings.push({
          type: "info",
          icon: "🏺",
          message:
            "Heavy clay soil detected. Ensure proper drainage and avoid overwatering.",
        });
      }

      if (soil.sand !== "N/A" && parseFloat(soil.sand) > 700) {
        newWarnings.push({
          type: "info",
          icon: "🏖️",
          message:
            "Sandy soil detected. Increase watering frequency and add organic matter.",
        });
      }

      // Plant health warnings
      if (soil.health_index !== null && soil.health_index < 70) {
        newWarnings.push({
          type: "warning",
          icon: "🌿",
          message: `Plant health index is low (${soil.health_index}/100). ${
            soil.issues ? soil.issues.join(", ") : "Address soil conditions."
          }`,
        });
      }

      if (soil.pest_status === "High") {
        newWarnings.push({
          type: "danger",
          icon: "🐛",
          message:
            "High pest/disease risk due to weather conditions. Monitor crops closely and consider preventive measures.",
        });
      }
    }

    // Success message when no warnings
    if (newWarnings.length === 0) {
      newWarnings.push({
        type: "success",
        icon: "✅",
        message:
          "Excellent! All environmental conditions are optimal for healthy crop growth.",
      });
    }

    return newWarnings;
  };

  // Fetch real-time soil, weather, and LULC data
  useEffect(() => {
    if (!currentLoc.lat || !currentLoc.lon) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          getApiUrl(
            "/api/mapDetails/map-details",
            `?lat=${currentLoc.lat}&lon=${currentLoc.lon}`
          )
        );
        if (!res.ok) throw new Error("Backend fetch failed");

        const data = await res.json();

        // Weather (UNCHANGED)
        if (data.weather) {
          setWeatherData({
            temperature: data.weather.temperature ?? "N/A",
            wind_speed: data.weather.wind_speed ?? "N/A",
            description: data.weather.description ?? "N/A",
            humidity: data.weather.humidity ?? "N/A",
            pressure: data.weather.pressure ?? "N/A",
            feels_like: data.weather.feels_like ?? "N/A",
          });
        }

        // Enhanced Soil Data
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
            cec: data.soil.cec ?? "N/A",
            moisture: data.soil.moisture ?? null,
            temperature: data.soil.temperature ?? null,
            health_index: data.soil.health_index ?? null,
            pest_status: data.soil.pest_status ?? null,
            water_depth: data.soil.water_depth ?? null,
            issues: data.soil.issues || [],
          });
        }

        // Enhanced Warnings
        const newWarnings = generateWarnings(data.weather, data.soil);
        setWarnings(newWarnings);

        // LULC Data
        if (data.lulc) {
          setLulcData(data.lulc);
        }
      } catch (err) {
        console.error("Error fetching map details:", err);
        setWarnings([
          {
            type: "danger",
            icon: "⚠️",
            message:
              "Failed to fetch real-time data. Please check your connection and try again.",
          },
        ]);
      } finally {
        setLoading(false);
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
          {/* Left Column - Map and Warnings (UNCHANGED MAP FUNCTIONALITY) */}
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

            {/* Enhanced Farming Trends & Warnings */}
            <div className="mt-4 flex-1 bg-white/10 backdrop-blur-md rounded-3xl p-4 shadow-lg border border-white/20 overflow-y-auto max-h-[300px]">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span>Smart Farming Insights & Alerts</span>
              </h2>

              {loading ? (
                <div className="text-white/60">Loading insights...</div>
              ) : (
                <div className="space-y-3">
                  {warnings.map((warning, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border-l-4 ${
                        warning.type === "danger"
                          ? "bg-red-500/10 border-red-400 text-red-200"
                          : warning.type === "warning"
                          ? "bg-yellow-500/10 border-yellow-400 text-yellow-200"
                          : warning.type === "success"
                          ? "bg-green-500/10 border-green-400 text-green-200"
                          : "bg-blue-500/10 border-blue-400 text-blue-200"
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <span className="text-lg">{warning.icon}</span>
                        <span className="text-sm font-medium">
                          {warning.message}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Enhanced Data Panels */}
          <div className="lg:col-span-1 space-y-6">
            {/* Enhanced Soil Fertility */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">
                Soil Analysis
              </h2>
              {loading ? (
                <div className="text-white/60">Loading soil data...</div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/80">Nitrogen:</span>
                    <span className="text-white font-medium">
                      {formatSoilValue(soilData?.nitrogen, " ppm")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">pH Level:</span>
                    <span className="text-white font-medium">
                      {soilData?.pH !== "N/A"
                        ? (parseFloat(soilData?.pH) / 10).toFixed(1)
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Organic Carbon:</span>
                    <span className="text-white font-medium">
                      {formatSoilValue(soilData?.organic_carbon, " g/kg")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Clay Content:</span>
                    <span className="text-white font-medium">
                      {formatSoilValue(soilData?.clay, "%")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Sand Content:</span>
                    <span className="text-white font-medium">
                      {formatSoilValue(soilData?.sand, "%")}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Weather (UNCHANGED) */}
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

            {/* Enhanced Plant Health */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">
                Plant Health Monitor
              </h2>
              {loading ? (
                <div className="text-white/60">Analyzing plant health...</div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80">Health Score:</span>
                    <div className="flex items-center space-x-2">
                      {soilData?.health_index !== null ? (
                        <>
                          <span
                            className={`font-bold ${getHealthColor(
                              soilData.health_index
                            )}`}
                          >
                            {soilData.health_index}/100
                          </span>
                          {soilData.health_index >= 80 ? (
                            <TrendingUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                        </>
                      ) : (
                        <span className="text-white font-medium">
                          Calculating...
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Pest Risk:</span>
                    <span
                      className={`font-medium ${
                        soilData?.pest_status === "High"
                          ? "text-red-400"
                          : soilData?.pest_status === "Medium"
                          ? "text-yellow-400"
                          : "text-green-400"
                      }`}
                    >
                      {soilData?.pest_status || "Low"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Water Status:</span>
                    <span className="text-white font-medium">
                      {soilData?.water_depth || "Monitor closely"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Soil Moisture:</span>
                    <span className="text-white font-medium">
                      {soilData?.moisture ? `${soilData.moisture}%` : "N/A"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced LULC */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20 max-h-[300px] overflow-y-auto">
              <h2 className="text-xl font-semibold text-white mb-4">
                Land Use Analysis
              </h2>
              {loading ? (
                <div className="text-white/60">Loading land use data...</div>
              ) : lulcData ? (
                <div className="space-y-2">
                  {Object.keys(lulcData)
                    .filter(
                      (key) =>
                        key.startsWith("l") && parseFloat(lulcData[key]) > 0
                    )
                    .sort(
                      (a, b) =>
                        parseFloat(lulcData[b]) - parseFloat(lulcData[a])
                    )
                    .slice(0, 6) // Show top 6 categories
                    .map((key) => (
                      <div
                        key={key}
                        className="flex justify-between items-center"
                      >
                        <span className="text-white/80 text-sm">
                          {LULC_NAMES[key] || key}:
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-white/20 rounded-full h-2">
                            <div
                              className="bg-green-400 h-2 rounded-full"
                              style={{
                                width: `${Math.min(
                                  parseFloat(lulcData[key]),
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-white font-medium text-sm w-12">
                            {parseFloat(lulcData[key]).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-white/80">Unable to load land use data</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
