import { useEffect, useState } from "react";
import { backend_url } from "../utils/config";
import "./BuildModels.css";

function BuildModels() {
  const [searchTerm, setSearchTerm] = useState("");
  // State to store the layers dropped onto the canvas
  const [droppedLayers, setDroppedLayers] = useState(() => {
    const saved = localStorage.getItem("droppedLayers");
    return saved ? JSON.parse(saved) : [];
  });
  // State for visual feedback when dragging over the canvas
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  // State for selected layer to configure
  const [selectedLayer, setSelectedLayer] = useState(null);
  // State for generated code
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  // State for validation warnings
  const [warnings, setWarnings] = useState({});
  // State for guide modal
  const [showGuide, setShowGuide] = useState(false);
  // State for small screen warning
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  // State for input configuration
  const [inputConfig, setInputConfig] = useState(() => {
    const saved = localStorage.getItem("inputConfig");
    return saved
      ? JSON.parse(saved)
      : {
          inputShape: "",
          dataPreprocessing: "normalize",
          augmentation: false,
        };
  });
  // State for training configuration
  const [trainingConfig, setTrainingConfig] = useState(() => {
    const saved = localStorage.getItem("trainingConfig");
    return saved
      ? JSON.parse(saved)
      : {
          trainTestSplit: 0.8,
          validationSplit: 0.2,
          epochs: 10,
          batchSize: 32,
          optimizer: "adam",
          learningRate: 0.001,
          lossFunction: "categorical_crossentropy",
        };
  });
  // State for output/evaluation configuration
  const [outputConfig, setOutputConfig] = useState(() => {
    const saved = localStorage.getItem("outputConfig");
    return saved
      ? JSON.parse(saved)
      : {
          metrics: ["accuracy"],
          evaluateOnTestSet: true,
          saveModel: true,
          modelName: "my_model",
        };
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("droppedLayers", JSON.stringify(droppedLayers));
  }, [droppedLayers]);

  // Check for consecutive activation functions and set a warning
  const activationTypes = ["ReLU", "Softmax", "Sigmoid", "Tanh"];
  const checkConsecutiveActivations = (layers) => {
    for (let i = 0; i < layers.length - 1; i++) {
      if (
        activationTypes.includes(layers[i].type) &&
        activationTypes.includes(layers[i + 1].type)
      ) {
        setWarnings((prev) => ({ ...prev, activationConsec: "Warning: Consecutive activation functions may be redundant or cause unexpected behavior." }));
        return;
      }
    }
    // no consecutive activations found -> remove the warning
    setWarnings((prev) => {
      const { activationConsec, ...rest } = prev;
      return rest;
    });
  };

  // keep activation warnings in sync when droppedLayers changes
  useEffect(() => {
    checkConsecutiveActivations(droppedLayers);
  }, [droppedLayers]);

  useEffect(() => {
    localStorage.setItem("inputConfig", JSON.stringify(inputConfig));
  }, [inputConfig]);

  useEffect(() => {
    localStorage.setItem("trainingConfig", JSON.stringify(trainingConfig));
  }, [trainingConfig]);

  useEffect(() => {
    localStorage.setItem("outputConfig", JSON.stringify(outputConfig));
  }, [outputConfig]);

  // Check screen size and show warning for small screens
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };

    // Check on mount
    checkScreenSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const layerCategories = {
    Convolutional: [
      "Conv2D",
      "MaxPooling2D",
      "AvgPooling2D",
      "SeparableConv2D",
    ],
    Core: ["Dense", "Flatten", "Dropout", "Input"],
    Activations: ["ReLU", "Softmax", "Sigmoid", "Tanh"],
  };

  // Default parameters for each layer type
  const getDefaultParams = (layerType) => {
    const defaults = {
      Conv2D: {
        filters: 32,
        kernelSize: 3,
        activation: "relu",
        padding: "same",
      },
      MaxPooling2D: { poolSize: 2, strides: 2 },
      AvgPooling2D: { poolSize: 2, strides: 2 },
      SeparableConv2D: { filters: 64, kernelSize: 3, activation: "relu" },
      Dense: { units: 128, activation: "relu" },
      Flatten: {},
      Dropout: { rate: 0.5 },
      Input: { shape: "28, 28, 1" },
      ReLU: {},
      Softmax: {},
      Sigmoid: {},
      Tanh: {},
    };
    return defaults[layerType] || {};
  };

  // Validation functions
  const validateTrainingConfig = (config) => {
    const newWarnings = {};

    if (config.learningRate <= 0) {
      newWarnings.learningRate = "Learning rate must be positive";
    } else if (config.learningRate > 1) {
      newWarnings.learningRate = "Learning rate is unusually high (typically < 1)";
    } else if (config.learningRate > 0.1) {
      newWarnings.learningRate = "Warning: Learning rate is very high (typically < 0.1)";
    }

    if (config.epochs <= 0 || !Number.isInteger(config.epochs)) {
      newWarnings.epochs = "Epochs must be a positive integer";
    } else if (config.epochs > 1000) {
      newWarnings.epochs = "Warning: Very high number of epochs (may take long to train)";
    }

    if (config.batchSize <= 0 || !Number.isInteger(config.batchSize)) {
      newWarnings.batchSize = "Batch size must be a positive integer";
    } else if (config.batchSize < 8) {
      newWarnings.batchSize = "Warning: Very small batch size (may cause instability)";
    } else if (config.batchSize > 1024) {
      newWarnings.batchSize = "Warning: Very large batch size (may require lots of memory)";
    }

    if (config.validationSplit < 0 || config.validationSplit >= 1) {
      newWarnings.validationSplit = "Validation split must be between 0 and 1";
    } else if (config.validationSplit < 0.1 && config.validationSplit > 0) {
      newWarnings.validationSplit = "Warning: Very small validation set";
    }

    if (config.trainTestSplit <= 0 || config.trainTestSplit > 1) {
      newWarnings.trainTestSplit = "Train/Test split must be between 0 and 1";
    } else if (config.trainTestSplit < 0.5) {
      newWarnings.trainTestSplit = "Warning: Training set is smaller than test set";
    }

    return newWarnings;
  };

  const validateLayerParams = (layerType, params) => {
    const warnings = {};

    switch (layerType) {
      case 'Conv2D':
      case 'SeparableConv2D':
        if (params.filters <= 0 || !Number.isInteger(params.filters)) {
          warnings.filters = "Filters must be a positive integer";
        } else if (params.filters > 1024) {
          warnings.filters = "Warning: Very high number of filters (may require lots of memory)";
        }
        if (params.kernelSize <= 0 || !Number.isInteger(params.kernelSize)) {
          warnings.kernelSize = "Kernel size must be a positive integer";
        } else if (params.kernelSize > 11) {
          warnings.kernelSize = "Warning: Very large kernel size (typically 1-11)";
        }
        break;

      case 'Dense':
        if (params.units <= 0 || !Number.isInteger(params.units)) {
          warnings.units = "Units must be a positive integer";
        } else if (params.units > 4096) {
          warnings.units = "Warning: Very high number of units (may require lots of memory)";
        }
        break;

      case 'Dropout':
        if (params.rate < 0 || params.rate >= 1) {
          warnings.rate = "Dropout rate must be between 0 and 1";
        } else if (params.rate > 0.7) {
          warnings.rate = "Warning: Very high dropout rate (typically < 0.7)";
        }
        break;

      case 'MaxPooling2D':
      case 'AvgPooling2D':
        if (params.poolSize <= 0 || !Number.isInteger(params.poolSize)) {
          warnings.poolSize = "Pool size must be a positive integer";
        } else if (params.poolSize > 5) {
          warnings.poolSize = "Warning: Very large pool size (typically 2-3)";
        }
        if (params.strides <= 0 || !Number.isInteger(params.strides)) {
          warnings.strides = "Strides must be a positive integer";
        }
        break;
    }

    return warnings;
  };

  const validateInputConfig = (config) => {
    const warnings = {};

    if (!config.inputShape || config.inputShape.trim() === "") {
      warnings.inputShape = "Input shape is required for proper model generation";
    } else {
      const parts = config.inputShape.split(',').map(s => s.trim());
      if (parts.some(p => isNaN(p) || p <= 0)) {
        warnings.inputShape = "Input shape must contain positive numbers separated by commas";
      }
    }

    return warnings;
  };

  // Validate and update training config
  const updateTrainingConfig = (key, value) => {
    const newConfig = { ...trainingConfig, [key]: value };
    setTrainingConfig(newConfig);
    
    const newWarnings = validateTrainingConfig(newConfig);
    
    // Clear old training config warnings and set new ones
    setWarnings(prev => {
      const filtered = { ...prev };
      // Remove all training config warnings
      delete filtered.learningRate;
      delete filtered.epochs;
      delete filtered.batchSize;
      delete filtered.validationSplit;
      delete filtered.trainTestSplit;
      // Add only the new warnings
      return { ...filtered, ...newWarnings };
    });
  };

  // Validate and update layer params
  const updateLayerParam = (layerId, paramName, paramValue) => {
    const updatedLayers = droppedLayers.map((layer) => {
      if (layer.id === layerId) {
        const newParams = { ...layer.params, [paramName]: paramValue };
        const layerWarnings = validateLayerParams(layer.type, newParams);
        
        if (Object.keys(layerWarnings).length > 0) {
          setWarnings(prev => ({ [`layer_${layerId}_${paramName}`]: layerWarnings[paramName], ...prev }));
        } else {
          setWarnings(prev => {
            const { [`layer_${layerId}_${paramName}`]: removed, ...rest } = prev;
            return rest;
          });
        }
        
        return { ...layer, params: newParams };
      }
      return layer;
    });
    setDroppedLayers(updatedLayers);
  };

  const updateInputConfig = (key, value) => {
    const newConfig = { ...inputConfig, [key]: value };
    setInputConfig(newConfig);
    
    const newWarnings = validateInputConfig(newConfig);
    
    // Clear old input config warnings and set new ones
    setWarnings(prev => {
      const filtered = { ...prev };
      // Remove all input config warnings
      delete filtered.inputShape;
      // Add only the new warnings
      return { ...filtered, ...newWarnings };
    });
  };

  // 1. Started dragging a layer from the palette
  const handleDragStart = (e, layerType) => {
    e.dataTransfer.setData("layerType", layerType);
    e.dataTransfer.effectAllowed = "copy";
  };

  // 2. Dragging over the drop zone (Canvas)
  const handleDragOver = (e) => {
    e.preventDefault(); // Essential to allow dropping
    e.dataTransfer.dropEffect = "copy";
    setIsDraggingOver(true);
  };

  // 3. Leaving the drop zone
  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  // 4. Dropped onto the canvas
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);

    const layerType = e.dataTransfer.getData("layerType");

    if (layerType) {
      const newLayer = {
        id: Date.now(),
        type: layerType,
        params: getDefaultParams(layerType),
      };
      const updatedLayers = [...droppedLayers, newLayer];
      setDroppedLayers(updatedLayers);
    }
  };

  // Helper to remove a layer
  const removeLayer = (idToRemove) => {
    setDroppedLayers(droppedLayers.filter((layer) => layer.id !== idToRemove));
    if (selectedLayer?.id === idToRemove) {
      setSelectedLayer(null);
    }
  };

  // Move layer up/down
  const moveLayer = (index, direction) => {
    const newLayers = [...droppedLayers];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < newLayers.length) {
      [newLayers[index], newLayers[targetIndex]] = [
        newLayers[targetIndex],
        newLayers[index],
      ];
      setDroppedLayers(newLayers);
    }
  };

  // Generate Python code
  const handleExportCode = async () => {
    if (droppedLayers.length === 0) {
      alert("Please add at least one layer to your model!");
      return;
    }

    // Validate all configurations before exporting
    const trainingWarnings = validateTrainingConfig(trainingConfig);
    const inputWarnings = validateInputConfig(inputConfig);
    
    // Check for critical errors (not just warnings)
    const criticalErrors = [];
    
    if (trainingWarnings.learningRate?.includes("must be")) {
      criticalErrors.push("Learning rate must be positive");
    }
    if (trainingWarnings.epochs?.includes("must be")) {
      criticalErrors.push(trainingWarnings.epochs);
    }
    if (trainingWarnings.batchSize?.includes("must be")) {
      criticalErrors.push(trainingWarnings.batchSize);
    }
    if (trainingWarnings.validationSplit?.includes("must be")) {
      criticalErrors.push(trainingWarnings.validationSplit);
    }
    if (trainingWarnings.trainTestSplit?.includes("must be")) {
      criticalErrors.push(trainingWarnings.trainTestSplit);
    }
    if (inputWarnings.inputShape) {
      criticalErrors.push(inputWarnings.inputShape);
    }

    // Check layer validation
    droppedLayers.forEach((layer, index) => {
      const layerWarnings = validateLayerParams(layer.type, layer.params);
      Object.entries(layerWarnings).forEach(([param, warning]) => {
        if (warning.includes("must be")) {
          criticalErrors.push(`Layer ${index + 1} (${layer.type}): ${warning}`);
        }
      });
    });

    if (criticalErrors.length > 0) {
      alert("Cannot generate code. Please fix the following errors:\n\n" + criticalErrors.join("\n"));
      return;
    }

    // Show warnings but allow to continue
    const allWarnings = { ...trainingWarnings, ...inputWarnings };
    const warningMessages = Object.entries(allWarnings)
      .filter(([_, msg]) => msg.includes("Warning"))
      .map(([key, msg]) => msg);

    if (warningMessages.length > 0) {
      const proceed = window.confirm(
        "The following warnings were detected:\n\n" + 
        warningMessages.join("\n") + 
        "\n\nDo you want to continue generating the code?"
      );
      if (!proceed) return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`${backend_url}/codegen/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          layers: droppedLayers,
          inputConfig,
          trainingConfig,
          outputConfig,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedCode(data.code);
        if (data.warnings && data.warnings.length > 0) {
          console.warn("Backend warnings:", data.warnings);
        }
      } else {
        alert("Failed to generate code: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error generating code:", error);
      alert(
        "Failed to connect to the server. Make sure the backend is running."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      alert("Code copied to clipboard!");
    }
  };

  // Close code modal
  const handleCloseCodeModal = () => {
    setGeneratedCode(null);
  };

  return (
    <div className="model-builder-page">
      {/* Small Screen Warning */}
      {isSmallScreen && (
        <div className="small-screen-warning">
          <div className="warning-content">
            <span className="warning-icon">⚠️</span>
            <div className="warning-text-container">
              <h3>Screen Size Notice</h3>
              <p>For the best experience, please use this application on a computer or larger screen (minimum 1024px width). Some features may not work properly on smaller screens.</p>
            </div>
          </div>
        </div>
      )}
      <div className="builder-container">
        {/* --- Left Column: Layer Palette --- */}
        <div className="left-palette">
          <h3 className="palette-title">Layers</h3>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search layers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="layers-list">
            {Object.entries(layerCategories).map(([category, layers]) => (
              <div key={category} className="layer-category">
                <h4 className="category-title">{category}</h4>
                {layers
                  .filter((l) =>
                    l.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((layer) => (
                    <div
                      key={layer}
                      className="layer-item"
                      draggable="true"
                      onDragStart={(e) => handleDragStart(e, layer)}
                    >
                      <span className="layer-icon">+</span>
                      {layer}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>

        {/* --- Middle Column: Canvas --- */}
        <div className="middle-canvas">
          <div className="canvas-header">
            <h2 className="canvas-title">Model Architecture</h2>
            <p className="canvas-subtitle">Drag layers to build your model</p>
          </div>

          {warnings.activationConsec && (
            <div className="activation-warning" role="status">
              ⚠️ {warnings.activationConsec}
            </div>
          )}

          <div
            className={`architecture-area ${isDraggingOver ? "drag-over" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {droppedLayers.length === 0 ? (
              <div className="drag-placeholder">
                <span className="placeholder-icon">🏗️</span>
                <h3>Drag layers here</h3>
                <p className="placeholder-text">
                  Start by adding an Input layer
                </p>
              </div>
            ) : (
              <div className="model-stack">
                {droppedLayers.map((layer, index) => (
                  <div
                    key={layer.id}
                    className={`dropped-layer-card ${
                      selectedLayer?.id === layer.id ? "selected" : ""
                    }`}
                    onClick={() => setSelectedLayer(layer)}
                  >
                    <div className="layer-info">
                      <span className="layer-index">{index + 1}</span>
                      <div className="layer-details">
                        <span className="layer-type">{layer.type}</span>
                        <span className="layer-params-preview">
                          {Object.entries(layer.params)
                            .slice(0, 2)
                            .map(([key, val]) => `${key}: ${val}`)
                            .join(", ")}
                        </span>
                      </div>
                    </div>
                    <div className="layer-actions">
                      <button
                        className="move-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveLayer(index, "up");
                        }}
                        disabled={index === 0}
                        title="Move Up"
                      >
                        ↑
                      </button>
                      <button
                        className="move-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          moveLayer(index, "down");
                        }}
                        disabled={index === droppedLayers.length - 1}
                        title="Move Down"
                      >
                        ↓
                      </button>
                      <button
                        className="remove-layer-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLayer(layer.id);
                        }}
                        title="Remove Layer"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="action-buttons">
            <button
              className="guide-btn"
              onClick={() => setShowGuide(true)}
              title="Open Model Building Guide"
            >
              Guide
            </button>
            <button
              className="export-btn"
              onClick={handleExportCode}
              disabled={isGenerating || droppedLayers.length === 0}
            >
              {isGenerating ? "Generating..." : "Export Code"}
            </button>
          </div>
        </div>

        {/* --- Guide Modal --- */}
        {showGuide && (
          <div className="guide-modal-overlay" onClick={() => setShowGuide(false)}>
            <div className="guide-modal" onClick={(e) => e.stopPropagation()}>
              <div className="guide-modal-header">
                <h2>Model Building Guide</h2>
                <button
                  className="close-modal-btn"
                  onClick={() => setShowGuide(false)}
                >
                  ×
                </button>
              </div>
              <div className="guide-modal-body">
                
                {/* Binary Classification */}
                <section className="guide-section">
                  <h3>1. Binary Classification</h3>
                  <p className="guide-description">
                    For predicting one of two outcomes (e.g., spam/not spam, yes/no, cat/dog)
                  </p>
                  
                  <div className="guide-config">
                    <h4>Input Configuration:</h4>
                    <ul>
                      <li><strong>Input Shape:</strong> 28, 28, 1 (or your data size)</li>
                      <li><strong>Preprocessing:</strong> Normalize (0-1)</li>
                      <li><strong>Augmentation:</strong> ✅ Enable (optional)</li>
                    </ul>
                  </div>

                  <div className="guide-layers">
                    <h4>Layers to Add:</h4>
                    <ol>
                      <li>Flatten</li>
                      <li>Dense (128 units, relu)</li>
                      <li>Dropout (0.3 rate)</li>
                      <li>Dense (64 units, relu)</li>
                      <li>Dense (1 unit, <strong>sigmoid</strong>) ⚠️ Important!</li>
                    </ol>
                  </div>

                  <div className="guide-training">
                    <h4>Training Settings:</h4>
                    <ul>
                      <li><strong>Loss Function:</strong> binary_crossentropy</li>
                      <li><strong>Epochs:</strong> 20-50</li>
                      <li><strong>Batch Size:</strong> 32</li>
                      <li><strong>Learning Rate:</strong> 0.001</li>
                    </ul>
                  </div>
                </section>

                {/* Image Classification CNN */}
                <section className="guide-section">
                  <h3>2. Image Classification (CNN)</h3>
                  <p className="guide-description">
                    For classifying images into multiple categories (MNIST, CIFAR-10, etc.)
                  </p>
                  
                  <div className="guide-config">
                    <h4>Input Configuration:</h4>
                    <ul>
                      <li><strong>Input Shape:</strong> 28, 28, 1 (grayscale) or 32, 32, 3 (color)</li>
                      <li><strong>Preprocessing:</strong> Normalize (0-1)</li>
                      <li><strong>Augmentation:</strong> ✅ Enable</li>
                    </ul>
                  </div>

                  <div className="guide-layers">
                    <h4>Layers to Add:</h4>
                    <ol>
                      <li>Conv2D (32 filters, 3 kernel, relu, same)</li>
                      <li>MaxPooling2D (2, 2)</li>
                      <li>Conv2D (64 filters, 3 kernel, relu, same)</li>
                      <li>MaxPooling2D (2, 2)</li>
                      <li>Flatten</li>
                      <li>Dense (128 units, relu)</li>
                      <li>Dropout (0.5 rate)</li>
                      <li>Dense (10 units, <strong>softmax</strong>) - 10 = num classes</li>
                    </ol>
                  </div>

                  <div className="guide-training">
                    <h4>Training Settings:</h4>
                    <ul>
                      <li><strong>Loss Function:</strong> categorical_crossentropy</li>
                      <li><strong>Epochs:</strong> 50-100</li>
                      <li><strong>Batch Size:</strong> 64</li>
                      <li><strong>Learning Rate:</strong> 0.001</li>
                    </ul>
                  </div>
                </section>

                {/* Tabular Data */}
                <section className="guide-section">
                  <h3>3. Tabular Data (Dense Network)</h3>
                  <p className="guide-description">
                    For structured/tabular data (predictions from spreadsheet-like data)
                  </p>
                  
                  <div className="guide-config">
                    <h4>Input Configuration:</h4>
                    <ul>
                      <li><strong>Input Shape:</strong> 20 (number of features)</li>
                      <li><strong>Preprocessing:</strong> Standardize (mean=0, std=1)</li>
                      <li><strong>Augmentation:</strong> ❌ Disable</li>
                    </ul>
                  </div>

                  <div className="guide-layers">
                    <h4>Layers to Add:</h4>
                    <ol>
                      <li>Dense (128 units, relu)</li>
                      <li>Dropout (0.3 rate)</li>
                      <li>Dense (64 units, relu)</li>
                      <li>Dropout (0.3 rate)</li>
                      <li>Dense (num_classes, softmax) - for classification</li>
                      <li>OR Dense (1, linear) - for regression</li>
                    </ol>
                  </div>

                  <div className="guide-training">
                    <h4>Training Settings:</h4>
                    <ul>
                      <li><strong>Loss Function:</strong> categorical_crossentropy (classification) or mean_squared_error (regression)</li>
                      <li><strong>Epochs:</strong> 30-50</li>
                      <li><strong>Batch Size:</strong> 32</li>
                      <li><strong>Learning Rate:</strong> 0.001</li>
                    </ul>
                  </div>
                </section>

                {/* Layer Explanations */}
                <section className="guide-section">
                  <h3>Layer Types Explained</h3>
                  
                  <div className="explanation-item">
                    <h4>Conv2D (Convolutional Layer)</h4>
                    <p>Extracts features from images by applying filters/kernels. Essential for image processing.</p>
                    <ul>
                      <li><strong>Filters:</strong> Number of feature detectors (e.g., edge detectors, color patterns)</li>
                      <li><strong>Kernel Size:</strong> Size of the sliding window (3x3, 5x5, etc.)</li>
                      <li><strong>Padding:</strong> 'same' keeps dimensions, 'valid' reduces them</li>
                      <li><strong>Use when:</strong> Working with images or spatial data</li>
                    </ul>
                  </div>

                  <div className="explanation-item">
                    <h4>Dense (Fully Connected Layer)</h4>
                    <p>Connects every neuron to every neuron in the previous layer. The workhorse of neural networks.</p>
                    <ul>
                      <li><strong>Units:</strong> Number of neurons in the layer</li>
                      <li><strong>Use when:</strong> Final classification, tabular data, after flattening</li>
                      <li><strong>Tip:</strong> More units = more learning capacity but slower training</li>
                    </ul>
                  </div>

                  <div className="explanation-item">
                    <h4>Dropout</h4>
                    <p>Randomly turns off neurons during training to prevent overfitting (memorizing training data).</p>
                    <ul>
                      <li><strong>Rate:</strong> Fraction of neurons to drop (0.3 = drop 30%)</li>
                      <li><strong>Use when:</strong> Model is overfitting (training acc &gt;&gt; validation acc)</li>
                      <li><strong>Typical values:</strong> 0.2 to 0.5</li>
                    </ul>
                  </div>

                  <div className="explanation-item">
                    <h4>MaxPooling2D</h4>
                    <p>Reduces image size by keeping only the maximum value in each region. Makes training faster.</p>
                    <ul>
                      <li><strong>Pool Size:</strong> Size of pooling window (usually 2x2)</li>
                      <li><strong>Effect:</strong> Reduces dimensions by half, keeps important features</li>
                      <li><strong>Use when:</strong> After Conv2D layers to reduce computation</li>
                    </ul>
                  </div>

                  <div className="explanation-item">
                    <h4>AvgPooling2D</h4>
                    <p>Like MaxPooling but takes the average instead of maximum. Smoother downsampling.</p>
                    <ul>
                      <li><strong>Use when:</strong> You want smoother feature reduction than MaxPooling</li>
                      <li><strong>Less common than MaxPooling</strong></li>
                    </ul>
                  </div>

                  <div className="explanation-item">
                    <h4>Flatten</h4>
                    <p>Converts multi-dimensional data into a 1D array. Required before Dense layers.</p>
                    <ul>
                      <li><strong>Use when:</strong> Transitioning from Conv2D to Dense layers</li>
                      <li><strong>Example:</strong> (28, 28, 64) → (50176,)</li>
                    </ul>
                  </div>

                  <div className="explanation-item">
                    <h4>SeparableConv2D</h4>
                    <p>Efficient version of Conv2D that uses less parameters. Faster and lighter.</p>
                    <ul>
                      <li><strong>Use when:</strong> You want faster training with similar performance</li>
                      <li><strong>Popular in mobile models</strong></li>
                    </ul>
                  </div>
                </section>

                {/* Activation Functions */}
                <section className="guide-section">
                  <h3>Activation Functions Explained</h3>
                  
                  <div className="explanation-item">
                    <h4>ReLU (Rectified Linear Unit)</h4>
                    <p><code>f(x) = max(0, x)</code> - Outputs input if positive, else 0.</p>
                    <ul>
                      <li><strong>Use for:</strong> Hidden layers (most common choice)</li>
                      <li><strong>Pros:</strong> Fast, prevents vanishing gradient</li>
                      <li><strong>Cons:</strong> Can "die" if inputs are always negative</li>
                      <li><strong>When to use:</strong> Default choice for most layers</li>
                    </ul>
                  </div>

                  <div className="explanation-item">
                    <h4>Sigmoid</h4>
                    <p><code>f(x) = 1 / (1 + e^-x)</code> - Outputs values between 0 and 1.</p>
                    <ul>
                      <li><strong>Use for:</strong> Binary classification final layer</li>
                      <li><strong>Output:</strong> Probability (0 to 1)</li>
                      <li><strong>Example:</strong> 0.8 = 80% probability of class 1</li>
                      <li><strong>Don't use for:</strong> Hidden layers (causes vanishing gradient)</li>
                    </ul>
                  </div>

                  <div className="explanation-item">
                    <h4>Softmax</h4>
                    <p>Converts outputs to probabilities that sum to 1. Used for multi-class classification.</p>
                    <ul>
                      <li><strong>Use for:</strong> Multi-class classification final layer</li>
                      <li><strong>Output:</strong> Probability distribution [0.1, 0.7, 0.2] = 70% class 2</li>
                      <li><strong>Example:</strong> Classifying digits 0-9, dog/cat/bird</li>
                      <li><strong>Must use with:</strong> categorical_crossentropy loss</li>
                    </ul>
                  </div>

                  <div className="explanation-item">
                    <h4>Tanh (Hyperbolic Tangent)</h4>
                    <p><code>f(x) = (e^x - e^-x) / (e^x + e^-x)</code> - Outputs between -1 and 1.</p>
                    <ul>
                      <li><strong>Use for:</strong> Hidden layers, alternative to ReLU</li>
                      <li><strong>Pros:</strong> Zero-centered (better than sigmoid)</li>
                      <li><strong>Cons:</strong> Slower than ReLU, vanishing gradient</li>
                      <li><strong>When to use:</strong> When you need negative values</li>
                    </ul>
                  </div>

                  <div className="explanation-item">
                    <h4>Linear (No Activation)</h4>
                    <p><code>f(x) = x</code> - Outputs the input as-is.</p>
                    <ul>
                      <li><strong>Use for:</strong> Regression final layer</li>
                      <li><strong>Output:</strong> Any real number (-∞ to +∞)</li>
                      <li><strong>Example:</strong> Predicting house price, temperature</li>
                      <li><strong>Don't use for:</strong> Hidden layers (defeats purpose of deep learning)</li>
                    </ul>
                  </div>
                </section>

                {/* Deep Learning Terms */}
                <section className="guide-section">
                  <h3>Deep Learning Terms Explained</h3>
                  
                  <div className="explanation-item">
                    <h4>Epoch</h4>
                    <p>One complete pass through the entire training dataset.</p>
                    <ul>
                      <li><strong>Example:</strong> 50 epochs = model sees all data 50 times</li>
                      <li><strong>More epochs:</strong> Better learning but risk overfitting</li>
                      <li><strong>Typical range:</strong> 10-100 epochs</li>
                    </ul>
                  </div>

                  <div className="explanation-item">
                    <h4>Batch Size</h4>
                    <p>Number of samples processed before updating model weights.</p>
                    <ul>
                      <li><strong>Example:</strong> Batch size 32 = update weights after every 32 images</li>
                      <li><strong>Larger batch:</strong> Faster training, more memory, less noise</li>
                      <li><strong>Smaller batch:</strong> Slower training, less memory, more noise (can help)</li>
                      <li><strong>Typical values:</strong> 16, 32, 64, 128</li>
                    </ul>
                  </div>

                  <div className="explanation-item">
                    <h4>Learning Rate</h4>
                    <p>How much to adjust the model after each update. Critical hyperparameter!</p>
                    <ul>
                      <li><strong>Too high:</strong> Model bounces around, never learns properly</li>
                      <li><strong>Too low:</strong> Learning is very slow, may get stuck</li>
                      <li><strong>Typical values:</strong> 0.0001 to 0.01</li>
                      <li><strong>Rule of thumb:</strong> Start with 0.001</li>
                    </ul>
                  </div>

                  <div className="explanation-item">
                    <h4>Loss Function</h4>
                    <p>Measures how wrong the model's predictions are. Model tries to minimize this.</p>
                    <ul>
                      <li><strong>binary_crossentropy:</strong> For 2 classes (yes/no)</li>
                      <li><strong>categorical_crossentropy:</strong> For multiple classes (cat/dog/bird)</li>
                      <li><strong>mean_squared_error:</strong> For regression (predicting numbers)</li>
                      <li><strong>Lower loss = better model</strong></li>
                    </ul>
                  </div>

                  <div className="explanation-item">
                    <h4>Optimizer</h4>
                    <p>Algorithm that updates model weights to minimize loss.</p>
                    <ul>
                      <li><strong>Adam:</strong> Most popular, adaptive learning rate (good default)</li>
                      <li><strong>SGD:</strong> Simple, can be better with momentum</li>
                      <li><strong>RMSprop:</strong> Good for recurrent networks</li>
                      <li><strong>Recommendation:</strong> Start with Adam</li>
                    </ul>
                  </div>

                  <div className="explanation-item">
                    <h4>Validation Split</h4>
                    <p>Portion of training data used to check if model is overfitting.</p>
                    <ul>
                      <li><strong>Example:</strong> 0.2 = use 20% of training data for validation</li>
                      <li><strong>Purpose:</strong> Monitor if model generalizes or just memorizes</li>
                      <li><strong>Typical values:</strong> 0.1 to 0.3</li>
                      <li><strong>Warning sign:</strong> Training acc high, validation acc low = overfitting</li>
                    </ul>
                  </div>

                  <div className="explanation-item">
                    <h4>Overfitting</h4>
                    <p>When model memorizes training data instead of learning patterns.</p>
                    <ul>
                      <li><strong>Symptoms:</strong> High training accuracy, low test accuracy</li>
                      <li><strong>Solutions:</strong> Add Dropout, more data, data augmentation, less complex model</li>
                      <li><strong>Example:</strong> 99% training acc, 60% test acc = severe overfitting</li>
                    </ul>
                  </div>

                  <div className="explanation-item">
                    <h4>Data Normalization</h4>
                    <p>Scaling input data to a standard range (usually 0-1).</p>
                    <ul>
                      <li><strong>Why:</strong> Helps model learn faster and more stably</li>
                      <li><strong>Method:</strong> Divide pixel values by 255 (0-255 → 0-1)</li>
                      <li><strong>Alternative:</strong> Standardization (mean=0, std=1)</li>
                      <li><strong>Always do this!</strong> Very important for good performance</li>
                    </ul>
                  </div>

                  <div className="explanation-item">
                    <h4>Data Augmentation</h4>
                    <p>Creating variations of training images (flip, rotate, zoom) to increase dataset size.</p>
                    <ul>
                      <li><strong>Why:</strong> Prevents overfitting, helps model generalize</li>
                      <li><strong>Techniques:</strong> Horizontal flip, rotation, zoom, brightness change</li>
                      <li><strong>Use for:</strong> Images when you have limited data</li>
                      <li><strong>Effect:</strong> Can significantly improve accuracy</li>
                    </ul>
                  </div>

                  <div className="explanation-item">
                    <h4>Feature</h4>
                    <p>An input variable or characteristic used by the model.</p>
                    <ul>
                      <li><strong>Images:</strong> Pixels are features</li>
                      <li><strong>Tabular:</strong> Columns are features (age, price, etc.)</li>
                      <li><strong>Input Shape:</strong> Defines number and structure of features</li>
                    </ul>
                  </div>

                  <div className="explanation-item">
                    <h4>Gradient</h4>
                    <p>Direction and magnitude to adjust weights to reduce loss.</p>
                    <ul>
                      <li><strong>Vanishing gradient:</strong> Gradients become too small, learning stops</li>
                      <li><strong>Exploding gradient:</strong> Gradients become too large, model unstable</li>
                      <li><strong>ReLU helps:</strong> Prevents vanishing gradient problem</li>
                    </ul>
                  </div>
                </section>

                {/* Quick Tips */}
                <section className="guide-section guide-tips">
                  <h3>Quick Tips</h3>
                  <div className="tips-grid">
                    <div className="tip-card">
                      <strong>Activations</strong>
                      <ul>
                        <li>Binary: <code>sigmoid</code></li>
                        <li>Multi-class: <code>softmax</code></li>
                        <li>Regression: <code>linear</code></li>
                      </ul>
                    </div>
                    <div className="tip-card">
                      <strong>Loss Functions</strong>
                      <ul>
                        <li>Binary: <code>binary_crossentropy</code></li>
                        <li>Multi-class: <code>categorical_crossentropy</code></li>
                        <li>Regression: <code>mean_squared_error</code></li>
                      </ul>
                    </div>
                    <div className="tip-card">
                      <strong>Common Mistakes</strong>
                      <ul>
                        <li>Using sigmoid for multi-class</li>
                        <li>Wrong loss function</li>
                        <li>Forgetting to normalize data</li>
                        <li>Too high learning rate</li>
                      </ul>
                    </div>
                    <div className="tip-card">
                      <strong>Best Practices</strong>
                      <ul>
                        <li>Start simple, add complexity</li>
                        <li>Use Dropout to prevent overfitting</li>
                        <li>Enable data augmentation for images</li>
                        <li>Monitor validation accuracy</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Reference Table */}
                <section className="guide-section">
                  <h3>Quick Reference Table</h3>
                  <div className="reference-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Model Type</th>
                          <th>Last Activation</th>
                          <th>Loss Function</th>
                          <th>Typical Use</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Binary Classification</td>
                          <td><code>sigmoid</code></td>
                          <td><code>binary_crossentropy</code></td>
                          <td>Yes/No, Cat/Dog</td>
                        </tr>
                        <tr>
                          <td>Multi-Class</td>
                          <td><code>softmax</code></td>
                          <td><code>categorical_crossentropy</code></td>
                          <td>MNIST, CIFAR-10</td>
                        </tr>
                        <tr>
                          <td>Regression</td>
                          <td><code>linear</code></td>
                          <td><code>mean_squared_error</code></td>
                          <td>Price Prediction</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

              </div>
              <div className="guide-modal-footer">
                <button className="close-guide-btn" onClick={() => setShowGuide(false)}>
                  Close Guide
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- Code Modal --- */}
        {generatedCode && (
          <div className="code-modal-overlay" onClick={handleCloseCodeModal}>
            <div className="code-modal" onClick={(e) => e.stopPropagation()}>
              <div className="code-modal-header">
                <h2>Generated TensorFlow Code</h2>
                <button
                  className="close-modal-btn"
                  onClick={handleCloseCodeModal}
                >
                  ×
                </button>
              </div>
              <div className="code-modal-body">
                <pre className="code-display">
                  <code>{generatedCode}</code>
                </pre>
              </div>
              <div className="code-modal-footer">
                <button className="copy-code-btn" onClick={handleCopyCode}>
                  Copy to Clipboard
                </button>
                <button className="close-btn" onClick={handleCloseCodeModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- Right Column: Configuration Panel --- */}
        <div className="right-config-panel">
          {/* Input Configuration */}
          <div className="config-section">
            <h3 className="config-title">Input Configuration</h3>

            <div className="config-field">
              <label>
                Input Shape
                <span className="info-icon" title="Dimensions of your input data (e.g., 28, 28, 1 for 28x28 grayscale images). Format: width, height, channels">
                  ⓘ
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g., 28, 28, 1"
                value={inputConfig.inputShape}
                onChange={(e) => updateInputConfig('inputShape', e.target.value)}
                className={warnings.inputShape ? 'input-warning' : ''}
              />
              {warnings.inputShape && (
                <span className="warning-text">⚠️ {warnings.inputShape}</span>
              )}
            </div>

            <div className="config-field">
              <label>
                Data Preprocessing
                <span className="info-icon" title="How to scale your data. Normalize: scales to 0-1 range. Standardize: centers data with mean=0, std=1. Recommended: Normalize for images, Standardize for tabular data">
                  ⓘ
                </span>
              </label>
              <select
                value={inputConfig.dataPreprocessing}
                onChange={(e) =>
                  setInputConfig({
                    ...inputConfig,
                    dataPreprocessing: e.target.value,
                  })
                }
              >
                <option value="normalize">Normalize (0-1)</option>
                <option value="standardize">Standardize (mean=0, std=1)</option>
                <option value="none">None</option>
              </select>
            </div>

            <div className="config-field checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={inputConfig.augmentation}
                  onChange={(e) =>
                    setInputConfig({
                      ...inputConfig,
                      augmentation: e.target.checked,
                    })
                  }
                />
                Enable Data Augmentation
                <span className="info-icon" title="Artificially increases dataset by creating variations (flip, rotate, zoom). Helps prevent overfitting. Recommended for image data">
                  ⓘ
                </span>
              </label>
            </div>
          </div>

          {/* Training  */}
          <div className="config-section">
            <h3 className="config-title">Training Configuration</h3>

            <div className="config-field">
              <label>
                Train/Test Split
                <span className="info-icon" title="Ratio of data used for training vs testing. 0.8 = 80% training, 20% testing. Higher = more training data but less for evaluation">
                  ⓘ
                </span>
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={trainingConfig.trainTestSplit}
                onChange={(e) => updateTrainingConfig('trainTestSplit', parseFloat(e.target.value))}
                className={warnings.trainTestSplit ? 'input-warning' : ''}
              />
              <span className="field-hint">
                {(trainingConfig.trainTestSplit * 100).toFixed(0)}% training
              </span>
              {warnings.trainTestSplit && (
                <span className="warning-text">⚠️ {warnings.trainTestSplit}</span>
              )}
            </div>

            <div className="config-field">
              <label>
                Validation Split
                <span className="info-icon" title="Portion of training data used to monitor overfitting during training. 0.2 = use 20% of training data for validation. Helps detect if model is memorizing vs learning">
                  ⓘ
                </span>
              </label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={trainingConfig.validationSplit}
                onChange={(e) => updateTrainingConfig('validationSplit', parseFloat(e.target.value))}
                className={warnings.validationSplit ? 'input-warning' : ''}
              />
              <span className="field-hint">
                {(trainingConfig.validationSplit * 100).toFixed(0)}% validation
              </span>
              {warnings.validationSplit && (
                <span className="warning-text">⚠️ {warnings.validationSplit}</span>
              )}
            </div>

            <div className="config-field">
              <label>
                Epochs
                <span className="info-icon" title="Number of times the model sees the entire dataset during training. More epochs = more learning but risk of overfitting. Typical: 20-100">
                  ⓘ
                </span>
              </label>
              <input
                type="number"
                min="1"
                value={trainingConfig.epochs}
                onChange={(e) => updateTrainingConfig('epochs', parseInt(e.target.value) || 1)}
                className={warnings.epochs ? 'input-warning' : ''}
              />
              {warnings.epochs && (
                <span className="warning-text">⚠️ {warnings.epochs}</span>
              )}
            </div>

            <div className="config-field">
              <label>
                Batch Size
                <span className="info-icon" title="Number of samples processed before updating weights. Larger = faster training but more memory. Smaller = slower but more stable. Typical: 16, 32, 64">
                  ⓘ
                </span>
              </label>
              <input
                type="number"
                min="1"
                value={trainingConfig.batchSize}
                onChange={(e) => updateTrainingConfig('batchSize', parseInt(e.target.value) || 1)}
                className={warnings.batchSize ? 'input-warning' : ''}
              />
              {warnings.batchSize && (
                <span className="warning-text">⚠️ {warnings.batchSize}</span>
              )}
            </div>

            <div className="config-field">
              <label>
                Optimizer
                <span className="info-icon" title="Algorithm that updates model weights to minimize loss. Adam: adaptive learning rate, works well for most cases. SGD: simple, good with momentum. Recommended: Adam">
                  ⓘ
                </span>
              </label>
              <select
                value={trainingConfig.optimizer}
                onChange={(e) =>
                  setTrainingConfig({
                    ...trainingConfig,
                    optimizer: e.target.value,
                  })
                }
              >
                <option value="adam">Adam</option>
                <option value="sgd">SGD</option>
                <option value="rmsprop">RMSprop</option>
                <option value="adagrad">Adagrad</option>
              </select>
            </div>

            <div className="config-field">
              <label>
                Learning Rate
                <span className="info-icon" title="How much to adjust weights after each update. Too high = unstable training. Too low = very slow learning. Typical: 0.0001 to 0.01. Start with 0.001">
                  ⓘ
                </span>
              </label>
              <input
                type="number"
                step="0.0001"
                value={trainingConfig.learningRate}
                onChange={(e) => updateTrainingConfig('learningRate', parseFloat(e.target.value) || 0)}
                className={warnings.learningRate ? 'input-warning' : ''}
              />
              {warnings.learningRate && (
                <span className="warning-text">⚠️ {warnings.learningRate}</span>
              )}
            </div>

            <div className="config-field">
              <label>
                Loss Function
                <span className="info-icon" title="Measures how wrong predictions are. Binary Crossentropy: 2 classes. Categorical Crossentropy: multiple classes. MSE/MAE: regression (predicting numbers)">
                  ⓘ
                </span>
              </label>
              <select
                value={trainingConfig.lossFunction}
                onChange={(e) =>
                  setTrainingConfig({
                    ...trainingConfig,
                    lossFunction: e.target.value,
                  })
                }
              >
                <option value="categorical_crossentropy">
                  Categorical Crossentropy
                </option>
                <option value="binary_crossentropy">Binary Crossentropy</option>
                <option value="mse">Mean Squared Error</option>
                <option value="mae">Mean Absolute Error</option>
              </select>
            </div>
          </div>

          {/* Output/Evaluation Configuration */}
          <div className="config-section">
            <h3 className="config-title">Output & Evaluation</h3>

            <div className="config-field">
              <label>Metrics</label>
              <select
                multiple
                value={outputConfig.metrics}
                onChange={(e) =>
                  setOutputConfig({
                    ...outputConfig,
                    metrics: Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    ),
                  })
                }
              >
                <option value="accuracy">Accuracy</option>
                <option value="precision">Precision</option>
                <option value="recall">Recall</option>
                <option value="f1">F1 Score</option>
              </select>
            </div>

            <div className="config-field checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={outputConfig.evaluateOnTestSet}
                  onChange={(e) =>
                    setOutputConfig({
                      ...outputConfig,
                      evaluateOnTestSet: e.target.checked,
                    })
                  }
                />
                Evaluate on Test Set
              </label>
            </div>

            <div className="config-field checkbox-field">
              <label>
                <input
                  type="checkbox"
                  checked={outputConfig.saveModel}
                  onChange={(e) =>
                    setOutputConfig({
                      ...outputConfig,
                      saveModel: e.target.checked,
                    })
                  }
                />
                Save Model After Training
              </label>
            </div>

            <div className="config-field">
              <label>Model Name</label>
              <input
                type="text"
                value={outputConfig.modelName}
                onChange={(e) =>
                  setOutputConfig({
                    ...outputConfig,
                    modelName: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Layer Parameters Section */}
          {selectedLayer && (
            <div className="config-section layer-params-section">
              <h3 className="config-title">
                Layer Parameters: {selectedLayer.type}
              </h3>

              {Object.keys(selectedLayer.params).length > 0 ? (
                Object.entries(selectedLayer.params).map(
                  ([paramName, paramValue]) => (
                    <div key={paramName} className="config-field">
                      <label>
                        {paramName.charAt(0).toUpperCase() + paramName.slice(1)}
                      </label>
                      <input
                        type={
                          typeof paramValue === "number" ? "number" : "text"
                        }
                        value={paramValue}
                        onChange={(e) =>
                          updateLayerParam(
                            selectedLayer.id,
                            paramName,
                            typeof paramValue === "number"
                              ? parseFloat(e.target.value) || 0
                              : e.target.value
                          )
                        }
                      />
                    </div>
                  )
                )
              ) : (
                <p className="no-params">
                  This layer has no configurable parameters
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BuildModels;
