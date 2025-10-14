// Disease treatment database with specific pesticides and recommendations
const diseaseDatabase = {
  // Healthy plants
  'healthy': {
    severity: 'None',
    chemical: 'No treatment needed',
    organic: 'Continue current care practices',
    prevention: 'Maintain proper irrigation, spacing, and cleanliness'
  },

  // Apple diseases
  'apple_scab': {
    severity: 'Medium to High',
    chemical: 'Apply Captan 50WP (2g/L) or Mancozeb 75WP (2.5g/L). Spray every 7-14 days during wet weather.',
    organic: 'Baking soda spray (5g/L water) + neem oil. Remove infected leaves.',
    prevention: 'Improve air circulation, avoid overhead watering, resistant varieties'
  },

  'apple_black_rot': {
    severity: 'High', 
    chemical: 'Thiophanate-methyl 70WP (1g/L) or Propiconazole 25EC (1ml/L). Apply 2-3 times at 15-day intervals.',
    organic: 'Bordeaux mixture (1%) + copper sulfate spray. Prune infected branches.',
    prevention: 'Remove mummified fruits, proper pruning for air circulation'
  },

  'apple_cedar_apple_rust': {
    severity: 'Medium',
    chemical: 'Myclobutanil 10WP (0.5g/L) or Tebuconazole 25.9EC (0.5ml/L).',
    organic: 'Neem oil + potassium bicarbonate spray. Remove nearby juniper plants.',
    prevention: 'Plant resistant varieties, remove alternate hosts (juniper/cedar)'
  },

  // Tomato diseases  
  'tomato_bacterial_spot': {
    severity: 'High',
    chemical: 'Copper hydroxide 53.8WP (2g/L) + Streptomycin 9% + Tetracycline 1% (0.5g/L).',
    organic: 'Copper sulfate spray + Bacillus subtilis biofungicide.',
    prevention: 'Use disease-free seeds, drip irrigation, crop rotation'
  },

  'tomato_early_blight': {
    severity: 'Medium to High',
    chemical: 'Chlorothalonil 75WP (2g/L) or Azoxystrobin 23SC (1ml/L). Spray weekly.',
    organic: 'Baking soda (5g/L) + neem oil. Remove lower infected leaves.',
    prevention: 'Mulching, proper spacing, avoid overhead watering'
  },

  'tomato_late_blight': {
    severity: 'Very High',
    chemical: 'Metalaxyl-M 8% + Mancozeb 64WP (2.5g/L) or Cymoxanil 8% + Mancozeb 64WP (2g/L).',
    organic: 'Bordeaux mixture (1%) + copper fungicide. Immediate removal of infected plants.',
    prevention: 'Resistant varieties, proper ventilation, avoid wet conditions'
  },

  'tomato_leaf_mold': {
    severity: 'Medium',
    chemical: 'Difenoconazole 25EC (0.5ml/L) or Myclobutanil 10WP (1g/L).',
    organic: 'Milk spray (1:10 ratio) + neem oil. Improve ventilation.',
    prevention: 'Proper ventilation, avoid high humidity, resistant varieties'
  },

  'tomato_septoria_leaf_spot': {
    severity: 'Medium',
    chemical: 'Chlorothalonil 75WP (2g/L) or Mancozeb 75WP (2g/L).',
    organic: 'Copper sulfate + lime spray. Remove infected lower leaves.',
    prevention: 'Mulching, drip irrigation, proper plant spacing'
  },

  'tomato_spider_mites': {
    severity: 'Medium',
    chemical: 'Abamectin 1.9EC (1ml/L) or Propargite 57EC (2ml/L).',
    organic: 'Neem oil + insecticidal soap. Increase humidity around plants.',
    prevention: 'Regular watering, beneficial insects, avoid dusty conditions'
  },

  'tomato_target_spot': {
    severity: 'Medium to High',
    chemical: 'Azoxystrobin 23SC (1ml/L) + Propiconazole 25EC (1ml/L).',
    organic: 'Copper fungicide + Trichoderma biofungicide.',
    prevention: 'Crop rotation, mulching, proper plant spacing'
  },

  'tomato_yellow_leaf_curl_virus': {
    severity: 'Very High',
    chemical: 'Vector control: Imidacloprid 17.8SL (0.3ml/L) for whiteflies.',
    organic: 'Reflective mulch, yellow sticky traps, neem oil for whitefly control.',
    prevention: 'Virus-resistant varieties, whitefly control, weed management'
  },

  'tomato_mosaic_virus': {
    severity: 'High',
    chemical: 'No direct treatment. Use Imidacloprid for aphid vector control.',
    organic: 'Remove infected plants immediately. Control aphids with neem oil.',
    prevention: 'Virus-free seeds, control aphid vectors, sanitation'
  },

  // Potato diseases
  'potato_early_blight': {
    severity: 'Medium to High', 
    chemical: 'Mancozeb 75WP (2.5g/L) or Chlorothalonil 75WP (2g/L).',
    organic: 'Copper sulfate spray + proper crop rotation.',
    prevention: 'Certified seed potatoes, proper spacing, avoid overhead irrigation'
  },

  'potato_late_blight': {
    severity: 'Very High',
    chemical: 'Metalaxyl-M + Mancozeb (2.5g/L) or Cymoxanil + Mancozeb (2g/L).',
    organic: 'Bordeaux mixture (1%) + immediate removal of infected plants.',
    prevention: 'Resistant varieties, proper ventilation, avoid wet conditions'
  },

  // Corn diseases
  'corn_northern_leaf_blight': {
    severity: 'Medium to High',
    chemical: 'Propiconazole 25EC (1ml/L) or Azoxystrobin 23SC (1ml/L).',
    organic: 'Neem oil + copper fungicide spray.',
    prevention: 'Resistant hybrids, crop rotation, debris removal'
  },

  'corn_common_rust': {
    severity: 'Medium',
    chemical: 'Tebuconazole 25.9EC (0.5ml/L) or Mancozeb 75WP (2g/L).',
    organic: 'Sulfur dust or spray + proper field hygiene.',
    prevention: 'Resistant varieties, proper plant spacing, timely planting'
  },

  'corn_gray_leaf_spot': {
    severity: 'Medium to High',
    chemical: 'Azoxystrobin 23SC (1ml/L) + Propiconazole 25EC (1ml/L).',
    organic: 'Copper hydroxide spray + crop residue management.',
    prevention: 'Tillage practices, crop rotation, resistant hybrids'
  },

  // Generic fungal diseases
  'leaf_spot': {
    severity: 'Medium',
    chemical: 'Mancozeb 75WP (2g/L) or Chlorothalonil 75WP (2g/L).',
    organic: 'Copper sulfate + neem oil spray.',
    prevention: 'Proper spacing, avoid overhead watering, remove infected leaves'
  },

  'powdery_mildew': {
    severity: 'Low to Medium',
    chemical: 'Myclobutanil 10WP (1g/L) or Difenoconazole 25EC (0.5ml/L).',
    organic: 'Baking soda (5g/L) + milk spray (1:10). Sulfur dust.',
    prevention: 'Good air circulation, avoid overcrowding, resistant varieties'
  },

  'rust': {
    severity: 'Medium',
    chemical: 'Tebuconazole 25.9EC (0.5ml/L) or Mancozeb 75WP (2g/L).',
    organic: 'Sulfur spray + neem oil. Remove infected plant parts.',
    prevention: 'Resistant varieties, proper spacing, avoid overhead watering'
  },

  // Bacterial diseases
  'bacterial_wilt': {
    severity: 'Very High',
    chemical: 'Copper hydroxide 53.8WP (2g/L) + Streptomycin sulfate (0.5g/L).',
    organic: 'Remove infected plants. Soil solarization. Biocontrol agents.',
    prevention: 'Disease-free planting material, soil drainage, crop rotation'
  },

  'bacterial_leaf_spot': {
    severity: 'High',
    chemical: 'Copper sulfate + lime (Bordeaux mixture 1%) + Streptomycin (0.5g/L).',
    organic: 'Copper fungicide + Bacillus subtilis spray.',
    prevention: 'Drip irrigation, pathogen-free seeds, proper sanitation'
  }
};

