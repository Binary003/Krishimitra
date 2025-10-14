import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import numpy as np
import matplotlib.pyplot as plt
import os

# Load model and classes
model = tf.keras.models.load_model('models/mobilenet_plant_disease.h5')
class_indices = np.load('models/class_indices.npy', allow_pickle=True).item()
class_names = {v: k for k, v in class_indices.items()}

# Test data generator (same as Colab)
test_data = ImageDataGenerator(rescale=1./255)
test_generator = test_data.flow_from_directory(
    'data/Plantvillage/New Plant Diseases Dataset(Augmented)/New Plant Diseases Dataset(Augmented)/valid/',
    target_size=(224, 224),
    batch_size=32,
    class_mode='categorical',
    shuffle=False  # For consistent evaluation
)

# Evaluate
results = model.evaluate(test_generator)
print('Testing Metrics:')
print(f'Loss: {results[0]:.4f}')
print(f'Accuracy: {results[1]:.4f}')
print(f'Precision: {results[2]:.4f}')
print(f'Recall: {results[3]:.4f}')

# Sample predictions (show 9 images)
def predict_samples(model, generator, class_names, num_images=9):
    images, labels = next(generator)
    predictions = model.predict(images)
    pred_classes = np.argmax(predictions, axis=1)
    true_classes = np.argmax(labels, axis=1)

    plt.figure(figsize=(15, 15))
    for i in range(min(num_images, len(images))):
        plt.subplot(3, 3, i+1)
        plt.imshow(images[i])
        true_label = class_names[true_classes[i]]
        pred_label = class_names[pred_classes[i]]
        plt.title(f"True: {true_label}\nPred: {pred_label}")
        plt.axis('off')
    plt.tight_layout()
    plt.savefig('models/sample_predictions.png')
    plt.show()

predict_samples(model, test_generator, class_names)