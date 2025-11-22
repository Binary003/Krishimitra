import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import {
  Send,
  User,
  Bot,
  Camera,
  X,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { getApiUrl } from "../config/api";

// Add custom styles for animations
const customStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  .scrollbar-thumb-white\\/20::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
  .scrollbar-track-transparent::-webkit-scrollbar-track {
    background: transparent;
  }
`;

// Add styles to document head
if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = customStyles;
  document.head.appendChild(styleElement);
}

const ChatBot = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "🌾 **Welcome to KrishiMitra AI Assistant!**\n\n� **Location-Based Agriculture**: I use your GPS location for hyperlocal farming data - district-level precision, not just state!\n\n�📸 **Upload plant photos** to:\n• Detect plant diseases instantly\n• Get specific pesticide recommendations\n• Learn prevention strategies\n\n💬 **Ask me about**:\n• Local weather conditions\n• Crop recommendations for your area\n• Market prices\n• Soil analysis for your location\n\nJust upload a photo or type your question!",
      type: "info",
    },
  ]);
  const [input, setInput] = useState("");
  const [images, setImages] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userLocation, setUserLocation] = useState(null); // User's GPS coordinates
  const [locationPermission, setLocationPermission] = useState(null); // 'granted', 'denied', or null
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null); // Add ref for file input

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Get user's location on component mount (same as map page)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          setLocationPermission("granted");
          console.log(
            "User location obtained:",
            position.coords.latitude,
            position.coords.longitude
          );
        },
        (error) => {
          console.warn("Geolocation error:", error.message);
          setLocationPermission("denied");
          // Fallback to default location (Delhi)
          setUserLocation({ lat: 28.6139, lon: 77.209 });
        }
      );
    } else {
      console.warn("Geolocation not supported");
      setLocationPermission("denied");
      setUserLocation({ lat: 28.6139, lon: 77.209 });
    }
  }, []);

  // Proactive ML service wake-up to prevent sleeping
  useEffect(() => {
    const wakeUpMLService = async () => {
      try {
        console.log("🌅 Proactively waking up ML service...");
        await fetch(getApiUrl("/api/ml/wake-up"), {
          method: "POST",
          signal: AbortSignal.timeout(10000), // 10 second timeout
        });
        console.log("✅ ML service wake-up successful");
      } catch (error) {
        console.log(
          "⚠️ Proactive wake-up failed (this is normal):",
          error.message
        );
      }
    };

    // Wake up service immediately when component loads
    wakeUpMLService();

    // Set up periodic wake-up every 10 minutes to keep service active
    const interval = setInterval(wakeUpMLService, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const addMessage = (msg) => setMessages((prev) => [...prev, msg]);

  // Request location permission if not already granted
  const requestLocation = () => {
    return new Promise((resolve, reject) => {
      if (userLocation && locationPermission === "granted") {
        resolve(userLocation);
        return;
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            };
            setUserLocation(coords);
            setLocationPermission("granted");
            resolve(coords);
          },
          (error) => {
            console.warn("Geolocation error:", error.message);
            setLocationPermission("denied");
            // Use fallback location
            const fallback = { lat: 28.6139, lon: 77.209 };
            setUserLocation(fallback);
            reject(error);
          }
        );
      } else {
        const fallback = { lat: 28.6139, lon: 77.209 };
        setUserLocation(fallback);
        setLocationPermission("denied");
        reject(new Error("Geolocation not supported"));
      }
    });
  };

  // Geocode place name to coordinates using your backend API
  const geocodeLocation = async (placeName) => {
    try {
      const response = await fetch(
        getApiUrl(
          "/api/proxy/location",
          `?query=${encodeURIComponent(placeName)}`
        )
      );

      if (!response.ok) {
        throw new Error("Location not found");
      }

      const data = await response.json();
      return {
        lat: parseFloat(data.lat),
        lon: parseFloat(data.lon),
        displayName: data.display_name,
      };
    } catch (error) {
      console.error("Geocoding error:", error);
      throw error;
    }
  };

  // Send message handler
  const handleSend = async () => {
    if (!input.trim() && images.length === 0) return;

    const userMessage = {
      sender: "user",
      text: input,
      images: images.map((img) => URL.createObjectURL(img)),
    };
    addMessage(userMessage);

    const currentInput = input;
    setInput("");

    try {
      if (images.length > 0) {
        await handleDiseaseDetection(images);
      } else {
        await handleTextChat(currentInput);
      }
    } catch {
      addMessage({
        sender: "bot",
        text: "❌ Error occurred. Please try again.",
        type: "error",
      });
    }

    // Clear images and reset file input
    setImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDiseaseDetection = async (imageFiles) => {
    setIsAnalyzing(true);
    addMessage({
      sender: "bot",
      text: "🔍 Analyzing your plant photo...",
      type: "info",
    });

    // Enhanced ML service wake-up and retry logic
    const MAX_RETRIES = 3;
    const WAKE_UP_TIMEOUT = 90000; // 90 seconds

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const formData = new FormData();
        formData.append("image", imageFiles[0]);

        // Set timeout for each attempt
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        try {
          // First attempt or after wake-up
          let response = await fetch(getApiUrl("/api/ml/predict-disease"), {
            method: "POST",
            body: formData,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          // Handle different error scenarios
          if (response.status === 500 || response.status === 503) {
            if (attempt === 1) {
              // First failure - likely service is sleeping
              addMessage({
                sender: "bot",
                text: `⏳ ML service is waking up... This may take up to 2 minutes on free hosting. Please be patient. (Attempt ${attempt}/${MAX_RETRIES})`,
                type: "info",
              });

              // Wake up the service
              try {
                addMessage({
                  sender: "bot",
                  text: "🌅 Sending wake-up signal to ML service...",
                  type: "info",
                });

                const wakeController = new AbortController();
                const wakeTimeoutId = setTimeout(
                  () => wakeController.abort(),
                  WAKE_UP_TIMEOUT
                );

                const wakeResponse = await fetch(getApiUrl("/api/ml/wake-up"), {
                  method: "POST",
                  signal: wakeController.signal,
                });

                clearTimeout(wakeTimeoutId);

                if (wakeResponse.ok) {
                  const wakeResult = await wakeResponse.json();
                  addMessage({
                    sender: "bot",
                    text: "✅ ML service is now awake! Retrying analysis...",
                    type: "success",
                  });

                  // Wait for service to fully initialize
                  await new Promise((resolve) => setTimeout(resolve, 8000));
                  continue; // Retry the prediction
                } else {
                  throw new Error(
                    `Wake-up failed with status ${wakeResponse.status}`
                  );
                }
              } catch (wakeError) {
                console.log("Wake-up call failed:", wakeError);
                addMessage({
                  sender: "bot",
                  text: "⚠️ Wake-up signal failed, but will retry the analysis...",
                  type: "warning",
                });
                await new Promise((resolve) => setTimeout(resolve, 15000)); // Wait longer
                continue;
              }
            } else {
              // Subsequent failures
              addMessage({
                sender: "bot",
                text: `⏳ Service is still starting... Retrying in 15 seconds. (Attempt ${attempt}/${MAX_RETRIES})`,
                type: "info",
              });

              if (attempt < MAX_RETRIES) {
                await new Promise((resolve) => setTimeout(resolve, 15000)); // Wait 15s between retries
                continue;
              }
            }
          }

          // Check if we got a successful response
          if (response.ok) {
            const result = await response.json();

            if (result.success && result.prediction) {
              // Success! Process the result normally
              const { prediction, treatment, message } = result;

              // Disease detection message
              let diseaseMsg = `🦠 **Disease Detected**: ${prediction.disease}\n`;
              diseaseMsg += `📊 **Confidence**: ${
                prediction.confidence_str ||
                (prediction.confidence * 100).toFixed(1) + "%"
              }\n`;
              diseaseMsg += `⚖️ **Severity**: ${
                treatment.severity || "Medium"
              }\n\n`;

              if (prediction.is_healthy) {
                diseaseMsg += `✅ **Good News!** Your plant appears healthy. Keep up the great care!`;
              } else {
                diseaseMsg += `${message || "Treatment recommended."}`;
              }

              addMessage({
                sender: "bot",
                text: diseaseMsg,
                type: prediction.is_healthy ? "success" : "warning",
              });

              // Treatment recommendations (only for diseased plants)
              if (!prediction.is_healthy && treatment) {
                let treatmentMsg = `💊 **Treatment Recommendations**:\n\n`;

                if (
                  treatment.chemical &&
                  treatment.chemical !== "No treatment needed"
                ) {
                  treatmentMsg += `🧪 **Chemical Treatment**:\n${treatment.chemical}\n\n`;
                }

                if (treatment.organic) {
                  treatmentMsg += `🌿 **Organic Treatment**:\n${treatment.organic}\n\n`;
                }

                if (treatment.prevention) {
                  treatmentMsg += `🛡️ **Prevention**:\n${treatment.prevention}\n\n`;
                }

                treatmentMsg += `⚠️ **Important**: Always read product labels and follow local agricultural guidelines.`;

                addMessage({
                  sender: "bot",
                  text: treatmentMsg,
                  type: "info",
                });
              }

              // Show top predictions if available
              if (
                prediction.top_predictions &&
                prediction.top_predictions.length > 1
              ) {
                let topPredMsg = `📋 **Other Possible Diseases**:\n`;
                prediction.top_predictions.slice(1, 3).forEach((pred, idx) => {
                  topPredMsg += `${idx + 2}. ${pred.label}: ${(
                    pred.confidence * 100
                  ).toFixed(1)}%\n`;
                });
                addMessage({
                  sender: "bot",
                  text: topPredMsg,
                  type: "info",
                });
              }

              setIsAnalyzing(false);
              return; // Success - exit the retry loop
            } else {
              throw new Error(result.error || "No disease detected");
            }
          } else {
            throw new Error(`Server error: ${response.status}`);
          }
        } catch (timeoutError) {
          clearTimeout(timeoutId);
          if (timeoutError.name === "AbortError") {
            console.log(`Attempt ${attempt} timed out`);
            if (attempt < MAX_RETRIES) {
              addMessage({
                sender: "bot",
                text: `⏰ Request timed out. Retrying... (${attempt}/${MAX_RETRIES})`,
                type: "warning",
              });
              await new Promise((resolve) => setTimeout(resolve, 5000));
              continue;
            } else {
              throw new Error("Request timed out after multiple attempts");
            }
          }
          throw timeoutError;
        }
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);

        if (attempt === MAX_RETRIES) {
          // Final failure
          let errorMessage = "❌ Analysis failed after multiple attempts. ";

          if (error.message.includes("500") || error.message.includes("503")) {
            errorMessage +=
              "The ML service is taking longer than usual to start. This can happen with free hosting services. Please try again in 2-3 minutes.";
          } else if (
            error.message.includes("Failed to fetch") ||
            error.message.includes("timed out")
          ) {
            errorMessage +=
              "Network connection issues detected. Please check your internet connection and try again.";
          } else {
            errorMessage += `${error.message}. Please ensure you uploaded a clear photo of the affected plant parts.`;
          }

          addMessage({
            sender: "bot",
            text: errorMessage,
            type: "error",
          });
          break; // Exit the retry loop
        } else {
          // Not the final attempt, continue retrying
          await new Promise((resolve) => setTimeout(resolve, 5000));
        }
      }
    }
  };

  // Helper function to extract crop names from message
  const extractCropFromMessage = (message) => {
    const crops = [
      "rice",
      "wheat",
      "maize",
      "corn",
      "cotton",
      "sugarcane",
      "soybean",
      "groundnut",
      "mustard",
      "gram",
    ];
    const lowerMsg = message.toLowerCase();
    return crops.find((crop) => lowerMsg.includes(crop));
  };

  // Helper function to extract location from message
  const extractLocation = (msg) => {
    // More precise patterns to capture complete location names
    const patterns = [
      // "weather in Greater Noida" or "temperature in New Delhi"
      /(?:weather|temperature|climate|rain|forecast|conditions?)\s+(?:in|at|for|of)\s+([a-zA-Z\s,]+?)(?:\s|$|[.!?])/i,
      // "in Greater Noida" or "at New Delhi"
      /(?:in|at|near|from|for)\s+([a-zA-Z\s,]+?)(?:\s+(?:weather|temperature|climate|soil|crop|farming)|$|[.!?])/i,
      // "Greater Noida weather" or "New Delhi temperature"
      /([a-zA-Z\s,]+?)\s+(?:weather|temperature|climate|soil|crop|farming)/i,
      // "my location is Greater Noida"
      /(?:my location is|i am in|i live in|located in)\s+([a-zA-Z\s,]+?)(?:\s|$|[.!?])/i,
      // "crop for Greater Noida" or "soil in New Delhi"
      /(?:crop|soil|farming)\s+(?:for|in|at|of)\s+([a-zA-Z\s,]+?)(?:\s|$|[.!?])/i,
    ];

    for (const pattern of patterns) {
      const match = msg.match(pattern);
      if (match && match[1]) {
        let location = match[1].trim();

        // Clean up the location name
        location = location.replace(/\s+/g, " "); // Remove extra spaces
        location = location.replace(/,$/, ""); // Remove trailing comma

        // Filter out common non-location words and very short matches
        const excludeWords = [
          "today",
          "tomorrow",
          "now",
          "here",
          "there",
          "good",
          "bad",
          "current",
          "my",
          "the",
          "this",
          "that",
          "any",
          "some",
          "all",
        ];

        if (
          location.length > 2 &&
          !excludeWords.includes(location.toLowerCase())
        ) {
          return location;
        }
      }
    }
    return null;
  };

  // Handle weather requests
  const handleWeatherRequest = async (location) => {
    setIsAnalyzing(true);

    try {
      let coords;
      let locationName = location;

      // If user specified a location, try to geocode it first
      if (location && location.trim()) {
        addMessage({
          sender: "bot",
          text: `🌤️ Getting weather information for ${location}...`,
          type: "info",
        });

        try {
          // Try geocoding the location first
          const geocodeResult = await geocodeLocation(location);
          coords = { lat: geocodeResult.lat, lon: geocodeResult.lon };
          locationName = geocodeResult.displayName || location;
        } catch (geocodeError) {
          // If geocoding fails, try GPS as fallback
          addMessage({
            sender: "bot",
            text: `📍 "${location}" not found. Let me get weather for your current location instead...`,
            type: "warning",
          });

          try {
            coords = await requestLocation();
            locationName = "your current location";
          } catch (error) {
            coords = { lat: 28.6139, lon: 77.209 }; // Delhi fallback
            locationName = "Delhi (default)";
          }
        }
      } else {
        // No specific location provided, use GPS
        try {
          coords = await requestLocation();
          locationName = "your current location";
          addMessage({
            sender: "bot",
            text: `🌤️ Getting weather information for your current location...`,
            type: "info",
          });
        } catch (error) {
          addMessage({
            sender: "bot",
            text: `📍 Unable to access your location. Using default location...`,
            type: "warning",
          });
          coords = { lat: 28.6139, lon: 77.209 };
          locationName = "Delhi (default)";
        }
      }

      // Use the correct API endpoint (same as map page)
      const response = await fetch(
        getApiUrl(
          "/api/mapDetails/map-details",
          `?lat=${coords.lat}&lon=${coords.lon}`
        )
      );
      const data = await response.json();

      if (data && data.weather) {
        const weather = data.weather;
        const soil = data.soil;

        let weatherMsg = `🌡️ **Weather for ${locationName}**:\n\n`;
        weatherMsg += `**Temperature**: ${weather.temperature}°C\n`;
        weatherMsg += `**Humidity**: ${weather.humidity || "N/A"}%\n`;
        weatherMsg += `**Wind Speed**: ${weather.wind_speed} km/h\n`;
        weatherMsg += `**Conditions**: ${weather.description}\n`;
        weatherMsg += `**Pressure**: ${weather.pressure} hPa\n`;
        weatherMsg += `**Sunrise**: ${new Date(
          weather.sunrise
        ).toLocaleTimeString()}\n`;
        weatherMsg += `**Sunset**: ${new Date(
          weather.sunset
        ).toLocaleTimeString()}\n\n`;

        weatherMsg += `🌾 **Farming Conditions**:\n`;
        if (soil) {
          weatherMsg += `**Soil Health Index**: ${soil.health_index}/100\n`;
          weatherMsg += `**Pest Risk**: ${soil.pest_status}\n`;
          weatherMsg += `**Soil Temperature**: ${soil.temperature}°C\n`;
          weatherMsg += `**Soil Moisture**: ${soil.moisture}%\n`;
          if (soil.recommendations && soil.recommendations.length > 0) {
            weatherMsg += `\n**Recommendations**:\n`;
            soil.recommendations.slice(0, 3).forEach((rec, i) => {
              weatherMsg += `• ${rec}\n`;
            });
          } else {
            weatherMsg += `\n**General Recommendations**:\n`;
            weatherMsg += `• Good conditions for most crops\n`;
            weatherMsg += `• Monitor soil moisture levels\n`;
            weatherMsg += `• Consider weather forecast for planting\n`;
          }
        }

        addMessage({ sender: "bot", text: weatherMsg, type: "success" });
      } else {
        throw new Error("Weather data not available");
      }
    } catch (error) {
      console.error("Weather error:", error);
      addMessage({
        sender: "bot",
        text: `❌ Sorry, couldn't fetch weather data for ${location}. Please try with a major city name like Delhi, Mumbai, Bangalore, etc.`,
        type: "error",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle market price requests
  const handleMarketPrices = async (cropName) => {
    setIsAnalyzing(true);
    addMessage({
      sender: "bot",
      text: `💰 Fetching current market prices for ${cropName}...`,
      type: "info",
    });

    try {
      const response = await fetch(
        getApiUrl("/api/mandi/prices", `/${cropName}`)
      );
      const data = await response.json();

      if (data && data.success && data.data && data.data.length > 0) {
        let priceMsg = `💹 **${
          cropName.charAt(0).toUpperCase() + cropName.slice(1)
        } Market Prices**:\n\n`;

        data.data.slice(0, 5).forEach((price, index) => {
          priceMsg += `**${index + 1}. ${
            price.mandi || price.market || price.state
          } Market**\n`;
          priceMsg += `Location: ${price.state}\n`;
          priceMsg += `Min Price: ₹${price.minPrice}/quintal\n`;
          priceMsg += `Max Price: ₹${price.maxPrice}/quintal\n`;
          priceMsg += `Last Updated: ${new Date(
            price.lastUpdated
          ).toLocaleDateString()}\n\n`;
        });

        priceMsg += `📊 **Market Trends**:\n`;
        priceMsg += `• Prices updated daily\n`;
        priceMsg += `• Prices vary by quality and market\n`;
        priceMsg += `• Check with local mandis for accurate rates\n\n`;
        priceMsg += `💡 **Tip**: Best selling time is usually morning hours`;

        addMessage({ sender: "bot", text: priceMsg, type: "success" });
      } else {
        throw new Error("Price data not available");
      }
    } catch (error) {
      console.error("Price error:", error);
      addMessage({
        sender: "bot",
        text: `❌ Sorry, couldn't fetch prices for ${cropName}. Available crops: Rice, Wheat, Maize, Cotton, Sugarcane, Soybean`,
        type: "error",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle crop recommendation requests
  const handleCropRecommendation = async (location) => {
    setIsAnalyzing(true);

    try {
      let coords;
      let locationName = location;

      if (location && location.trim()) {
        // User specified a location - geocode it
        try {
          addMessage({
            sender: "bot",
            text: `🔍 Searching for ${location}...`,
            type: "info",
          });

          const geocodeResult = await geocodeLocation(location);
          coords = { lat: geocodeResult.lat, lon: geocodeResult.lon };
          locationName = geocodeResult.displayName;

          addMessage({
            sender: "bot",
            text: `📍 Found: ${locationName}. Getting crop recommendations...`,
            type: "info",
          });
        } catch (error) {
          addMessage({
            sender: "bot",
            text: `❌ Could not find location "${location}". Please check the spelling or try a nearby major city.`,
            type: "error",
          });
          return;
        }
      } else {
        // No specific location - use GPS
        try {
          coords = await requestLocation();
          locationName = "your current location";
          addMessage({
            sender: "bot",
            text: `🌾 Getting crop recommendations for your current location...`,
            type: "info",
          });
        } catch (error) {
          addMessage({
            sender: "bot",
            text: `📍 Unable to access your location. Using default location for crop recommendations...`,
            type: "warning",
          });
          coords = { lat: 28.6139, lon: 77.209 }; // Delhi fallback
          locationName = "Delhi (default)";
        }
      }

      // Use the correct API endpoint (same as map page)
      const response = await fetch(
        getApiUrl(
          "/api/mapDetails/map-details",
          `?lat=${coords.lat}&lon=${coords.lon}`
        )
      );
      const data = await response.json();

      if (data && data.soil) {
        const soil = data.soil;
        const weather = data.weather;

        let cropMsg = `🌱 **Crop Recommendations for ${locationName}**:\n\n`;
        cropMsg += `📊 **Current Conditions**:\n`;
        cropMsg += `• Soil pH: ${soil.pH || "N/A"}\n`;
        cropMsg += `• Nitrogen: ${soil.nitrogen || "N/A"} mg/kg\n`;
        cropMsg += `• Phosphorus: ${soil.phosphorus || "N/A"} mg/kg\n`;
        cropMsg += `• Potassium: ${soil.potassium || "N/A"} mg/kg\n`;
        cropMsg += `• Temperature: ${weather.temperature || "N/A"}°C\n`;
        cropMsg += `• Soil Health: ${soil.health_index || "N/A"}/100\n\n`;

        // Generate intelligent crop recommendations based on soil and weather conditions
        let recommendations = [];
        const ph = parseFloat(soil.pH) || 7.0;
        const temp = parseFloat(weather.temperature) || 25;
        const nitrogen = parseFloat(soil.nitrogen) || 0;
        const phosphorus = parseFloat(soil.phosphorus) || 0;
        const potassium = parseFloat(soil.potassium) || 0;
        const humidity = parseFloat(weather.humidity) || 60;

        // Rice - needs neutral pH, high temperature, good water availability
        if (
          ph >= 6.0 &&
          ph <= 7.5 &&
          temp >= 25 &&
          temp <= 35 &&
          humidity >= 70
        ) {
          const score =
            (ph >= 6.5 && ph <= 7.0 ? 100 : 85) + (temp >= 28 ? 10 : 0);
          recommendations.push(
            `🌾 **Rice** - ${
              score >= 95 ? "Excellent" : "Good"
            } conditions (Score: ${score}%)`
          );
        }

        // Wheat - prefers cool weather, slightly alkaline soil
        if (ph >= 6.5 && ph <= 8.0 && temp >= 15 && temp <= 25) {
          const score =
            (temp <= 22 ? 100 : 80) + (ph >= 7.0 && ph <= 7.5 ? 15 : 0);
          recommendations.push(
            `� **Wheat** - ${
              score >= 95 ? "Excellent" : "Good"
            } winter crop (Score: ${score}%)`
          );
        }

        // Maize/Corn - versatile crop, moderate requirements
        if (ph >= 6.0 && ph <= 7.8 && temp >= 20 && temp <= 30) {
          const score = 90 + (nitrogen >= 40 ? 10 : 0);
          recommendations.push(
            `� **Maize** - ${
              score >= 95 ? "Excellent" : "Good"
            } all-season crop (Score: ${score}%)`
          );
        }

        // Cotton - needs warm weather, well-drained soil
        if (
          ph >= 5.8 &&
          ph <= 8.0 &&
          temp >= 25 &&
          temp <= 35 &&
          humidity <= 70
        ) {
          const score = (temp >= 28 ? 95 : 85) + (potassium >= 120 ? 10 : 0);
          recommendations.push(
            `☁️ **Cotton** - ${
              score >= 95 ? "Excellent" : "Good"
            } cash crop (Score: ${score}%)`
          );
        }

        // Soybean - nitrogen-fixing legume
        if (ph >= 6.0 && ph <= 7.0 && temp >= 20 && temp <= 30) {
          const score = 88 + (phosphorus >= 15 ? 12 : 0);
          recommendations.push(
            `🟡 **Soybean** - ${
              score >= 95 ? "Excellent" : "Good"
            } protein crop (Score: ${score}%)`
          );
        }

        // Groundnut - needs well-drained soil, warm climate
        if (ph >= 6.0 && ph <= 7.0 && temp >= 25 && temp <= 30) {
          const score = 85 + (potassium >= 100 ? 10 : 0);
          recommendations.push(
            `🥜 **Groundnut** - ${
              score >= 90 ? "Good" : "Moderate"
            } conditions (Score: ${score}%)`
          );
        }

        // Sugarcane - needs high temperature, rich soil
        if (
          ph >= 6.0 &&
          ph <= 7.5 &&
          temp >= 26 &&
          temp <= 35 &&
          nitrogen >= 30
        ) {
          const score = (temp >= 30 ? 92 : 85) + (nitrogen >= 50 ? 8 : 0);
          recommendations.push(
            `🎋 **Sugarcane** - ${
              score >= 90 ? "Good" : "Moderate"
            } conditions (Score: ${score}%)`
          );
        }

        // Sort recommendations by suitability score (extract score from string)
        recommendations.sort((a, b) => {
          const scoreA = parseInt(a.match(/Score: (\d+)%/)?.[1] || "0");
          const scoreB = parseInt(b.match(/Score: (\d+)%/)?.[1] || "0");
          return scoreB - scoreA;
        });

        if (recommendations.length > 0) {
          cropMsg += `🎯 **Recommended Crops**:\n`;
          recommendations.slice(0, 4).forEach((rec) => {
            cropMsg += `${rec}\n`;
          });
        } else {
          cropMsg += `🎯 **General Recommendations**:\n`;
          cropMsg += `• Consider soil amendment if pH is not optimal\n`;
          cropMsg += `• Choose crops suitable for current season\n`;
          cropMsg += `• Consult local agricultural experts\n`;
        }

        cropMsg += `\n💡 **Tips**:\n`;
        cropMsg += `• Test soil regularly for better results\n`;
        cropMsg += `• Consider crop rotation for soil health\n`;
        cropMsg += `• Check market prices before planting`;

        addMessage({ sender: "bot", text: cropMsg, type: "success" });
      } else {
        throw new Error("Soil data not available");
      }
    } catch (error) {
      console.error("Crop recommendation error:", error);
      addMessage({
        sender: "bot",
        text: `❌ Sorry, couldn't fetch crop recommendations. Please enable location access or try again later.`,
        type: "error",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle soil analysis requests
  const handleSoilAnalysis = async (location) => {
    setIsAnalyzing(true);

    try {
      let coords;
      let locationName = location;

      if (location && location.trim()) {
        // User specified a location - geocode it
        try {
          addMessage({
            sender: "bot",
            text: `🔍 Searching for ${location}...`,
            type: "info",
          });

          const geocodeResult = await geocodeLocation(location);
          coords = { lat: geocodeResult.lat, lon: geocodeResult.lon };
          locationName = geocodeResult.displayName;

          addMessage({
            sender: "bot",
            text: `📍 Found: ${locationName}. Analyzing soil conditions...`,
            type: "info",
          });
        } catch (error) {
          addMessage({
            sender: "bot",
            text: `❌ Could not find location "${location}". Please check the spelling or try a nearby major city.`,
            type: "error",
          });
          return;
        }
      } else {
        // No specific location - use GPS
        try {
          coords = await requestLocation();
          locationName = "your current location";
          addMessage({
            sender: "bot",
            text: `🧪 Analyzing soil conditions for your current location...`,
            type: "info",
          });
        } catch (error) {
          addMessage({
            sender: "bot",
            text: `📍 Unable to access your location. Using default location for soil analysis...`,
            type: "warning",
          });
          coords = { lat: 28.6139, lon: 77.209 }; // Delhi fallback
          locationName = "Delhi (default)";
        }
      }

      // Use the correct API endpoint (same as map page)
      const response = await fetch(
        getApiUrl(
          "/api/mapDetails/map-details",
          `?lat=${coords.lat}&lon=${coords.lon}`
        )
      );
      const data = await response.json();

      if (data && data.soil) {
        const soil = data.soil;

        let soilMsg = `🧪 **Soil Analysis for ${locationName}**:\n\n`;
        soilMsg += `📊 **Soil Properties**:\n`;
        soilMsg += `• **pH Level**: ${soil.pH || "N/A"} ${
          soil.pH
            ? soil.pH < 6.5
              ? "(Acidic)"
              : soil.pH > 7.5
              ? "(Alkaline)"
              : "(Neutral)"
            : ""
        }\n`;
        soilMsg += `• **Nitrogen**: ${soil.nitrogen || "N/A"} mg/kg\n`;
        soilMsg += `• **Phosphorus**: ${soil.phosphorus || "N/A"} mg/kg\n`;
        soilMsg += `• **Potassium**: ${soil.potassium || "N/A"} mg/kg\n`;
        soilMsg += `• **Organic Carbon**: ${soil.organic_carbon || "N/A"}%\n`;
        soilMsg += `• **Moisture**: ${soil.moisture || "N/A"}%\n`;
        soilMsg += `• **Health Index**: ${soil.health_index || "N/A"}/100\n`;
        soilMsg += `• **Pest Status**: ${soil.pest_status || "N/A"}\n\n`;

        // Generate soil health assessment
        const ph = parseFloat(soil.pH) || 7.0;
        const nitrogen = parseFloat(soil.nitrogen) || 0;
        const phosphorus = parseFloat(soil.phosphorus) || 0;
        const potassium = parseFloat(soil.potassium) || 0;

        soilMsg += `🎯 **Soil Health Assessment**:\n`;

        if (ph >= 6.5 && ph <= 7.5) {
          soilMsg += `✅ **pH**: Optimal for most crops\n`;
        } else if (ph < 6.5) {
          soilMsg += `⚠️ **pH**: Too acidic - consider lime application\n`;
        } else {
          soilMsg += `⚠️ **pH**: Too alkaline - consider sulfur application\n`;
        }

        if (nitrogen >= 40) {
          soilMsg += `✅ **Nitrogen**: Adequate levels\n`;
        } else {
          soilMsg += `⚠️ **Nitrogen**: Low - consider nitrogen fertilizer\n`;
        }

        if (phosphorus >= 15) {
          soilMsg += `✅ **Phosphorus**: Good levels\n`;
        } else {
          soilMsg += `⚠️ **Phosphorus**: Low - consider phosphate fertilizer\n`;
        }

        if (potassium >= 120) {
          soilMsg += `✅ **Potassium**: Sufficient levels\n`;
        } else {
          soilMsg += `⚠️ **Potassium**: Low - consider potash fertilizer\n`;
        }

        soilMsg += `\n💊 **Fertilizer Recommendations**:\n`;
        soilMsg += `• **NPK Ratio**: `;
        if (nitrogen < 40 && phosphorus < 15 && potassium < 120) {
          soilMsg += `20-20-20 (Balanced)\n`;
        } else if (nitrogen < 40) {
          soilMsg += `High N (like 30-10-10)\n`;
        } else if (phosphorus < 15) {
          soilMsg += `High P (like 10-30-10)\n`;
        } else if (potassium < 120) {
          soilMsg += `High K (like 10-10-30)\n`;
        } else {
          soilMsg += `Maintenance dose (10-10-10)\n`;
        }

        soilMsg += `• **Organic Compost**: 2-3 tons per hectare\n`;
        soilMsg += `• **Application Time**: Before sowing/planting\n\n`;

        soilMsg += `🌱 **Improvement Tips**:\n`;
        soilMsg += `• Regular soil testing every 6 months\n`;
        soilMsg += `• Crop rotation to maintain soil health\n`;
        soilMsg += `• Use of bio-fertilizers and organic matter\n`;
        soilMsg += `• Proper drainage management`;

        addMessage({ sender: "bot", text: soilMsg, type: "success" });
      } else {
        throw new Error("Soil data not available");
      }
    } catch (error) {
      console.error("Soil analysis error:", error);
      addMessage({
        sender: "bot",
        text: `❌ Sorry, couldn't fetch soil analysis. Please enable location access or try again later.`,
        type: "error",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTextChat = async (message) => {
    const lowerMsg = message.toLowerCase();

    // Check for weather queries
    if (
      lowerMsg.includes("weather") ||
      lowerMsg.includes("temperature") ||
      lowerMsg.includes("rain") ||
      lowerMsg.includes("climate")
    ) {
      const location = extractLocation(message);
      if (location) {
        await handleWeatherRequest(location);
      } else {
        addMessage({
          sender: "bot",
          text: "🌤️ **Weather Information**\n\nTo provide accurate weather data for farming, please specify your location:\n\nExamples:\n• 'Weather in Punjab'\n• 'Temperature in Mumbai'\n• 'Rain forecast for Kerala'\n\n📍 I can provide weather data for all major Indian states and cities!",
          type: "info",
        });
      }
      return;
    }

    // Check for market price queries
    if (
      lowerMsg.includes("price") ||
      lowerMsg.includes("market") ||
      lowerMsg.includes("mandi") ||
      lowerMsg.includes("rate")
    ) {
      const crop = extractCropFromMessage(message);
      if (crop) {
        await handleMarketPrices(crop);
        return;
      } else {
        addMessage({
          sender: "bot",
          text: "💰 **Available Market Prices**:\n\nI can help you check current market prices for:\n• Rice\n• Wheat\n• Maize/Corn\n• Cotton\n• Sugarcane\n• Soybean\n• Groundnut\n• Mustard\n• Gram\n\nJust ask: 'What's the price of rice?' or 'Show me wheat market rates'",
          type: "info",
        });
        return;
      }
    }

    // Check for crop recommendation queries
    if (
      lowerMsg.includes("crop") &&
      (lowerMsg.includes("suggest") ||
        lowerMsg.includes("recommend") ||
        lowerMsg.includes("should") ||
        lowerMsg.includes("plant") ||
        lowerMsg.includes("grow"))
    ) {
      const location = extractLocation(message);
      if (location) {
        await handleCropRecommendation(location);
      } else {
        addMessage({
          sender: "bot",
          text: "🌱 **Crop Recommendations**\n\n📍 I'll use your current GPS location to provide accurate crop suggestions based on your exact soil and weather conditions.\n\n✅ **Benefits of location access**:\n• District-level precision (not just state-level)\n• Real-time soil analysis for your exact area\n• Hyperlocal weather conditions\n• Customized crop recommendations\n\nJust ask: 'What crops should I plant?' or 'Recommend crops for my area'\n\n� **Privacy**: Your location is only used for agricultural data and not stored.",
          type: "info",
        });
      }
      return;
    }

    // Check for soil queries
    if (
      lowerMsg.includes("soil") ||
      lowerMsg.includes("fertilizer") ||
      lowerMsg.includes("nutrient")
    ) {
      const location = extractLocation(message);
      if (location) {
        await handleSoilAnalysis(location);
      } else {
        addMessage({
          sender: "bot",
          text: "🧪 **Soil Analysis**\n\n📍 I'll use your current GPS location to analyze the exact soil conditions at your farm.\n\n✅ **What I'll provide**:\n• Detailed soil nutrient levels (N-P-K)\n• pH and organic carbon content\n• Soil texture analysis (clay, sand, silt)\n• Fertilizer recommendations\n• Soil health assessment\n\nJust ask: 'Check soil conditions' or 'Analyze my soil'\n\n🔒 **Privacy**: Your location is only used for soil data and not stored.",
          type: "info",
        });
      }
      return;
    }

    let response = "";
    let type = "info";

    if (
      lowerMsg.includes("disease") ||
      lowerMsg.includes("sick") ||
      lowerMsg.includes("problem")
    ) {
      response =
        "🦠 **Disease Detection Help**\n\nTo detect plant diseases, please:\n1. Take a clear photo of the affected plant parts\n2. Make sure the image shows leaves, stems, or fruits with visible symptoms\n3. Upload the photo using the camera button\n\nI'll analyze it and provide:\n• Disease identification\n• Treatment recommendations\n• Prevention strategies";
    } else if (lowerMsg.includes("weather")) {
      response =
        '�️ **Weather Information**\n\nI can help with weather-related farming advice! Please specify:\n• Your location\n• What crop you\'re growing\n• What weather information you need\n\nExample: "Weather for tomatoes in Delhi" or "Rain forecast for next week"';
    } else if (lowerMsg.includes("crop") || lowerMsg.includes("recommend")) {
      response =
        '🌱 **Crop Recommendations**\n\nI can suggest the best crops for your area! Please share:\n• Your location or state\n• Soil type (if known)\n• Season you want to plant\n• Farm size (optional)\n\nExample: "Best crops for Punjab in winter"';
    } else if (lowerMsg.includes("market") || lowerMsg.includes("price")) {
      response =
        '💰 **Market Prices**\n\nI can help you find current market prices! Tell me:\n• Which crop/commodity\n• Your location or nearest mandi\n\nExample: "Rice prices in Haryana" or "Wheat rates today"';
    } else if (
      lowerMsg.includes("pesticide") ||
      lowerMsg.includes("treatment")
    ) {
      response =
        "💊 **Pesticide & Treatment Info**\n\nFor specific treatment recommendations:\n1. Upload a photo of your diseased plant\n2. I'll identify the disease\n3. Get detailed treatment options:\n   • Chemical pesticides with dosages\n   • Organic alternatives\n   • Prevention measures\n\n⚠️ Always follow product labels and local guidelines!";
    } else if (
      lowerMsg.includes("hello") ||
      lowerMsg.includes("hi") ||
      lowerMsg.includes("help")
    ) {
      response =
        '👋 **Hello, Farmer!**\n\nI\'m your comprehensive farming assistant. I can help with:\n\n🌤️ **Weather**: "Weather in Punjab" or "Temperature today"\n💰 **Market Prices**: "Rice prices" or "Wheat market rates"\n� **Crop Recommendations**: "What crops should I plant?"\n🧪 **Soil Analysis**: "Check soil conditions"\n🦠 **Disease Detection**: Upload plant photos\n\nWhat would you like help with today?';
      type = "success";
    } else {
      // Default to AI chatbot for general queries
      setIsAnalyzing(true);
      addMessage({
        sender: "bot",
        text: "🤖 Analyzing your query...",
        type: "info",
      });

      try {
        const response = await fetch(getApiUrl("/api/chatbot/chat"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });

        const data = await response.json();

        if (data.success) {
          addMessage({
            sender: "bot",
            text: data.response,
            type: "success",
          });
        } else {
          throw new Error(data.error || "AI service unavailable");
        }
      } catch (error) {
        console.error("Chat error:", error);
        addMessage({
          sender: "bot",
          text: "🌾 **I'm your comprehensive farming assistant!**\n\nI can help you with:\n\n🌤️ **Weather**: Ask about weather conditions\n💰 **Market Prices**: Check current crop prices\n🌱 **Crop Recommendations**: Get suggestions for what to plant\n🧪 **Soil Analysis**: Learn about soil health\n🦠 **Disease Detection**: Upload plant images for disease diagnosis\n\nTry asking:\n• 'What's the weather in Punjab?'\n• 'Rice prices today'\n• 'What crops should I plant?'\n• 'Check soil conditions'\n\nOr upload a plant image for disease detection!",
          type: "info",
        });
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }

    addMessage({ sender: "bot", text: response, type });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (images.length + files.length > 3) {
      alert("Max 3 images allowed");
      return;
    }
    setImages([...images, ...files]);
  };

  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (idx) => {
    setImages(images.filter((_, i) => i !== idx));
    // Reset file input when removing images
    resetFileInput();
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500 mt-1" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500 mt-1" />;
      case "warning":
        return <AlertCircle className="w-5 h-5 text-yellow-500 mt-1" />;
      case "info":
        return <Bot className="w-5 h-5 text-blue-400 mt-1" />;
      default:
        return <Bot className="w-5 h-5 mt-1" />;
    }
  };

  const getMessageBg = (type) => {
    switch (type) {
      case "success":
        return "bg-green-500/20 border-green-400/30";
      case "error":
        return "bg-red-500/20 border-red-400/30";
      case "warning":
        return "bg-yellow-500/20 border-yellow-400/30";
      case "info":
        return "bg-blue-500/20 border-blue-400/30";
      default:
        return "bg-white/30";
    }
  };

  return (
    <div
      className="h-screen bg-cover bg-center bg-no-repeat relative flex flex-col"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&auto=format&fit=crop&w=2940&q=80')",
      }}
    >
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Header - Fixed at top */}
        <div className="flex-shrink-0 p-3 sm:p-4 lg:p-6 pb-0">
          <Header />
        </div>

        {/* Chat Container - Fixed height with internal scrolling */}
        <div className="flex-1 flex flex-col mx-3 sm:mx-4 lg:mx-6 mb-3 sm:mb-4 lg:mb-6 rounded-2xl backdrop-blur-lg bg-white/10 shadow-lg overflow-hidden min-h-0">
          {/* Chat Header */}
          <div className="flex-shrink-0 p-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">
                  KrishiMitra AI Assistant
                </h2>
                <p className="text-white/70 text-xs">
                  Plant Disease Detection & Treatment Recommendations
                </p>
              </div>
            </div>
          </div>

          {/* Messages Area - Scrollable */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                } animate-fadeIn`}
              >
                {msg.sender === "bot" && (
                  <div
                    className={`backdrop-blur-md text-white p-4 rounded-2xl max-w-[85%] flex gap-3 border shadow-lg ${getMessageBg(
                      msg.type
                    )}`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getMessageIcon(msg.type)}
                    </div>
                    <div className="whitespace-pre-wrap font-sans leading-relaxed text-sm flex-1">
                      {msg.text.split("**").map((part, i) =>
                        i % 2 === 1 ? (
                          <strong key={i} className="font-bold text-yellow-300">
                            {part}
                          </strong>
                        ) : (
                          part
                        )
                      )}
                    </div>
                  </div>
                )}
                {msg.sender === "user" && (
                  <div className="bg-white/90 backdrop-blur-sm text-gray-800 p-4 rounded-2xl max-w-[75%] flex flex-col gap-3 shadow-lg border border-white/20">
                    {msg.text && (
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    )}
                    {msg.images && (
                      <div className="grid grid-cols-2 gap-2">
                        {msg.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt="Uploaded"
                            className="rounded-lg border border-gray-300 object-cover h-20 sm:h-24 shadow-sm"
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex justify-end">
                      <User className="w-4 h-4 text-green-700" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isAnalyzing && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-white/30 backdrop-blur-md text-white p-4 rounded-2xl flex items-center gap-3 shadow-lg border border-white/10">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span className="text-sm">Analyzing your plant image...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Fixed at bottom of chat container */}
          <div className="flex-shrink-0 p-3 sm:p-4 border-t border-white/20 bg-white/10 backdrop-blur-lg">
            {/* Image Previews */}
            {images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-3 mb-3 border-b border-white/10">
                {images.map((img, idx) => (
                  <div key={idx} className="relative flex-shrink-0">
                    <img
                      src={URL.createObjectURL(img)}
                      alt="preview"
                      className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border-2 border-green-400"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Controls */}
            <div className="flex gap-2 items-center">
              <label className="cursor-pointer bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm sm:text-base">
                <Camera className="w-4 h-4" />
                <span>Photo</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isAnalyzing}
                />
              </label>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask or upload plant photo..."
                className="flex-1 bg-white/20 text-white placeholder-white/70 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm sm:text-base"
                disabled={isAnalyzing}
              />

              <button
                onClick={handleSend}
                disabled={isAnalyzing || (!input.trim() && images.length === 0)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
