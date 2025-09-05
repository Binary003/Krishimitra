import React, { useEffect, useRef } from "react";
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
      map.setView([center.lat, center.lon], map.getZoom(), {
        animate: true,
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

const Map = () => {
  const { mapLocation, setMapLocation, zoom, fieldImage } = useMapContext();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const currentLoc = mapLocation || { lat: 30.7333, lon: 76.7794 };

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
          {/* Left Column: Map + Farming Trends */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="relative h-[55vh] bg-white/5 rounded-2xl overflow-hidden shadow-lg border border-white/20 z-0">
              {/* Map like widget */}
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

              {/* Remove overlay blocking map interactions */}
              {/* Gradient moved inside z-10 but pointer-events-none ensures map works */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none z-10"></div>
            </div>

            {/* Farming Trends & Warnings */}
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

          {/* Right Column: Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">
                Soil Fertility
              </h2>
              <p className="text-white/80 text-sm mb-2">Nitrogen: 75%</p>
              <p className="text-white/80 text-sm mb-2">Phosphorus: 65%</p>
              <p className="text-white/80 text-sm mb-2">Potassium: 80%</p>
            </div>

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
