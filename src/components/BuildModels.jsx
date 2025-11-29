import React, { useState } from 'react';
import './BuildModels.css';

function BuildModels() {
  const [searchTerm, setSearchTerm] = useState('');
  // State to store the layers dropped onto the canvas
  const [droppedLayers, setDroppedLayers] = useState([]);
  // State for visual feedback when dragging over the canvas
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const layerCategories = {
    'Convolutional': ['Conv2D', 'MaxPooling2D', 'AvgPooling2D', 'SeparableConv2D'],
    'Core': ['Dense', 'Flatten', 'Dropout', 'Input'],
    'Activations': ['ReLU', 'Softmax', 'Sigmoid', 'Tanh']
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
        id: Date.now(), // Unique ID for key
        type: layerType,
        params: {} // Placeholder for future parameters
      };
      setDroppedLayers([...droppedLayers, newLayer]);
    }
  };

  // Helper to remove a layer
  const removeLayer = (idToRemove) => {
    setDroppedLayers(droppedLayers.filter(layer => layer.id !== idToRemove));
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
                {layers.filter(l => l.toLowerCase().includes(searchTerm.toLowerCase())).map(layer => (
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

        {/* --- Right Column: Canvas --- */ }
        <div className="right-canvas">
          <div className="canvas-header">
            <h2 className="canvas-title">Model Builder</h2>
            <p className="canvas-subtitle">Drag layers from the left to build your architecture</p>
          </div>

          <div 
            className={`architecture-area ${isDraggingOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {droppedLayers.length === 0 ? (
              <div className="drag-placeholder">
                <span className="placeholder-icon">🏗️</span>
                <h3>Drag layers here</h3>
                <p className="placeholder-text">Start by adding an Input layer</p>
              </div>
            ) : (
              <div className="model-stack">
                {droppedLayers.map((layer, index) => (
                  <div key={layer.id} className="dropped-layer-card">
                    <div className="layer-info">
                      <span className="layer-index">{index + 1}</span>
                      <span className="layer-type">{layer.type}</span>
                    </div>
                    <button 
                      className="remove-layer-btn"
                      onClick={() => removeLayer(layer.id)}
                      title="Remove Layer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="action-buttons">
            <button className="export-btn">Export Code</button>
            <button className="save-model-btn">Train Model</button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default BuildModels;