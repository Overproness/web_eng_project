const express = require('express');
const router = express.Router();

// Generate Python TensorFlow/Keras code from model configuration
router.post('/generate', async (req, res) => {
  try {
    const { layers, inputConfig, trainingConfig, outputConfig } = req.body;

    // Validate input
    if (!layers || !Array.isArray(layers)) {
      return res.status(400).json({ error: 'Invalid layers data' });
    }

    const pythonCode = generateTensorFlowCode(
      layers,
      inputConfig,
      trainingConfig,
      outputConfig
    );

    res.json({ 
      success: true, 
      code: pythonCode,
      message: 'Code generated successfully'
    });

  } catch (error) {
    console.error('Error generating code:', error);
    res.status(500).json({ 
      error: 'Failed to generate code',
      details: error.message 
    });
  }
});

// Helper function to generate TensorFlow/Keras code
function generateTensorFlowCode(layers, inputConfig, trainingConfig, outputConfig) {
  let code = [];
  
  // Track required libraries
  const requiredLibraries = new Set(['tensorflow', 'numpy']);
  
  // Check if scikit-learn is needed
  if (trainingConfig?.trainTestSplit && trainingConfig.trainTestSplit < 1) {
    requiredLibraries.add('scikit-learn');
  }
  
  // Check if matplotlib is needed for visualization
  if (outputConfig?.visualizePlots) {
    requiredLibraries.add('matplotlib');
  }

  // Header and pip install section
  code.push('"""');
  code.push('Generated TensorFlow/Keras Deep Learning Model');
  code.push('Auto-generated code - Ready to run!');
  code.push('');
  code.push('INSTALLATION INSTRUCTIONS:');
  code.push('Run the following command to install required libraries:');
  code.push('');
  code.push(`pip install ${Array.from(requiredLibraries).join(' ')}`);
  code.push('');
  code.push('Or install individually:');
  requiredLibraries.forEach(lib => {
    code.push(`pip install ${lib}`);
  });
  code.push('"""');
  code.push('');
  
  // Imports
  code.push('# ========== Imports ==========');
  code.push('import tensorflow as tf');
  code.push('from tensorflow import keras');
  code.push('from tensorflow.keras import layers');
  code.push('import numpy as np');
  
  if (requiredLibraries.has('scikit-learn')) {
    code.push('from sklearn.model_selection import train_test_split');
  }
  if (requiredLibraries.has('matplotlib')) {
    code.push('import matplotlib.pyplot as plt');
  }
  code.push('');

  // Data loading section
  code.push('# ========== Data Loading & Preprocessing ==========');
  code.push('# Load your dataset here');
  code.push('# Example using MNIST dataset:');
  code.push('(X_train, y_train), (X_test, y_test) = keras.datasets.mnist.load_data()');
  code.push('');
  code.push('# Reshape data if needed based on input shape');
  const inputShape = inputConfig?.inputShape || '28, 28, 1';
  const shapeDims = inputShape.split(',').map(s => s.trim());
  if (shapeDims.length === 3) {
    code.push(`X_train = X_train.reshape(-1, ${inputShape})`);
    code.push(`X_test = X_test.reshape(-1, ${inputShape})`);
  }
  code.push('');

  // Preprocessing
  if (inputConfig?.dataPreprocessing && inputConfig.dataPreprocessing !== 'none') {
    code.push('# Data Preprocessing');
    if (inputConfig.dataPreprocessing === 'normalize') {
      code.push('X_train = X_train.astype("float32") / 255.0');
      code.push('X_test = X_test.astype("float32") / 255.0');
    } else if (inputConfig.dataPreprocessing === 'standardize') {
      code.push('mean = np.mean(X_train)');
      code.push('std = np.std(X_train)');
      code.push('X_train = (X_train - mean) / std');
      code.push('X_test = (X_test - mean) / std');
    }
    code.push('');
  }

  // One-hot encode labels
  code.push('# One-hot encode labels (adjust num_classes as needed)');
  code.push('num_classes = 10  # Change this based on your dataset');
  code.push('y_train = keras.utils.to_categorical(y_train, num_classes)');
  code.push('y_test = keras.utils.to_categorical(y_test, num_classes)');
  code.push('');

  // Train/validation split
  if (trainingConfig?.trainTestSplit && trainingConfig.trainTestSplit < 1) {
    const testSize = (1 - trainingConfig.trainTestSplit).toFixed(2);
    code.push(`# Train/Test Split: ${(trainingConfig.trainTestSplit * 100).toFixed(0)}% training, ${(testSize * 100).toFixed(0)}% testing`);
    code.push('# If you want to further split your data:');
    code.push(`# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=${testSize}, random_state=42)`);
    code.push('');
  }

  // Data augmentation
  if (inputConfig?.augmentation) {
    code.push('# Data Augmentation');
    code.push('data_augmentation = keras.Sequential([');
    code.push('    layers.RandomFlip("horizontal"),');
    code.push('    layers.RandomRotation(0.1),');
    code.push('    layers.RandomZoom(0.1),');
    code.push('])');
    code.push('');
  }

  // Model definition
  code.push('# ========== Model Architecture ==========');
  
  // Add data augmentation to model if enabled
  if (inputConfig?.augmentation) {
    code.push('# Build model with data augmentation');
    code.push('inputs = layers.Input(shape=(' + (inputConfig?.inputShape || '28, 28, 1') + '))');
    code.push('x = data_augmentation(inputs)');
    code.push('');
    
    // Add remaining layers
    layers.forEach((layer, index) => {
      if (layer.type !== 'Input') {
        const layerCode = generateLayerCode(layer, false, inputConfig);
        if (layerCode) {
          code.push(`x = ${layerCode}`);
        }
      }
    });
    
    code.push('');
    code.push('model = keras.Model(inputs=inputs, outputs=x)');
  } else {
    // Sequential model without augmentation
    code.push('model = keras.Sequential([');
    
    // Generate layer code
    layers.forEach((layer, index) => {
      const layerCode = generateLayerCode(layer, index === 0, inputConfig);
      if (layerCode) {
        code.push(`    ${layerCode},`);
      }
    });

    code.push('])');
  }
  code.push('');

  // Model compilation
  code.push('# ========== Model Compilation ==========');
  const optimizer = trainingConfig?.optimizer || 'adam';
  const lr = trainingConfig?.learningRate || 0.001;
  const loss = trainingConfig?.lossFunction || 'categorical_crossentropy';
  const metrics = outputConfig?.metrics || ['accuracy'];

  code.push(`# Optimizer: ${optimizer}, Learning Rate: ${lr}`);
  code.push(`optimizer = keras.optimizers.${capitalizeFirst(optimizer)}(learning_rate=${lr})`);
  code.push('model.compile(');
  code.push(`    optimizer=optimizer,`);
  code.push(`    loss='${loss}',`);
  code.push(`    metrics=${JSON.stringify(metrics)}`);
  code.push(')');
  code.push('');

  // Model summary
  code.push('# Model Summary');
  code.push('print("\\n" + "="*50)');
  code.push('print("MODEL SUMMARY")');
  code.push('print("="*50)');
  code.push('model.summary()');
  code.push('print("="*50 + "\\n")');
  code.push('');

  // Training
  code.push('# ========== Model Training ==========');
  const epochs = trainingConfig?.epochs || 10;
  const batchSize = trainingConfig?.batchSize || 32;
  const valSplit = trainingConfig?.validationSplit || 0.2;

  code.push(`# Training for ${epochs} epochs with batch size ${batchSize}`);
  code.push(`# Using ${(valSplit * 100).toFixed(0)}% of training data for validation`);
  code.push('history = model.fit(');
  code.push('    X_train, y_train,');
  code.push(`    epochs=${epochs},`);
  code.push(`    batch_size=${batchSize},`);
  code.push(`    validation_split=${valSplit},`);
  code.push('    verbose=1');
  code.push(')');
  code.push('');

  // Evaluation
  if (outputConfig?.evaluateOnTestSet) {
    code.push('# ========== Model Evaluation ==========');
    code.push('print("\\nEvaluating model on test set...")');
    code.push('test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)');
    code.push('print(f"\\nTest Accuracy: {test_acc:.4f} ({test_acc*100:.2f}%)")');
    code.push('print(f"Test Loss: {test_loss:.4f}")');
    code.push('');
  }

  // Plot training history
  code.push('# ========== Plot Training History ==========');
  code.push('import matplotlib.pyplot as plt');
  code.push('');
  code.push('# Plot accuracy');
  code.push('plt.figure(figsize=(12, 4))');
  code.push('plt.subplot(1, 2, 1)');
  code.push('plt.plot(history.history["accuracy"], label="Training Accuracy")');
  code.push('plt.plot(history.history["val_accuracy"], label="Validation Accuracy")');
  code.push('plt.title("Model Accuracy")');
  code.push('plt.xlabel("Epoch")');
  code.push('plt.ylabel("Accuracy")');
  code.push('plt.legend()');
  code.push('plt.grid(True)');
  code.push('');
  code.push('# Plot loss');
  code.push('plt.subplot(1, 2, 2)');
  code.push('plt.plot(history.history["loss"], label="Training Loss")');
  code.push('plt.plot(history.history["val_loss"], label="Validation Loss")');
  code.push('plt.title("Model Loss")');
  code.push('plt.xlabel("Epoch")');
  code.push('plt.ylabel("Loss")');
  code.push('plt.legend()');
  code.push('plt.grid(True)');
  code.push('');
  code.push('plt.tight_layout()');
  code.push('plt.savefig("training_history.png")');
  code.push('print("\\nTraining history plot saved as training_history.png")');
  code.push('plt.show()');
  code.push('');

  // Save model
  if (outputConfig?.saveModel) {
    const modelName = outputConfig?.modelName || 'my_model';
    code.push('# ========== Save Model ==========');
    code.push(`model.save('${modelName}.h5')`);
    code.push(`print("\\nModel saved as ${modelName}.h5")`);
    code.push('');
    code.push('# To load the model later, use:');
    code.push(`# loaded_model = keras.models.load_model('${modelName}.h5')`);
    code.push('');
  }

  // Prediction example
  code.push('# ========== Make Predictions ==========');
  code.push('# Make predictions on test data');
  code.push('predictions = model.predict(X_test[:5])');
  code.push('predicted_classes = np.argmax(predictions, axis=1)');
  code.push('actual_classes = np.argmax(y_test[:5], axis=1)');
  code.push('');
  code.push('print("\\nSample Predictions:")');
  code.push('print("="*50)');
  code.push('for i in range(5):');
  code.push('    print(f"Sample {i+1}:")');
  code.push('    print(f"  Predicted: {predicted_classes[i]}, Actual: {actual_classes[i]}")');
  code.push('    print(f"  Confidence: {predictions[i][predicted_classes[i]]:.4f}")');
  code.push('print("="*50)');
  code.push('');
  code.push('print("\\n✓ Model training and evaluation complete!")');

  return code.join('\n');
}

