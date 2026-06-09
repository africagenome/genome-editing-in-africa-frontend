import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import backgroundImage from '../../assets/images/background.jpg';
import backgroundImageMobile from '../../assets/images/background.jpg';

const Hero = ({ onOpenModal }) => {
  const [currentBgImage, setCurrentBgImage] = useState(backgroundImage);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCurrentBgImage(backgroundImageMobile);
      } else {
        setCurrentBgImage(backgroundImage);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const heroStyle = {
    position: 'relative',
    background: `linear-gradient(135deg, rgba(45,74,94,0.88) 0%, rgba(91,126,150,0.82) 100%), url(${currentBgImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    padding: '100px 0 110px',
    color: 'white',
    marginBottom: 0
  };

  return (
    <section style={heroStyle}>
      <div className="container">
        <div className="hero-content">
          <div className="hero-badge">
            <i class="fa-solid fa-dna"></i>Science for African Renaissance
          </div>
          <h2 style={{ color: 'white' }}>
            Genome Editing in Africa:<br /> 
            <span className="hero-highlight">Innovation & Resilience</span>
          </h2>
          <p className="hero-desc">
            Leveraging next-generation biotechnologies to transform food security, 
            eradicate genetic diseases, and build climate resilience — fully aligned with Agenda 2063.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Button variant="primary" href="#">
              Explore Action Plan <i className="fas fa-arrow-right"></i>
            </Button>
            <Button variant="outline-light" onClick={onOpenModal}>
              <i className="fas fa-search"></i> Advanced Search
            </Button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">17</div>
              <div>Member States Active</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">$48M</div>
              <div>Investment 2025-27</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">47</div>
              <div>Active Projects</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;