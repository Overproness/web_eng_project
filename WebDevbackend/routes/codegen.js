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

  // Header and imports
  code.push('# Generated TensorFlow/Keras Model');
  code.push('# Auto-generated code - customize as needed\n');
  code.push('import tensorflow as tf');
  code.push('from tensorflow import keras');
  code.push('from tensorflow.keras import layers');
  code.push('import numpy as np\n');

  // Data loading section
  code.push('# ========== Data Loading & Preprocessing ==========');
  code.push('# TODO: Load your dataset here');
  code.push('# Example: (X_train, y_train), (X_test, y_test) = keras.datasets.mnist.load_data()\n');

  // Preprocessing
  if (inputConfig?.dataPreprocessing) {
    code.push('# Data Preprocessing');
    if (inputConfig.dataPreprocessing === 'normalize') {
      code.push('# X_train = X_train.astype("float32") / 255.0');
      code.push('# X_test = X_test.astype("float32") / 255.0');
    } else if (inputConfig.dataPreprocessing === 'standardize') {
      code.push('# mean = np.mean(X_train)');
      code.push('# std = np.std(X_train)');
      code.push('# X_train = (X_train - mean) / std');
      code.push('# X_test = (X_test - mean) / std');
    }
  }

  // Train/validation split
  if (trainingConfig?.trainTestSplit) {
    code.push(`\n# Train/Test Split: ${(trainingConfig.trainTestSplit * 100).toFixed(0)}% training`);
    code.push('# Split is already done in this example, or use:');
    code.push('# from sklearn.model_selection import train_test_split');
    code.push(`# X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=${(1 - trainingConfig.trainTestSplit).toFixed(2)})`);
  }

  // Data augmentation
  if (inputConfig?.augmentation) {
    code.push('\n# Data Augmentation');
    code.push('data_augmentation = keras.Sequential([');
    code.push('    layers.RandomFlip("horizontal"),');
    code.push('    layers.RandomRotation(0.1),');
    code.push('    layers.RandomZoom(0.1),');
    code.push('])\n');
  }

  // Model definition
  code.push('\n# ========== Model Architecture ==========');
  code.push('model = keras.Sequential([\n');

  // Generate layer code
  layers.forEach((layer, index) => {
    const layerCode = generateLayerCode(layer, index === 0, inputConfig);
    if (layerCode) {
      code.push(`    ${layerCode},\n`);
    }
  });

  code.push('])\n');

  // Model compilation
  code.push('# ========== Model Compilation ==========');
  const optimizer = trainingConfig?.optimizer || 'adam';
  const lr = trainingConfig?.learningRate || 0.001;
  const loss = trainingConfig?.lossFunction || 'categorical_crossentropy';
  const metrics = outputConfig?.metrics || ['accuracy'];

  code.push(`optimizer = keras.optimizers.${capitalizeFirst(optimizer)}(learning_rate=${lr})`);
  code.push('model.compile(');
  code.push(`    optimizer=optimizer,`);
  code.push(`    loss='${loss}',`);
  code.push(`    metrics=${JSON.stringify(metrics)}`);
  code.push(')\n');

  // Model summary
  code.push('# Model Summary');
  code.push('model.summary()\n');

  // Training
  code.push('# ========== Model Training ==========');
  const epochs = trainingConfig?.epochs || 10;
  const batchSize = trainingConfig?.batchSize || 32;
  const valSplit = trainingConfig?.validationSplit || 0.2;

  code.push('history = model.fit(');
  code.push('    X_train, y_train,');
  code.push(`    epochs=${epochs},`);
  code.push(`    batch_size=${batchSize},`);
  code.push(`    validation_split=${valSplit},`);
  code.push('    verbose=1');
  code.push(')\n');

  // Evaluation
  if (outputConfig?.evaluateOnTestSet) {
    code.push('# ========== Model Evaluation ==========');
    code.push('test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)');
    code.push('print(f"Test accuracy: {test_acc:.4f}")');
    code.push('print(f"Test loss: {test_loss:.4f}")\n');
  }

  // Save model
  if (outputConfig?.saveModel) {
    const modelName = outputConfig?.modelName || 'my_model';
    code.push('# ========== Save Model ==========');
    code.push(`model.save('${modelName}.h5')`);
    code.push(`print("Model saved as ${modelName}.h5")\n`);
  }

  // Prediction example
  code.push('# ========== Make Predictions ==========');
  code.push('# predictions = model.predict(X_test[:5])');
  code.push('# print("Predictions:", predictions)');

  return code.join('\n');
}

// Helper function to generate code for individual layers
function generateLayerCode(layer, isFirst, inputConfig) {
  const { type, params } = layer;

  switch (type) {
    case 'Input':
      const shape = params.shape || inputConfig?.inputShape || '28, 28, 1';
      return `layers.Input(shape=(${shape}))`;

    case 'Dense':
      const units = params.units || 128;
      const activation = params.activation || 'relu';
      return `layers.Dense(${units}, activation='${activation}')`;

    case 'Conv2D':
      const filters = params.filters || 32;
      const kernelSize = params.kernelSize || 3;
      const convActivation = params.activation || 'relu';
      const padding = params.padding || 'same';
      return `layers.Conv2D(${filters}, (${kernelSize}, ${kernelSize}), activation='${convActivation}', padding='${padding}')`;

    case 'MaxPooling2D':
      const poolSize = params.poolSize || 2;
      const strides = params.strides || 2;
      return `layers.MaxPooling2D(pool_size=(${poolSize}, ${poolSize}), strides=${strides})`;

    case 'AvgPooling2D':
      const avgPoolSize = params.poolSize || 2;
      const avgStrides = params.strides || 2;
      return `layers.AveragePooling2D(pool_size=(${avgPoolSize}, ${avgPoolSize}), strides=${avgStrides})`;

    case 'SeparableConv2D':
      const sepFilters = params.filters || 64;
      const sepKernel = params.kernelSize || 3;
      const sepActivation = params.activation || 'relu';
      return `layers.SeparableConv2D(${sepFilters}, (${sepKernel}, ${sepKernel}), activation='${sepActivation}')`;

    case 'Flatten':
      return `layers.Flatten()`;

    case 'Dropout':
      const rate = params.rate || 0.5;
      return `layers.Dropout(${rate})`;

    case 'ReLU':
      return `layers.ReLU()`;

    case 'Softmax':
      return `layers.Softmax()`;

    case 'Sigmoid':
      return `layers.Activation('sigmoid')`;

    case 'Tanh':
      return `layers.Activation('tanh')`;

    default:
      return `# Unknown layer type: ${type}`;
  }
}

// Helper to capitalize first letter
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = router;
