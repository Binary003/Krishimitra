import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import MapView from "./components/MapView";
import Map from "./pages/Map";
import ChatBot from "./pages/ChatBot";
import WeatherWidget from "./components/WeatherWidget";
import MandiPrices from "./components/MandiPrices";
import Services from "./pages/Services";
import Mandiprice from "./pages/Mandiprice";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Import MapContext Provider
import { MapProvider } from "./context/MapContext";

function App() {
  return (
    <MapProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/mapview" element={<MapView />} />
          <Route path="/chatbot" element={<ChatBot />} />
          <Route path="/weather" element={<WeatherWidget />} />
          <Route path="/" element={<MandiPrices />} />
          <Route path="/services" element={<Services />} />
          <Route path="/Map" element={<Map />} />
          <Route path="/mandiprice" element={<Mandiprice />} />
        </Routes>
      </Router>
    </MapProvider>
  );
}

export default App;
