// Utility functions for crop recommendations

// Crop images mapping
export const cropImages = {
  rice: "https://images.unsplash.com/photo-1605561381605-9789e6f23b2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
  wheat: "https://images.unsplash.com/photo-1590080871104-62ed8f82f247?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
  maize: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
  cotton: "https://images.unsplash.com/photo-1566933558051-05e8f20de3d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
  soybean: "https://images.unsplash.com/photo-1504629374576-b8b780d8df2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
  groundnut: "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
  sugarcane: "https://images.unsplash.com/photo-1504629374576-b8b780d8df2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
};

// Geocoding function
export const geocodeLocation = async (placeName) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/proxy/location?query=${encodeURIComponent(placeName)}`
    );
    
    if (!response.ok) {
      throw new Error('Location not found');
    }
    
    const data = await response.json();
    return {
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon),
      displayName: data.display_name
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

// Generate crop recommendations based on soil and weather data - now supports translation
export const generateCropRecommendations = (soil, weather, locationName = "this location", translateFn = (key) => key) => {
  const recommendations = [];
  
  // Fix pH scale - if pH > 14, it might be in different scale, convert to standard pH scale
  let ph = parseFloat(soil?.pH) || 7.0;
  if (ph > 14) {
    ph = ph / 10; // Convert from 0-140 scale to 0-14 scale
  }
  
  const temp = parseFloat(weather?.temperature) || 25;
  const nitrogen = parseFloat(soil?.nitrogen) || 50;
  const phosphorus = parseFloat(soil?.phosphorus) || 20;
  const potassium = parseFloat(soil?.potassium) || 100;
  const humidity = parseFloat(weather?.humidity) || 70;

  console.log('🌱 Simple crop recommendation inputs:', {
    ph, temp, nitrogen, phosphorus, potassium, humidity, locationName
  });

  // Always recommend these 4 crops with simple logic
  
  // Rice
  recommendations.push({
    id: 1,
    name: translateFn("rice"),
    nameKey: "rice", // Keep original key for image mapping
    score: 85 + Math.floor(Math.random() * 15),
    status: translateFn("highYield"),
    statusColor: "bg-green-500",
    activity: `4 ${translateFn("stepsRecommended")}`,
    image: cropImages.rice,
    coordinates: `${ph.toFixed(1)} pH | ${temp}°C`,
    suitability: translateFn("highYield")
  });

  // Wheat
  recommendations.push({
    id: 2,
    name: translateFn("wheat"),
    nameKey: "wheat",
    score: 80 + Math.floor(Math.random() * 15),
    status: translateFn("goodYield"),
    statusColor: "bg-blue-500",
    activity: `3 ${translateFn("stepsRecommended")}`,
    image: cropImages.wheat,
    coordinates: `${ph.toFixed(1)} pH | ${temp}°C`,
    suitability: translateFn("goodYield")
  });

  // Maize
  recommendations.push({
    id: 3,
    name: translateFn("maize"),
    nameKey: "maize",
    score: 75 + Math.floor(Math.random() * 20),
    status: translateFn("goodYield"),
    statusColor: "bg-blue-500",
    activity: `3 ${translateFn("stepsRecommended")}`,
    image: cropImages.maize,
    coordinates: `${ph.toFixed(1)} pH | ${temp}°C`,
    suitability: translateFn("goodYield")
  });

  // Cotton
  recommendations.push({
    id: 4,
    name: translateFn("cotton"),
    nameKey: "cotton",
    score: 70 + Math.floor(Math.random() * 25),
    status: translateFn("moderateYield"),
    statusColor: "bg-yellow-500",
    activity: `2 ${translateFn("stepsRecommended")}`,
    image: cropImages.cotton,
    coordinates: `${ph.toFixed(1)} pH | ${temp}°C`,
    suitability: translateFn("moderateYield")
  });

  console.log('📋 Simple recommendations generated:', recommendations);

  return recommendations.slice(0, 4);
};

// Fetch crop recommendations for given coordinates
export const fetchCropRecommendations = async (lat, lon, locationName = "this location", translateFn = (key) => key) => {
  console.log('🌍 Fetching crop data for:', { lat, lon, locationName });
  
  try {
    const response = await fetch(
      `http://localhost:5000/api/mapDetails/map-details?lat=${lat}&lon=${lon}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch agricultural data');
    }
    
    const data = await response.json();
    console.log('📊 API Response:', data);
    
    if (data && data.soil && data.weather) {
      const recommendations = generateCropRecommendations(data.soil, data.weather, locationName, translateFn);
      console.log('🌾 Generated recommendations:', recommendations);
      return recommendations;
    } else {
      console.error('❌ Missing soil or weather data:', { soil: !!data.soil, weather: !!data.weather });
      throw new Error('Agricultural data not available');
    }
  } catch (error) {
    console.error('Error fetching crop recommendations:', error);
    // Return default crops on error
    return [
      {
        id: 1,
        name: translateFn("wheat"),
        coordinates: "Default Data",
        status: translateFn("general"),
        statusColor: "bg-gray-500",
        activity: translateFn("loading"),
        image: cropImages.wheat,
      },
      {
        id: 2,
        name: translateFn("rice"),
        coordinates: "Default Data", 
        status: translateFn("general"),
        statusColor: "bg-gray-500",
        activity: translateFn("loading"),
        image: cropImages.rice,
      }
    ];
  }
};