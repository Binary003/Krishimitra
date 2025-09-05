import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default marker icon issue in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function FarmMap({ initialPosition }) {
  const [markerPos, setMarkerPos] = useState(
    initialPosition || { lat: 28.6139, lng: 77.209 }
  );

  const DraggableMarker = () => {
    const map = useMapEvents({
      click(e) {
        setMarkerPos(e.latlng); // Update marker when map clicked
      },
    });

    return (
      <Marker
        position={markerPos}
        draggable={true}
        eventHandlers={{
          dragend: (e) => setMarkerPos(e.target.getLatLng()),
        }}
      />
    );
  };

  return (
    <MapContainer
      center={markerPos}
      zoom={13}
      style={{ height: "500px", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <DraggableMarker />
    </MapContainer>
  );
}
