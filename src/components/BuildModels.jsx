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

  useEffect(() => {
    localStorage.setItem("inputConfig", JSON.stringify(inputConfig));
  }, [inputConfig]);

  useEffect(() => {
    localStorage.setItem("trainingConfig", JSON.stringify(trainingConfig));
  }, [trainingConfig]);

  useEffect(() => {
    localStorage.setItem("outputConfig", JSON.stringify(outputConfig));
  }, [outputConfig]);

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

  // Update layer parameters
  const updateLayerParam = (layerId, paramName, value) => {
    setDroppedLayers(
      droppedLayers.map((layer) => {
        if (layer.id === layerId) {
          return {
            ...layer,
            params: { ...layer.params, [paramName]: value },
          };
        }
        return layer;
      })
    );
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
              className="export-btn"
              onClick={handleExportCode}
              disabled={isGenerating || droppedLayers.length === 0}
            >
              {isGenerating ? "Generating..." : "Export Code"}
            </button>
          </div>
        </div>

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
              <label>Input Shape</label>
              <input
                type="text"
                placeholder="e.g., 28, 28, 1"
                value={inputConfig.inputShape}
                onChange={(e) =>
                  setInputConfig({ ...inputConfig, inputShape: e.target.value })
                }
              />
            </div>

            <div className="config-field">
              <label>Data Preprocessing</label>
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
              </label>
            </div>
          </div>

          {/* Training Configuration */}
          <div className="config-section">
            <h3 className="config-title">Training Configuration</h3>

            <div className="config-field">
              <label>Train/Test Split</label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={trainingConfig.trainTestSplit}
                onChange={(e) =>
                  setTrainingConfig({
                    ...trainingConfig,
                    trainTestSplit: parseFloat(e.target.value),
                  })
                }
              />
              <span className="field-hint">
                {(trainingConfig.trainTestSplit * 100).toFixed(0)}% training
              </span>
            </div>

            <div className="config-field">
              <label>Validation Split</label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={trainingConfig.validationSplit}
                onChange={(e) =>
                  setTrainingConfig({
                    ...trainingConfig,
                    validationSplit: parseFloat(e.target.value),
                  })
                }
              />
              <span className="field-hint">
                {(trainingConfig.validationSplit * 100).toFixed(0)}% validation
              </span>
            </div>

            <div className="config-field">
              <label>Epochs</label>
              <input
                type="number"
                min="1"
                value={trainingConfig.epochs}
                onChange={(e) =>
                  setTrainingConfig({
                    ...trainingConfig,
                    epochs: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="config-field">
              <label>Batch Size</label>
              <input
                type="number"
                min="1"
                value={trainingConfig.batchSize}
                onChange={(e) =>
                  setTrainingConfig({
                    ...trainingConfig,
                    batchSize: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="config-field">
              <label>Optimizer</label>
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
              <label>Learning Rate</label>
              <input
                type="number"
                step="0.0001"
                value={trainingConfig.learningRate}
                onChange={(e) =>
                  setTrainingConfig({
                    ...trainingConfig,
                    learningRate: parseFloat(e.target.value),
                  })
                }
              />
            </div>

            <div className="config-field">
              <label>Loss Function</label>
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