// Function to get treatment recommendations
const getTreatmentRecommendations = (diseaseName) => {
  // Normalize disease name for lookup
  const normalizedName = diseaseName.toLowerCase()
    .replace(/[_\s]+/g, '_')
    .replace(/[^\w_]/g, '');
  
  // Try exact match first
  if (diseaseDatabase[normalizedName]) {
    return diseaseDatabase[normalizedName];
  }
  
  // Try partial matches for common patterns
  for (const [key, treatment] of Object.entries(diseaseDatabase)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return treatment;
    }
  }
  
  // Check for common disease types
  if (normalizedName.includes('blight')) {
    return diseaseDatabase['tomato_early_blight']; // Generic blight treatment
  } else if (normalizedName.includes('spot')) {
    return diseaseDatabase['leaf_spot'];
  } else if (normalizedName.includes('rust')) {
    return diseaseDatabase['rust'];
  } else if (normalizedName.includes('mildew')) {
    return diseaseDatabase['powdery_mildew'];
  } else if (normalizedName.includes('bacterial')) {
    return diseaseDatabase['bacterial_leaf_spot'];
  } else if (normalizedName.includes('virus')) {
    return {
      severity: 'High',
      chemical: 'No direct treatment. Control vector insects with appropriate insecticides.',
      organic: 'Remove infected plants immediately. Control vector insects naturally.',
      prevention: 'Use virus-resistant varieties, control insect vectors, practice sanitation'
    };
  }
  
  // Default treatment for unknown diseases
  return {
    severity: 'Medium',
    chemical: 'Consult local agricultural expert for specific pesticide recommendations.',
    organic: 'Apply neem oil + copper fungicide. Remove infected plant parts.',
    prevention: 'Maintain proper plant hygiene, spacing, and monitor regularly'
  };
};

module.exports = { diseaseDatabase, getTreatmentRecommendations };