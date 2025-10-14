import React, { createContext, useContext, useState, useEffect } from "react";

// Translation data
const translations = {
  en: {
    // Header
    dashboard: "Dashboard",
    map: "Map",
    chat: "Chat",
    mandiprice: "Mandiprice",
    services: "Services",
    searchLocation: "Search location...",
    searchFarmLocation: "Search farm location...",
    notifications: "Farm Notifications",
    farmerProfile: "Farmer Profile",
    name: "Name",
    number: "Number",
    location: "Location",
    close: "Close",
    logout: "Logout",
    menu: "Menu",

    // Dashboard
    welcomeBack: "Welcome back",
    farmerName: "Farmer Name",
    todayWeather: "Today's Weather",
    recommendedCrops: "Recommended Crops",
    mandiPrices: "Mandi Prices",
    currentLocation: "Current Location",
    searchedLocation: "Searched Location",

    // Crops
    highYield: "High Yield",
    goodYield: "Good Yield",
    moderateYield: "Moderate Yield",
    excellent: "Excellent",
    good: "Good",
    moderate: "Moderate",
    stepsRecommended: "Steps Recommended",
    viewMap: "View Map",

    // Mandi Prices
    items: "Items",
    updating: "Updating...",
    marketUpdate: "Market Update",
    loadingPrices: "Loading prices...",
    noDataAvailable: "No data available",

    // Weather
    humidity: "Humidity",
    windSpeed: "Wind Speed",
    pressure: "Pressure",

    // Chatbot
    askQuestion: "Ask me anything about farming...",
    send: "Send",
    typing: "Typing...",

    // General
    loading: "Loading...",
    error: "Error",
    success: "Success",
    save: "Save",
    cancel: "Cancel",
    yes: "Yes",
    no: "No",

    // Notifications
    newCropSuggestion: "New crop suggestion available",
    weatherAlert: "Weather alert for your area",
    irrigationReminder: "Irrigation reminder",

    // Crops names
    rice: "Rice",
    wheat: "Wheat",
    maize: "Maize",
    cotton: "Cotton",
    soybean: "Soybean",
    groundnut: "Groundnut",
    sugarcane: "Sugarcane",
  },

  hi: {
    // Header - हिंदी
    dashboard: "डैशबोर्ड",
    map: "नक्शा",
    chat: "चैट",
    mandiprice: "मंडी भाव",
    services: "सेवाएं",
    searchLocation: "स्थान खोजें...",
    searchFarmLocation: "खेत का स्थान खोजें...",
    notifications: "कृषि सूचनाएं",
    farmerProfile: "किसान प्रोफाइल",
    name: "नाम",
    number: "नंबर",
    location: "स्थान",
    close: "बंद करें",
    logout: "लॉग आउट",
    menu: "मेनू",

    // Dashboard - डैशबोर्ड
    welcomeBack: "वापस स्वागत है",
    farmerName: "किसान का नाम",
    todayWeather: "आज का मौसम",
    recommendedCrops: "सुझाई गई फसलें",
    mandiPrices: "मंडी भाव",
    currentLocation: "वर्तमान स्थान",
    searchedLocation: "खोजा गया स्थान",

    // Crops - फसलें
    highYield: "उच्च उत्पादन",
    goodYield: "अच्छा उत्पादन",
    moderateYield: "मध्यम उत्पादन",
    excellent: "उत्कृष्ट",
    good: "अच्छा",
    moderate: "मध्यम",
    stepsRecommended: "कदम सुझाए गए",
    viewMap: "नक्शा देखें",

    // Mandi Prices - मंडी भाव
    items: "वस्तुएं",
    updating: "अपडेट हो रहा है...",
    marketUpdate: "बाजार अपडेट",
    loadingPrices: "भाव लोड हो रहे हैं...",
    noDataAvailable: "कोई डेटा उपलब्ध नहीं",

    // Weather - मौसम
    humidity: "नमी",
    windSpeed: "हवा की गति",
    pressure: "दबाव",

    // Chatbot - चैटबॉट
    askQuestion: "खेती के बारे में कुछ भी पूछें...",
    send: "भेजें",
    typing: "टाइप कर रहे हैं...",

    // General - सामान्य
    loading: "लोड हो रहा है...",
    error: "त्रुटि",
    success: "सफलता",
    save: "सेव करें",
    cancel: "रद्द करें",
    yes: "हां",
    no: "नहीं",

    // Notifications - सूचनाएं
    newCropSuggestion: "नई फसल सुझाव उपलब्ध है",
    weatherAlert: "आपके क्षेत्र के लिए मौसम चेतावनी",
    irrigationReminder: "सिंचाई अनुस्मारक",

    // Crops names - फसलों के नाम
    rice: "धान",
    wheat: "गेहूं",
    maize: "मक्का",
    cotton: "कपास",
    soybean: "सोयाबीन",
    groundnut: "मूंगफली",
    sugarcane: "गन्ना",
  },
};

