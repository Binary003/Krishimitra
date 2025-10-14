import React from "react";
import Header from "./Header";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-700">
      <Header />
      <div className="p-4">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
