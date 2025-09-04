import React, { useState } from "react";
import { Search, Bell, User, Globe, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActivePath = (path) => location.pathname === path;

  return (
    <>
      {/* Header Bar */}
      <header className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-white/20 relative z-20">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>

          {/* Logo */}
          <Link to="/dashboard" className="text-2xl font-bold text-white">
            KrishiMitra
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-6">
            {[
              { path: "/dashboard", label: "Dashboard" },
              { path: "/Map", label: "Map" },
              { path: "/chatbot", label: "Chat" },
              { path: "/mandiprice", label: "Mandiprice" },
              { path: "/services", label: "Services" },
            ].map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className={`px-6 py-2 ${
                  isActivePath(path)
                    ? "bg-green-600/80 text-white rounded-lg font-medium backdrop-blur-sm"
                    : "text-white/80 hover:text-white transition-colors"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side buttons */}
        <div className="flex items-center space-x-4">
          {/* Search (Desktop only) */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Notifications Button */}
          <button
            className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 relative"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserPopup(false);
            }}
          >
            <Bell className="w-5 h-5 text-white" />
          </button>

          {/* User Button */}
          <div
            onClick={() => {
              setShowUserPopup(!showUserPopup);
              setShowNotifications(false);
            }}
            className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center cursor-pointer"
          >
            <User className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Notifications Popup (right side under bell) */}
        {showNotifications && (
          <div
            className="absolute right-4 top-20 w-80 
                  bg-white/40 backdrop-blur-2xl 
                  border border-white/20 
                  shadow-2xl rounded-2xl 
                  z-50 p-5"
          >
            <h3 className="text-xl font-bold text-green-700 mb-4">
              🌾 Farm Notifications
            </h3>

            <ul className="space-y-3 text-gray-900 text-base">
              <li className="p-3 rounded-xl bg-white/60 backdrop-blur-sm shadow-sm">
                🌱 New crop suggestion available
              </li>
              <li className="p-3 rounded-xl bg-white/60 backdrop-blur-sm shadow-sm">
                ☁️ Weather alert for your area
              </li>
              <li className="p-3 rounded-xl bg-white/60 backdrop-blur-sm shadow-sm">
                💧 Irrigation reminder
              </li>
            </ul>

            <button
              onClick={() => setShowNotifications(false)}
              className="mt-5 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Close
            </button>
          </div>
        )}
      </header>

      {/* Mobile Search Bar */}
      <div className="sm:hidden mt-3 px-2">
        <div className="relative flex items-center">
          {/* Search Button with visible background */}
          <button
            onClick={() => {
              const input = document.getElementById("mobileSearch");
              if (input) {
                alert(`Searching for: ${input.value}`); // replace with your search logic
              }
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 
                 w-8 h-8 flex items-center justify-center 
                 bg-green-500 rounded-full shadow-md z-10"
          >
            <Search className="w-4 h-4 text-white" />{" "}
            {/* ✅ Always visible now */}
          </button>

          {/* Input */}
          <input
            id="mobileSearch"
            type="text"
            placeholder="Search farm location..."
            className="w-full pl-12 pr-4 py-2 
                 bg-white/20 backdrop-blur-sm border border-white/30 
                 rounded-lg text-white placeholder-white/70 
                 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Profile Popup (center screen) */}
      {showUserPopup && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl p-8 w-[400px] text-center">
            <h2 className="text-2xl font-bold text-green-500 mb-4">
              👤 Farmer Profile
            </h2>

            <div className="space-y-2 text-white/90 mb-6">
              <p>
                <b>Name:</b> Farmer Name
              </p>
              <p>
                <b>Number:</b> +91 9876543210
              </p>
              <p>
                <b>Location:</b> Punjab, India
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowUserPopup(false)}
                className="bg-green-600/90 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowUserPopup(false);
                  // 🔑 add logout logic here
                  navigate("/");
                }}
                className="bg-red-600/90 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu (Slide from Left) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Background overlay */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setMobileMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Sliding Menu */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 left-0 h-full w-64 bg-white/20 backdrop-blur-xl border-r border-white/30 z-50 p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Menu</h2>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              <nav className="flex flex-col space-y-4">
                {[
                  { path: "/dashboard", label: "Dashboard" },
                  { path: "/Map", label: "Map" },
                  { path: "/chatbot", label: "Chat" },
                  { path: "/mandiprice", label: "Mandiprice" },
                  { path: "/services", label: "Services" },
                ].map(({ path, label }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileMenuOpen(false)} // Auto-close on click
                    className={`px-4 py-2 rounded-lg ${
                      isActivePath(path)
                        ? "bg-green-600 text-white font-medium"
                        : "text-white/90 hover:bg-green-500/70"
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
