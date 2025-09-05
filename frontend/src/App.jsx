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
import FarmMap from "./pages/FarmMap";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {
  return (
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
        <Route path="/farmmap" element={<FarmMap />} />
      </Routes>
    </Router>
  );
}

export default App;
