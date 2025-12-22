import "./Home.css";

// Feature Card Component (without icon)
const FeatureCard = ({ text, index }) => (
  <div className="feature-card" style={{ animationDelay: `${index * 0.15}s` }}>
    <span className="feature-text">{text}</span>
  </div>
);

// 3. Main Home Component
function Home({ onTabChange }) {
  const features = [
    "No-code model building",
    "Automated training",
    "One-click deployment",
    "Real-time monitoring",
  ];

  const useCases = [
    "Image classification",
    "Object detection",
    "Semantic segmentation",
    "Instance segmentation",
    "Image generation",
    "Text classification",
    "Text generation",
    "Text summarization",
    "Text translation",
    "Speech recognition",
    "Speech synthesis",
    "Time series forecasting",
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-wrapper">
        <div className="hero-card">
          <div className="hero-content">
            <h1 className="hero-title">Build, train, and deploy AI models</h1>
            <p className="hero-subtitle">
              DL Builder is a low-code platform that enables you to build,
              train, and deploy AI models without writing code. It's perfect for
              beginners and experts alike.
            </p>
            <button
              className="primary-btn"
              onClick={() => onTabChange && onTabChange("build")}
            >
              Model Builder
            </button>
          </div>
        </div>
      </div>

      {/* Powerful Features */}
      <div className="content-section">
        <h2 className="section-label">Powerful Features</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <FeatureCard key={index} text={feature} index={index} />
          ))}
        </div>
      </div>

      {/* Perfect For Every Use Case */}
      <div className="content-section">
        <h2 className="section-label">Perfect For Every Use Case</h2>
        <div className="use-case-grid">
          {useCases.map((useCase, index) => (
            <FeatureCard key={index} text={useCase} />
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bottom-cta">
        <h3>Start building your AI model today</h3>
        <button
          className="primary-btn"
          onClick={() => onTabChange && onTabChange("build")}
        >
          Model Builder
        </button>
      </div>
    </div>
  );
}

export default Home;
