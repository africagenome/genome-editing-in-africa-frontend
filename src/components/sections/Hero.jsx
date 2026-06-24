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
          <h2 style={{ color: 'white' }}>Genome Editing in Africa </h2> <br />
            <h3><span className="hero-highlight">Prosperity | Food security | Climate resilience </span>
          </h3>
          <br />
          <p className="hero-desc">
            Advancing Agenda 2063’s vision of a prosperous, food-secure, and climate-resilient Africa through responsible genome editing, innovation, sustainable food systems and agricultural transformation.
          </p>
          
         
        </div>
      </div>
    </section>
  );
};

export default Hero;