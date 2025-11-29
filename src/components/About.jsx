import React from 'react';
import './About.css';

function About({ onTabChange }) {
  return (
    <div className="about-container">
      
      {/* Hero Section */}
      <div className="about-hero-wrapper">
        <div className="about-hero-card">
          <div className="about-hero-content">
            <h1 className="about-hero-title">DL Builder</h1>
            <p className="about-hero-subtitle">
              A platform for designing and deploying deep learning models.
            </p>
            <button 
              className="about-btn"
              onClick={() => onTabChange && onTabChange('build')}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="about-content-wrapper">
        
        <section className="text-section">
          <h2>About Our Project</h2>
          <p>
            DL Builder is a comprehensive platform designed to streamline the process of creating, training, and deploying deep learning models. Our goal is to provide a user-friendly environment that caters to both beginners and experienced practitioners in the field of artificial intelligence.
          </p>
        </section>

        <section className="text-section">
          <h2>Why This Website Is Needed</h2>
          <p>
            The field of deep learning is rapidly evolving, but the tools available for model development and deployment can be complex and fragmented. DL Builder addresses this need by offering an integrated solution that simplifies the workflow, reduces development time, and enhances collaboration among team members.
          </p>
        </section>

        <section className="text-section">
          <h2>Problems We Solve</h2>
          <p>DL Builder tackles several key challenges in deep learning development, including:</p>
          <ul>
            <li>Complexity of Model Design: We provide intuitive interfaces and pre-built components to simplify the process of designing complex neural network architectures.</li>
            <li>Difficulties in Model Training: Our platform offers tools for efficient data management, model training, and performance monitoring.</li>
            <li>Challenges in Model Deployment: We streamline the deployment process, allowing users to easily integrate their models into various applications and environments.</li>
            <li>Lack of Collaboration: DL Builder supports team collaboration with features for sharing models, datasets, and results.</li>
          </ul>
        </section>

        <section className="text-section">
          <h2>Project Objectives</h2>
          <p>Our primary objectives for DL Builder include:</p>
          <ul>
            <li>Making deep learning accessible to a wider audience by simplifying the development process.</li>
            <li>Providing tools that enable faster iteration and experimentation in deep learning research and development.</li>
            <li>Streamlining workflows to improve the efficiency of deep learning practitioners.</li>
            <li>Creating a platform that facilitates teamwork and knowledge sharing within the deep learning community.</li>
          </ul>
        </section>

        <section className="text-section">
          <h2>Development Team</h2>
          <div className="team-names">
            Muntazar, Abubakar, and Muhammad Ahmad
          </div>
        </section>

        <section className="text-section">
          <h2>Success Criteria</h2>
          <p>We will measure the success of DL Builder based on the following criteria:</p>
          <ul>
            <li>User Adoption: The number of active users and projects created on the platform.</li>
            <li>User Satisfaction: Feedback from users regarding the usability and effectiveness of the platform.</li>
            <li>Model Deployment: The number of models successfully deployed using DL Builder.</li>
            <li>Community Engagement: The level of interaction and collaboration within the DL Builder community.</li>
          </ul>
        </section>

      </div>
    </div>
  );
}

export default About;