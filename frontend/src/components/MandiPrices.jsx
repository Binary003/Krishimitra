import React from "react";
import { Clock } from "lucide-react";

const MandiPrices = ({ locationItems }) => {
  const items = locationItems || [
    {
      id: 1,
      name: "Wheat",
      price: "₹2,100 / quintal",
      status: "High Demand",
      time: "Updated 10:00 AM",
      image:
        "https://images.unsplash.com/photo-1590080871104-62ed8f82f247?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      statusColor: "bg-green-500",
    },
    {
      id: 2,
      name: "Rice",
      price: "₹2,500 / quintal",
      status: "Moderate Demand",
      time: "Updated 10:15 AM",
      image:
        "https://images.unsplash.com/photo-1605561381605-9789e6f23b2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      statusColor: "bg-yellow-500",
    },
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/20 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Mandi Prices</h3>
        <span className="text-white/60 text-sm">{items.length} Items</span>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 transform opacity-0 animate-slide-in"
            style={{ animationDelay: `${index * 400}ms` }} // staggered delay
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
                <div className="flex items-center justify-between mt-3">
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
        ))}
      </div>
    </div>
  );
};

export default MandiPrices;
