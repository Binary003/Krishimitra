import React, { useState } from "react";
import Header from "../components/Header";
import { motion, AnimatePresence } from "framer-motion";

const cropGuides = [
  {
    id: 1,
    title: "Wheat",
    steps: [
      "Choose well-drained soil with pH 6–7.",
      "Prepare seedbed with plowing.",
      "Sow certified wheat seeds at correct depth.",
      "Apply fertilizers and irrigation timely.",
      "Harvest when grains are golden.",
    ],
  },
  {
    id: 2,
    title: "Rice",
    steps: [
      "Prepare paddy field with water.",
      "Use high-yield variety seeds.",
      "Transplant seedlings properly.",
      "Apply fertilizers on time.",
      "Harvest when panicles are yellow.",
    ],
  },
  {
    id: 3,
    title: "Maize",
    steps: [
      "Choose fertile sandy-loam soil.",
      "Sow seeds in rows 60cm apart.",
      "Fertilize with nitrogen-rich manure.",
      "Irrigate every 10–12 days.",
      "Harvest when cobs are dry.",
    ],
  },
  {
    id: 4,
    title: "Sugarcane",
    steps: [
      "Select fertile alluvial soil.",
      "Plant healthy setts at 75–90cm spacing.",
      "Provide regular irrigation.",
      "Apply nitrogen and potash fertilizers.",
      "Harvest after 10–12 months when mature.",
    ],
  },
  {
    id: 5,
    title: "Potato",
    steps: [
      "Use well-drained loamy soil.",
      "Plant disease-free tubers 5–7cm deep.",
      "Maintain proper earthing up.",
      "Irrigate regularly but avoid waterlogging.",
      "Harvest after 90–120 days when vines dry.",
    ],
  },
  {
    id: 6,
    title: "Tomato",
    steps: [
      "Choose sandy loam soil rich in organic matter.",
      "Sow seeds in nursery beds, transplant seedlings.",
      "Provide staking to plants.",
      "Fertilize with NPK and micronutrients.",
      "Harvest mature red fruits carefully.",
    ],
  },
  {
    id: 7,
    title: "Cotton",
    steps: [
      "Prefer black cotton soil.",
      "Sow certified seeds in rows with spacing.",
      "Apply fertilizers rich in nitrogen and potash.",
      "Protect against bollworm with pesticides.",
      "Harvest opened bolls manually.",
    ],
  },
];

const youtubeVideos = [
  {
    id: 1,
    title: "How to Grow Wheat",
    url: "https://www.youtube.com/embed/2mL2n6kFDvQ",
  },
  {
    id: 2,
    title: "Rice Farming Basics",
    url: "https://www.youtube.com/embed/wO3ybH3KQgc",
  },
  {
    id: 3,
    title: "Maize Cultivation Guide",
    url: "https://www.youtube.com/embed/9Zz9PME-B5Q",
  },
  {
    id: 4,
    title: "Best Fertilizers for Crops",
    url: "https://www.youtube.com/embed/4tHkKZqOe3c",
  },
];

const Services = () => {
  const [expanded, setExpanded] = useState(null);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=2940&q=80')`,
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="relative z-10 min-h-screen flex flex-col p-4 sm:p-6 lg:p-8">
        <Header />

        <div className="flex-1 flex flex-col lg:flex-row gap-6 mt-6">
          {/* Left Section - Crop Cards */}
          <div className="w-full lg:w-2/3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5 [column-fill:_balance]">
              {cropGuides.map((crop) => (
                <motion.div
                  key={crop.id}
                  layout
                  onClick={() =>
                    setExpanded(expanded === crop.id ? null : crop.id)
                  }
                  className="cursor-pointer break-inside-avoid rounded-2xl bg-white/10 backdrop-blur-md shadow-lg border border-white/20 overflow-hidden transition-all duration-300"
                  initial={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Title (always visible) */}
                  <motion.div layout className="p-3 lg:p-4">
                    <h3 className="text-base lg:text-lg font-bold text-white">
                      {crop.title}
                    </h3>
                  </motion.div>

                  {/* Steps (only when expanded) */}
                  <AnimatePresence>
                    {expanded === crop.id && (
                      <motion.div
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4 }}
                        className="p-3 lg:p-4 text-gray-100 text-sm space-y-2"
                      >
                        <ul className="list-disc list-inside space-y-1">
                          {crop.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Section - YouTube Playlist */}
          <div className="w-full lg:w-1/3 flex flex-col space-y-3">
            <h2 className="text-white text-xl font-bold">Learning Videos</h2>
            <div
              className="flex-1 overflow-y-auto pr-2"
              style={{ maxHeight: "75vh" }}
            >
              {youtubeVideos.map((video) => (
                <motion.div
                  key={video.id}
                  className="rounded-2xl bg-white/10 backdrop-blur-md shadow-lg border border-white/20 overflow-hidden mb-3"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <iframe
                    className="w-full aspect-[16/10]" // slim style for desktop
                    src={video.url}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  <p className="p-2 text-sm text-white">{video.title}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
