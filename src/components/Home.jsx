import './Home.css';
import HyperspeedBackground from './HyperspeedBackground';

function Home() {
  return (
    <div className="home-container">
      <HyperspeedBackground />
      <div className="hero-section">
        <div className="hero-content-home">
          <h1 className="hero-title">Welcome to Layr Platform</h1>
          <p className="hero-subtitle">
            Empowering innovation through advanced model building and analytics
          </p>
        </div>
      </div>

      <div className="about-section">
        <div className="about-container">
          <h2 className="section-title">About Us</h2>
          
          <div className="about-description">
            <p>
              Layr is an innovative platform that revolutionizes the way you build deep learning models. 
              Our drag-and-drop interface allows you to visually design and construct complex neural networks 
              without writing a single line of code initially. Simply drag layers, configure parameters, and 
              connect components to create your model architecture. Once you're satisfied with your design, 
              Layr automatically generates clean, production-ready implementation code that you can use directly 
              in your projects. Whether you're a beginner exploring machine learning or an experienced developer 
              looking to accelerate your workflow, Layr makes deep learning model creation intuitive, efficient, 
              and accessible to everyone.
            </p>
          </div>

          <div className="features-section">
            <h3 className="features-title">Key Features</h3>
            <div className="features-grid">
              <div className="feature-item">
                <span className="feature-icon">✨</span>
                <span>Intuitive Interface</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔒</span>
                <span>Secure & Private</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⚡</span>
                <span>Fast Performance</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📊</span>
                <span>Advanced Analytics</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🤝</span>
                <span>Team Collaboration</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🌐</span>
                <span>Cloud-Based</span>
              </div>
            </div>
          </div>

          <div className="cta-section">
            <h3>Ready to Get Started?</h3>
            <p>Explore our model building tools and start creating amazing projects today!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
