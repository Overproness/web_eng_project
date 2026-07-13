"""
Generated TensorFlow/Keras Deep Learning Model
Auto-generated code - Ready to run!

INSTALLATION INSTRUCTIONS:
Run the following command to install required libraries:

pip install tensorflow numpy scikit-learn matplotlib

Or install individually:
pip install tensorflow
pip install numpy
pip install scikit-learn
pip install matplotlib
"""

# ========== Imports ==========
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import numpy as np
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt

# ========== Data Loading & Preprocessing ==========
# Load your dataset here
# Example using MNIST dataset:
(X_train, y_train), (X_test, y_test) = keras.datasets.mnist.load_data()

# Reshape data if needed based on input shape
X_train = X_train.reshape(-1, 28, 28, 1)
X_test = X_test.reshape(-1, 28, 28, 1)

# Data Preprocessing
X_train = X_train.astype("float32") / 255.0
X_test = X_test.astype("float32") / 255.0

# One-hot encode labels (adjust num_classes as needed)
num_classes = 10  # Change this based on your dataset
y_train = keras.utils.to_categorical(y_train, num_classes)
y_test = keras.utils.to_categorical(y_test, num_classes)

# Train/Test Split: 80% training, 20% testing
# If you want to further split your data:
# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)

# ========== Model Architecture ==========
model = keras.Sequential([
    layers.Conv2D(32, (3, 3), activation='relu', padding='same', input_shape=(28, 28, 1)),
    layers.MaxPooling2D(pool_size=(2, 2), strides=2),
    layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
    layers.MaxPooling2D(pool_size=(2, 2), strides=2),
    layers.Flatten(),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(10, activation='softmax'),
])

# ========== Model Compilation ==========
# Optimizer: adam, Learning Rate: 0.001
optimizer = keras.optimizers.Adam(learning_rate=0.001)
model.compile(
    optimizer=optimizer,
    loss='categorical_crossentropy',
    metrics=["accuracy"]
)

# Model Summary
print("\n" + "="*50)
print("MODEL SUMMARY")
print("="*50)
model.summary()
print("="*50 + "\n")

# ========== Model Training ==========
# Training for 10 epochs with batch size 32
# Using 20% of training data for validation
history = model.fit(
    X_train, y_train,
    epochs=10,
    batch_size=32,
    validation_split=0.2,
    verbose=1
)

# ========== Model Evaluation ==========
print("\nEvaluating model on test set...")
test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
print(f"\nTest Accuracy: {test_acc:.4f} ({test_acc*100:.2f}%)")
print(f"Test Loss: {test_loss:.4f}")

# ========== Plot Training History ==========
import matplotlib.pyplot as plt

# Plot accuracy
plt.figure(figsize=(12, 4))
plt.subplot(1, 2, 1)
plt.plot(history.history["accuracy"], label="Training Accuracy")
plt.plot(history.history["val_accuracy"], label="Validation Accuracy")
plt.title("Model Accuracy")
plt.xlabel("Epoch")
plt.ylabel("Accuracy")
plt.legend()
plt.grid(True)

# Plot loss
plt.subplot(1, 2, 2)
plt.plot(history.history["loss"], label="Training Loss")
plt.plot(history.history["val_loss"], label="Validation Loss")
plt.title("Model Loss")
plt.xlabel("Epoch")
plt.ylabel("Loss")
plt.legend()
plt.grid(True)

plt.tight_layout()
plt.savefig("training_history.png")
print("\nTraining history plot saved as training_history.png")
plt.show()

# ========== Save Model ==========
model.save('my_model.h5')
print("\nModel saved as my_model.h5")

# To load the model later, use:
# loaded_model = keras.models.load_model('my_model.h5')

# ========== Make Predictions ==========
# Make predictions on test data
predictions = model.predict(X_test[:5])
predicted_classes = np.argmax(predictions, axis=1)
actual_classes = np.argmax(y_test[:5], axis=1)

print("\nSample Predictions:")
print("="*50)
for i in range(5):
    print(f"Sample {i+1}:")
    print(f"  Predicted: {predicted_classes[i]}, Actual: {actual_classes[i]}")
    print(f"  Confidence: {predictions[i][predicted_classes[i]]:.4f}")
print("="*50)

print("\n✓ Model training and evaluation complete!")
