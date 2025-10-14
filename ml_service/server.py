# server.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras.preprocessing import image
import numpy as np
import os
import io
import sys

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])  # allow only your frontend origin

# === CONFIG ===
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_FILENAME = "mobilenet_plant_disease.h5"
CLASS_INDICES_FILENAME = "class_indices.npy"
TARGET_SIZE = (224, 224)   # input size
TOP_K = 3
# ==============

model_path = os.path.join(MODELS_DIR, MODEL_FILENAME)
class_indices_path = os.path.join(MODELS_DIR, CLASS_INDICES_FILENAME)

def clean_label(s: str) -> str:
    return s.replace('___', ' - ').replace('_', ' ').title()

RAW_CLASS_NAMES = [
    "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
    "Blueberry___healthy", "Cherry_(including_sour)___Powdery_mildew", "Cherry_(including_sour)___healthy",
    "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "Corn_(maize)___Common_rust_",
    "Corn_(maize)___Northern_Leaf_Blight", "Corn_(maize)___healthy", "Grape___Black_rot",
    "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
    "Orange___Haunglongbing_(Citrus_greening)", "Peach___Bacterial_spot", "Peach___healthy",
    "Pepper,_bell___Bacterial_spot", "Pepper,_bell___healthy", "Potato___Early_blight",
    "Potato___Late_blight", "Potato___healthy", "Raspberry___healthy", "Soybean___healthy",
    "Squash___Powdery_mildew", "Strawberry___Leaf_scorch", "Strawberry___healthy", "Tomato___Bacterial_spot",
    "Tomato___Early_blight", "Tomato___Late_blight", "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites Two-spotted_spider_mite", "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato___Tomato_mosaic_virus", "Tomato___healthy"
]

# === Load class names ===
if os.path.exists(class_indices_path):
    try:
        ci = np.load(class_indices_path, allow_pickle=True).item()
        max_idx = max(ci.values())
        class_names = [None] * (max_idx + 1)
        for name, idx in ci.items():
            class_names[idx] = clean_label(name)
        print(f"Loaded class_indices.npy with {len(class_names)} classes.")
    except Exception as e:
        print("Failed to load class_indices.npy, using built-in:", e, file=sys.stderr)
        class_names = [clean_label(n) for n in RAW_CLASS_NAMES]
else:
    class_names = [clean_label(n) for n in RAW_CLASS_NAMES]
    print("Using built-in class list (38 classes).")

# === Custom layer ===
class CustomScaleLayer(keras.layers.Layer):
    def __init__(self, scale=1.0, **kwargs):
        super().__init__(**kwargs)
        self.scale = float(scale)

    def call(self, inputs, **kwargs):
        if isinstance(inputs, (list, tuple)):
            if len(inputs) == 1:
                x = inputs[0]
            else:
                x = tf.add_n(inputs) / float(len(inputs))
        else:
            x = inputs
        return x * self.scale

    def get_config(self):
        config = super().get_config()
        config.update({"scale": self.scale})
        return config

# === Load model ===
def try_load_model(path):
    try:
        # Try loading with different approaches
        print(f"Attempting to load model from: {path}")
        
        # First try with safe_mode=False and custom objects
        try:
            model = keras.models.load_model(
                path,
                compile=False,
                custom_objects={"CustomScaleLayer": CustomScaleLayer},
                safe_mode=False
            )
            print("✅ Model loaded successfully with safe_mode=False and custom objects.")
            return model
        except Exception as e1:
            print(f"First attempt failed: {e1}")
            
            # Try without custom objects
            try:
                model = keras.models.load_model(
                    path,
                    compile=False,
                    safe_mode=False
                )
                print("✅ Model loaded successfully without custom objects.")
                return model
            except Exception as e2:
                print(f"Second attempt failed: {e2}")
                
                # Try with TensorFlow's direct loading
                try:
                    model = tf.keras.models.load_model(path, compile=False)
                    print("✅ Model loaded successfully with TensorFlow direct loading.")
                    return model
                except Exception as e3:
                    print(f"Third attempt failed: {e3}")
                    raise e3
    except Exception as e:
        print("❌ All model loading attempts failed:", e, file=sys.stderr)
        raise

if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model file not found: {model_path}")
model = try_load_model(model_path)

# === Routes ===
@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"status": "ok"})

@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "classes_loaded": len(class_names),
        "service": "Plant Disease Detection ML Service"
    })

@app.route("/predict", methods=["POST"])
def predict_disease():
    # Check for both 'file' and 'image' keys to handle different clients
    file = None
    if 'file' in request.files:
        file = request.files['file']
    elif 'image' in request.files:
        file = request.files['image']
    
    if not file:
        return jsonify({'error': 'No file uploaded'}), 400
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        # Load and preprocess the image
        img = image.load_img(io.BytesIO(file.read()), target_size=TARGET_SIZE, color_mode='rgb')
        img_array = image.img_to_array(img) / 255.0  # Normalize to [0,1]
        img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
        
        print(f"Image preprocessed: shape={img_array.shape}, min={img_array.min():.3f}, max={img_array.max():.3f}")

        preds = model.predict(img_array)
        probs = np.array(preds[0], dtype=float)

        if (not np.isclose(probs.sum(), 1.0, atol=1e-3)) or np.min(probs) < 0:
            probs = tf.nn.softmax(probs).numpy()

        top_idx = int(np.argmax(probs))
        confidence = float(probs[top_idx])
        predicted_label = class_names[top_idx] if top_idx < len(class_names) else str(top_idx)

        topk_idx = probs.argsort()[-TOP_K:][::-1]
        topk = []
        for i in topk_idx:
            label = class_names[int(i)] if int(i) < len(class_names) else str(int(i))
            topk.append({"label": label, "confidence": float(probs[int(i)])})

        return jsonify({
            "disease": predicted_label,
            "class": predicted_label,  # Backend compatibility
            "confidence": confidence,
            "probability": confidence,  # Backend compatibility
            "confidence_str": f"{confidence:.2%}",
            "top3": topk,
            "success": True
        })

    except Exception as e:
        print("Prediction error:", e, file=sys.stderr)
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
