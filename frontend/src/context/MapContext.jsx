import React, { createContext, useContext, useState } from "react";

const MapContext = createContext();

export const MapProvider = ({ children }) => {
  const [mapLocation, setMapLocation] = useState({
    lat: 26.8381,
    lon: 80.9346,
  }); // default Lucknow
  const [zoom, setZoom] = useState(16);
  const [fieldImage, setFieldImage] = useState(null); // optional: { url, bounds }

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