// Dynamic translation mappings for API data
const dynamicTranslations = {
  // Location names (English -> Hindi)
  locations: {
    en_to_hi: {
      Delhi: "दिल्ली",
      "New Delhi": "नई दिल्ली",
      Mumbai: "मुंबई",
      Kolkata: "कोलकाता",
      Chennai: "चेन्नई",
      Bangalore: "बेंगलुरु",
      Hyderabad: "हैदराबाद",
      Pune: "पुणे",
      Ahmedabad: "अहमदाबाद",
      Jaipur: "जयपुर",
      Lucknow: "लखनऊ",
      Kanpur: "कानपुर",
      Nagpur: "नागपुर",
      Indore: "इंदौर",
      Bhopal: "भोपाल",
      Visakhapatnam: "विशाखापत्तनम",
      Patna: "पटना",
      Vadodara: "वडोदरा",
      Ghaziabad: "गाजियाबाद",
      Ludhiana: "लुधियाना",
      Agra: "आगरा",
      Nashik: "नाशिक",
      Faridabad: "फरीदाबाद",
      Meerut: "मेरठ",
      Rajkot: "राजकोट",
      Kalyan: "कल्याण",
      Vasai: "वसई",
      Varanasi: "वाराणसी",
      Srinagar: "श्रीनगर",
      Aurangabad: "औरंगाबाद",
      Dhanbad: "धनबाद",
      Amritsar: "अमृतसर",
      Allahabad: "इलाहाबाद",
      Ranchi: "रांची",
      Gwalior: "ग्वालियर",
      Jabalpur: "जबलपुर",
      Coimbatore: "कोयंबटूर",
      Madurai: "मदुरै",
      Jodhpur: "जोधपुर",
      Kota: "कोटा",
      Chandigarh: "चंडीगढ़",
      Gurgaon: "गुरुग्राम",
      Noida: "नोएडा",
      "Greater Noida": "ग्रेटर नोएडा",
      Faridabad: "फरीदाबाद",
      // States
      Punjab: "पंजाब",
      Haryana: "हरियाणा",
      "Uttar Pradesh": "उत्तर प्रदेश",
      "Madhya Pradesh": "मध्य प्रदेश",
      Rajasthan: "राजस्थान",
      Gujarat: "गुजरात",
      Maharashtra: "महाराष्ट्र",
      Karnataka: "कर्नाटक",
      "Tamil Nadu": "तमिल नाडु",
      "Andhra Pradesh": "आंध्र प्रदेश",
      Telangana: "तेलंगाना",
      Kerala: "केरल",
      Odisha: "ओडिशा",
      "West Bengal": "पश्चिम बंगाल",
      Bihar: "बिहार",
      Jharkhand: "झारखंड",
      Assam: "असम",
      "Himachal Pradesh": "हिमाचल प्रदेश",
      Uttarakhand: "उत्तराखंड",
      "Jammu and Kashmir": "जम्मू और कश्मीर",
    },
    hi_to_en: {
      दिल्ली: "Delhi",
      "नई दिल्ली": "New Delhi",
      मुंबई: "Mumbai",
      कोलकाता: "Kolkata",
      चेन्नई: "Chennai",
      बेंगलुरु: "Bangalore",
      हैदराबाद: "Hyderabad",
      पुणे: "Pune",
      अहमदाबाद: "Ahmedabad",
      जयपुर: "Jaipur",
      लखनऊ: "Lucknow",
      कानपुर: "Kanpur",
      नागपुर: "Nagpur",
      इंदौर: "Indore",
      भोपाल: "Bhopal",
      नोएडा: "Noida",
      "ग्रेटर नोएडा": "Greater Noida",
      गुरुग्राम: "Gurgaon",
      // States
      पंजाब: "Punjab",
      हरियाणा: "Haryana",
      "उत्तर प्रदेश": "Uttar Pradesh",
      "मध्य प्रदेश": "Madhya Pradesh",
      राजस्थान: "Rajasthan",
      गुजरात: "Gujarat",
      महाराष्ट्र: "Maharashtra",
      कर्नाटक: "Karnataka",
      "तमिल नाडु": "Tamil Nadu",
      "आंध्र प्रदेश": "Andhra Pradesh",
      तेलंगाना: "Telangana",
      केरल: "Kerala",
      ओडिशा: "Odisha",
      "पश्चिम बंगाल": "West Bengal",
      बिहार: "Bihar",
      झारखंड: "Jharkhand",
      असम: "Assam",
      "हिमाचल प्रदेश": "Himachal Pradesh",
      उत्तराखंड: "Uttarakhand",
      "जम्मू और कश्मीर": "Jammu and Kashmir",
    },
  },

  // Crop names for mandi data
  crops: {
    en_to_hi: {
      Rice: "धान",
      Wheat: "गेहूं",
      Maize: "मक्का",
      Cotton: "कपास",
      Soybean: "सोयाबीन",
      Groundnut: "मूंगफली",
      Sugarcane: "गन्ना",
      Bajra: "बाजरा",
      Jowar: "ज्वार",
      Barley: "जौ",
      Gram: "चना",
      Tur: "तूर",
      Masoor: "मसूर",
      Moong: "मूंग",
      Urad: "उड़द",
      Sesame: "तिल",
      Sunflower: "सूरजमुखी",
      Mustard: "सरसों",
      Safflower: "कुसुम",
      Castor: "अरंडी",
      Onion: "प्याज",
      Potato: "आलू",
      Tomato: "टमाटर",
      Chilli: "मिर्च",
      Garlic: "लहसुन",
      Ginger: "अदरक",
      Turmeric: "हल्दी",
      Coriander: "धनिया",
    },
    hi_to_en: {
      धान: "Rice",
      गेहूं: "Wheat",
      मक्का: "Maize",
      कपास: "Cotton",
      सोयाबीन: "Soybean",
      मूंगफली: "Groundnut",
      गन्ना: "Sugarcane",
      बाजरा: "Bajra",
      ज्वार: "Jowar",
      जौ: "Barley",
      चना: "Gram",
      तूर: "Tur",
      मसूर: "Masoor",
      मूंग: "Moong",
      उड़द: "Urad",
      तिल: "Sesame",
      सूरजमुखी: "Sunflower",
      सरसों: "Mustard",
      कुसुम: "Safflower",
      अरंडी: "Castor",
      प्याज: "Onion",
      आलू: "Potato",
      टमाटर: "Tomato",
      मिर्च: "Chilli",
      लहसुन: "Garlic",
      अदरक: "Ginger",
      हल्दी: "Turmeric",
      धनिया: "Coriander",
    },
  },
};

