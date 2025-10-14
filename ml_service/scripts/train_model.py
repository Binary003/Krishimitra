import os
import json
import random
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras.applications import EfficientNetB0

# Set random seeds for reproducibility
SEED = 1337
random.seed(SEED)
np.random.seed(SEED)
tf.random.set_seed(SEED)

# Configuration
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "PlantVillage")
assert os.path.isdir(DATA_DIR), f"Data directory not found: {DATA_DIR}"

IMG_SIZE = (160, 160)  # Reduced image size to save memory
BATCH_SIZE = 32   # Reduced batch size to prevent memory issues
EPOCHS = 5       # Keep reduced epochs
LEARNING_RATE = 5e-3  # Keep increased learning rate
AUTOTUNE = tf.data.AUTOTUNE

# Output directories
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
os.makedirs(OUTPUT_DIR, exist_ok=True)
MODEL_PATH = os.path.join(OUTPUT_DIR, "plant_disease_model.keras")
LABELMAP_PATH = os.path.join(OUTPUT_DIR, "label_map.json")

def create_data_augmentation():
    """Create data augmentation pipeline"""
    return keras.Sequential([
        layers.RandomRotation(0.2),
        layers.RandomFlip("horizontal"),
        layers.RandomZoom(0.2),
        layers.RandomBrightness(0.2),
        layers.RandomContrast(0.2),
    ])

def build_model(num_classes):
    """Build a custom CNN model for grayscale images"""
    # Create input layer for grayscale images
    inputs = keras.Input(shape=(*IMG_SIZE, 1))
    
    # Add data augmentation and preprocessing
    x = create_data_augmentation()(inputs)
    x = layers.Rescaling(1./255)(x)
    
    # CNN architecture
    x = layers.Conv2D(32, 3, activation='relu', padding='same')(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D()(x)
    
    x = layers.Conv2D(64, 3, activation='relu', padding='same')(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D()(x)
    
    x = layers.Conv2D(128, 3, activation='relu', padding='same')(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D()(x)
    
    x = layers.Conv2D(256, 3, activation='relu', padding='same')(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D()(x)
    
    # Classification head
    x = layers.Flatten()(x)
    x = layers.Dense(512, activation='relu')(x)
    x = layers.Dropout(0.5)(x)
    outputs = layers.Dense(num_classes, activation='softmax')(x)
    
    # Create the model
    model = keras.Model(inputs=inputs, outputs=outputs)
    base_model = None  # We don't have a base model anymore
    
    return model, base_model
    
    # Add classification head
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.2)(x)
    x = layers.Dense(256, activation='relu')(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(num_classes, activation='softmax')(x)
    
    # Create the model
    model = keras.Model(inputs=inputs, outputs=outputs)
    
    return model, base_model

def prepare_dataset():
    """Prepare and load the dataset"""
    # Load training dataset
    train_ds = tf.keras.preprocessing.image_dataset_from_directory(
        DATA_DIR,
        validation_split=0.2,
        subset="training",
        seed=SEED,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode='categorical',
        color_mode='grayscale'  # Load as grayscale
    )

    # Load validation dataset
    val_ds = tf.keras.preprocessing.image_dataset_from_directory(
        DATA_DIR,
        validation_split=0.2,
        subset="validation",
        seed=SEED,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        label_mode='categorical',
        color_mode='grayscale'  # Load as grayscale
    )

    # Get class names before prefetching
    class_names = train_ds.class_names
    
    # Save class names mapping
    with open(LABELMAP_PATH, 'w') as f:
        json.dump({i: name for i, name in enumerate(class_names)}, f, indent=2)

    # Configure datasets for performance
    train_ds = train_ds.prefetch(buffer_size=2)
    val_ds = val_ds.prefetch(buffer_size=2)

    return train_ds, val_ds, len(class_names), class_names

def train_model():
    """Train the model"""
    # Prepare dataset
    train_ds, val_ds, num_classes, class_names = prepare_dataset()
    
    # Build model
    model, _ = build_model(num_classes)
    
    # Define callbacks
    callbacks = [
        ModelCheckpoint(
            MODEL_PATH,
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=1
        ),
        ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=3,
            min_lr=1e-6,
            verbose=1
        ),
        EarlyStopping(
            monitor='val_loss',
            patience=10,  # Increased patience
            restore_best_weights=True,
            verbose=1
        )
    ]
    
    # Train the model
    print("\nTraining the model...")
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    try:
        history = model.fit(
            train_ds,
            validation_data=val_ds,
            epochs=EPOCHS,  # Use the configured number of epochs
            callbacks=callbacks,
            verbose=1
        )
        
        # Print final results
        final_accuracy = max(history.history['val_accuracy'])
        print(f"\nBest validation accuracy: {final_accuracy:.4f}")
        
        # Save the model with its architecture and weights
        model.save(MODEL_PATH)  # Using default Keras format
        
        # Save the label mapping again to ensure it's up to date
        with open(LABELMAP_PATH, 'w') as f:
            json.dump({i: name for i, name in enumerate(class_names)}, f, indent=2)
        
        print(f"[INFO] Saved model → {MODEL_PATH}")
        print(f"[INFO] Saved labels → {LABELMAP_PATH}")
        
        return history, model
    except tf.errors.ResourceExhaustedError:
        print("\n[ERROR] Out of memory error occurred. Try reducing BATCH_SIZE in the configuration.")
        raise
    except Exception as e:
        print(f"\n[ERROR] An error occurred during training: {str(e)}")
        raise

if __name__ == "__main__":
    history, model = train_model()