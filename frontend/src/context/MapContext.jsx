import React, { createContext, useContext, useState, useEffect } from "react";

const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [mapLocation, setMapLocation] = useState({
    lat: 26.8381,
    lon: 80.9346, // fallback: Lucknow
  });
  const [zoom, setZoom] = useState(16);
  const [fieldImage, setFieldImage] = useState(null);

  // On mount, try to get user’s geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMapLocation({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn("Geolocation error:", err.message);
          // fallback remains Lucknow if user denies location
        }
      );
    }
  }, []);

  return (
    <MapContext.Provider
      value={{
        mapLocation,
        setMapLocation,
        zoom,
        setZoom,
        fieldImage,
        setFieldImage,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMapContext = () => useContext(MapContext);
