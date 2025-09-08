import React, { useEffect, useRef } from "react";
import { Wind, Droplets, Sprout, Activity } from "lucide-react";
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

// Helper to auto-fit map bounds for field overlay
const FitBoundsHelper = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds);
  }, [bounds, map]);
  return null;
};

const RecenterWithFly = ({ lat, lon, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lon) {
      map.flyTo([lat, lon], zoom, {
        animate: true,
        duration: 1.5,
      });
    }
  }, [lat, lon, zoom, map]);
  return null;
};

const MapView = () => {
  const { mapLocation, setMapLocation, zoom, fieldImage } = useMapContext();
  const navigate = useNavigate();
  const mapRef = useRef(null);

  return (
    <div
      className="w-full rounded-2xl overflow-hidden h-[400px] md:h-[500px] lg:h-full cursor-pointer"
      onClick={() =>
        navigate(`/Map?lat=${mapLocation.lat}&lon=${mapLocation.lon}`)
      } // ✅ only click redirect
    >
      <MapContainer
        center={[mapLocation.lat, mapLocation.lon]}
        zoom={zoom}
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
        style={{ minHeight: "300px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {/* Field overlay */}
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

        {/* ✅ Smooth fly on search/location change */}
        <RecenterWithFly
          lat={mapLocation.lat}
          lon={mapLocation.lon}
          zoom={zoom}
        />

        {/* Draggable marker */}
        <Marker
          position={[mapLocation.lat, mapLocation.lon]}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = e.target.getLatLng();
              setMapLocation({ lat, lon: lng });
              // keep user on dashboard, no redirect
            },
          }}
        >
          <Popup>Selected Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapView;