// Helper function to translate dynamic content
const translateDynamic = (text, type, fromLang, toLang) => {
  if (!text || typeof text !== "string") return text;

  const key = `${fromLang}_to_${toLang}`;
  const translations = dynamicTranslations[type]?.[key];

  if (!translations) return text;

  // Try exact match first
  if (translations[text]) {
    return translations[text];
  }

  // Try partial matches for compound names
  let translatedText = text;
  Object.entries(translations).forEach(([original, translated]) => {
    if (text.includes(original)) {
      translatedText = translatedText.replace(
        new RegExp(original, "gi"),
        translated
      );
    }
  });

  return translatedText;
};

// Create Language Context
const LanguageContext = createContext();

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en"); // Default to English

  // Load saved language from localStorage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("krishimitra-language");
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "hi")) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  const changeLanguage = (newLanguage) => {
    if (newLanguage === "en" || newLanguage === "hi") {
      setLanguage(newLanguage);
      localStorage.setItem("krishimitra-language", newLanguage);
    }
  };

  // Get translation for a key
  const t = (key) => {
    const translation = translations[language]?.[key];
    if (!translation) {
      console.warn(
        `Translation missing for key: ${key} in language: ${language}`
      );
      return translations.en[key] || key; // Fallback to English or return key
    }
    return translation;
  };

  // Get current language info
  const getCurrentLanguage = () => ({
    code: language,
    name: language === "en" ? "English" : "हिंदी",
    nativeName: language === "en" ? "English" : "हिंदी",
  });

  // Translate location names dynamically
  const translateLocation = (locationName) => {
    if (!locationName) return locationName;

    if (language === "hi") {
      return translateDynamic(locationName, "locations", "en", "hi");
    } else {
      return translateDynamic(locationName, "locations", "hi", "en");
    }
  };

  // Translate crop names dynamically
  const translateCrop = (cropName) => {
    if (!cropName) return cropName;

    if (language === "hi") {
      return translateDynamic(cropName, "crops", "en", "hi");
    } else {
      return translateDynamic(cropName, "crops", "hi", "en");
    }
  };

  // Translate search query for API calls
  const translateSearchQuery = (query) => {
    if (!query) return query;

    // Always translate to English for API calls
    if (language === "hi") {
      return translateDynamic(query, "locations", "hi", "en");
    }
    return query;
  };

  // General dynamic translator
  const translateDynamicContent = (text, type = "locations") => {
    if (!text) return text;

    if (language === "hi") {
      return translateDynamic(text, type, "en", "hi");
    } else {
      return translateDynamic(text, type, "hi", "en");
    }
  };

  const value = {
    language,
    changeLanguage,
    t,
    getCurrentLanguage,
    isHindi: language === "hi",
    isEnglish: language === "en",
    // Dynamic translation functions
    translateLocation,
    translateCrop,
    translateSearchQuery,
    translateDynamicContent,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
