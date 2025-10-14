import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { getApiUrl } from '../config/api';

const MandiPrices = () => {
  const { t, translateCrop } = useLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMandiPrices = async () => {
    try {
      setLoading(true);
      const response = await fetch(getApiUrl("/api/mandi/prices")); // your API endpoint
      const data = await response.json();

      if (data.success && data.data) {
        const widgetData = data.data.slice(0, 10).map((item, index) => ({
          id: `${item.mandi}-${item.crop}-${item.state}-${index}`,
          name: translateCrop(item.crop), // Translate crop name
          originalName: item.crop, // Keep original for reference
          price: `₹${item.minPrice.toLocaleString()} - ₹${item.maxPrice.toLocaleString()} / ${
            item.unit
          }`,
          status: t("marketUpdate"),
          time: item.lastUpdated
            ? new Date(item.lastUpdated).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "N/A",
          image:
            "https://images.unsplash.com/photo-1590080871104-62ed8f82f247?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80", // placeholder
          statusColor: "bg-green-500",
        }));
        setItems(widgetData);
      } else {
        setItems([]);
      }
    } catch (err) {
      console.error("Error fetching mandi prices:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMandiPrices();
    const interval = setInterval(fetchMandiPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">{t("mandiPrices")}</h3>
        <span className="text-white/60 text-sm">
          {loading ? t("updating") : `${items.length} ${t("items")}`}
        </span>
      </div>

      {/* Scrollable container with fixed height and custom scrollbar */}
      <div className="flex-1 overflow-y-auto max-h-[200px] space-y-4 mandi-scroll">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={item.id}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 transform opacity-0 animate-slide-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-start space-x-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-white text-sm leading-relaxed">
                    {item.name}: {item.price}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium text-white ${item.statusColor}`}
                    >
                      {item.status}
                    </span>
                    <div className="flex items-center space-x-1 text-white/60 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{item.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : loading ? (
          <p className="text-white/60 text-center py-4">{t("loadingPrices")}</p>
        ) : (
          <p className="text-white/60 text-center py-4">
            {t("noDataAvailable")}
          </p>
        )}
      </div>
    </div>
  );
};

export default MandiPrices;