// Helper function to generate code for individual layers
function generateLayerCode(layer, isFirst, inputConfig) {
  const { type, params } = layer;

  switch (type) {
    case 'Input': {
      const inputShape = params.shape || inputConfig?.inputShape || '28, 28, 1';
      return `layers.Input(shape=(${inputShape}))`;
    }

    case 'Dense': {
      const units = params.units || 128;
      const activation = params.activation || 'relu';
      if (isFirst && inputConfig?.inputShape) {
        return `layers.Dense(${units}, activation='${activation}', input_shape=(${inputConfig.inputShape}))`;
      }
      return `layers.Dense(${units}, activation='${activation}')`;
    }

    case 'Conv2D': {
      const filters = params.filters || 32;
      const kernelSize = params.kernelSize || 3;
      const convActivation = params.activation || 'relu';
      const padding = params.padding || 'same';
      if (isFirst && inputConfig?.inputShape) {
        return `layers.Conv2D(${filters}, (${kernelSize}, ${kernelSize}), activation='${convActivation}', padding='${padding}', input_shape=(${inputConfig.inputShape}))`;
      }
      return `layers.Conv2D(${filters}, (${kernelSize}, ${kernelSize}), activation='${convActivation}', padding='${padding}')`;
    }

    case 'MaxPooling2D': {
      const poolSize = params.poolSize || 2;
      const strides = params.strides || 2;
      return `layers.MaxPooling2D(pool_size=(${poolSize}, ${poolSize}), strides=${strides})`;
    }

    case 'AvgPooling2D':
    case 'AveragePooling2D': {
      const avgPoolSize = params.poolSize || 2;
      const avgStrides = params.strides || 2;
      return `layers.AveragePooling2D(pool_size=(${avgPoolSize}, ${avgPoolSize}), strides=${avgStrides})`;
    }

    case 'SeparableConv2D': {
      const sepFilters = params.filters || 64;
      const sepKernel = params.kernelSize || 3;
      const sepActivation = params.activation || 'relu';
      const sepPadding = params.padding || 'same';
      return `layers.SeparableConv2D(${sepFilters}, (${sepKernel}, ${sepKernel}), activation='${sepActivation}', padding='${sepPadding}')`;
    }

    case 'Flatten':
      return `layers.Flatten()`;

    case 'Dropout': {
      const rate = params.rate || 0.5;
      return `layers.Dropout(${rate})`;
    }

    case 'BatchNormalization':
      return `layers.BatchNormalization()`;

    case 'ReLU': {
      const maxValue = params.max_value;
      if (maxValue !== undefined && maxValue !== null) {
        return `layers.ReLU(max_value=${maxValue})`;
      }
      return `layers.ReLU()`;
    }

    case 'Softmax':
      return `layers.Softmax()`;

    case 'Sigmoid':
      return `layers.Activation('sigmoid')`;

    case 'Tanh':
      return `layers.Activation('tanh')`;

    case 'LeakyReLU': {
      const alpha = params.alpha || 0.3;
      return `layers.LeakyReLU(alpha=${alpha})`;
    }

    case 'GlobalAveragePooling2D':
      return `layers.GlobalAveragePooling2D()`;

    case 'GlobalMaxPooling2D':
      return `layers.GlobalMaxPooling2D()`;

    default:
      return `# Unknown layer type: ${type}`;
  }
}

// Helper to capitalize first letter
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = router;
