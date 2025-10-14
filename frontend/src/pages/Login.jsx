import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getApiUrl } from "../config/api";

const Login = () => {
  const [form, setForm] = useState({ contact: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Inside handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(getApiUrl('/api/auth/login'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token); // Save auth token
        window.location.href = "/dashboard"; // Redirect
      } else {
        alert(data.message || "Invalid login credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2940&q=80')`,
      }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-8">
        {/* App Name + Tagline */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-green-400 drop-shadow-lg">
            KrishiMitra
          </h1>
          <p className="text-white text-sm mt-2 italic">
            किसान का साथी, खेती में प्रगति 🌾
          </p>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Welcome Back 🌱
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email or Phone */}
          <div>
            <label className="block text-white mb-1">
              Email or Phone Number
            </label>
            <input
              type="text"
              name="contact"
              value={form.contact}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white text-green-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter email or phone number"
              required
            />
            <p className="text-xs text-green-200 mt-1">
              Use your registered email or phone number to log in.
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-white mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white text-green-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors text-center block"
          >
            Login
          </button>
        </form>

        <p className="text-white text-center mt-4">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-green-300 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
