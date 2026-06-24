// pages/ContactPage.jsx

import React, { useState } from 'react';
import './ContactPage.css';

const ContactPage = ({ onBackClick }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real implementation, this would send the form data to a backend
    setFormStatus('success');
    setTimeout(() => {
      setFormStatus(null);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 5000);
  };

  // Contact information from official AUDA-NEPAD sources [citation:1][citation:4][citation:11]
  const contactInfo = {
    address: {
      street: '230, 15th Road',
      suburb: 'Midrand',
      city: 'Johannesburg',
      province: 'Gauteng',
      country: 'South Africa',
      postal: 'P. O. Box 218 Midrand, 1685'
    },
    phone: '+27 11 256 3600',
    email: 'info@nepad.org',
    procurement: 'procurement@nepad.org',
    communications: {
      senior: {
        name: 'Mwanja Ng\'anjo',
        title: 'Senior Communications Officer',
        email: 'Mwanjan@nepad.org',
        phone: '+27 11 256 3582'
      },
      assistant: {
        name: 'Millicent Seganoe',
        title: 'Communications Assistant',
        email: 'MillicentS@nepad.org',
        phone: '+27 11 256 3615'
      }
    },
    ceo: {
      name: 'Nardos Bekele-Thomas',
      title: 'Chief Executive Officer'
    },
    officeHours: '09:00 - 17:00 (South Africa Time)'
  };

  return (
    <div className="contact-page">
      {/* ===== BACK BUTTON ===== */}
      <button className="back-to-home" onClick={onBackClick} aria-label="Back to home">
        <i className="fas fa-arrow-left"></i>
        <span>Back to Home</span>
      </button>

      {/* ===== HERO SECTION ===== */}
      <section className="contact-hero">
        <div className="container">
          <div className="hero-content">
           
            <h1 className="hero-title">
              Contact <span className="hero-highlight">AUDA-NEPAD</span>
            </h1>
            
          </div>
        </div>
      </section>    

      {/* ===== MAP / LOCATION SECTION ===== */}
      <section className="location-section">
        <div className="container">
          <div className="location-content">
            <div className="location-text">
              <span className="section-tag">Visit Us</span>
              <h2>Find Us at <span className="highlight">AUDA-NEPAD Headquarters</span></h2>
              <p>
                The African Union Development Agency is headquartered in Midrand, 
                Johannesburg, South Africa.
              </p>
              <div className="location-details">
                <div className="location-item">
                  <i className="fas fa-building"></i>
                  <div>
                    <strong>Street Address</strong>
                    <p>230, 15th Road, Midrand, Johannesburg, Gauteng, South Africa</p>
                  </div>
                </div>
                <div className="location-item">
                  <i className="fas fa-mail-bulk"></i>
                  <div>
                    <strong>Postal Address</strong>
                    <p>P. O. Box 218 Midrand, 1685, South Africa</p>
                  </div>
                </div>
                <div className="location-item">
                  <i className="fas fa-clock"></i>
                  <div>
                    <strong>Office Hours</strong>
                    <p>Monday - Friday: 09:00 - 17:00 (South Africa Time)</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="location-map">
                <div className="map-container" style={{ width: '100%', height: '400px', overflow: 'hidden', borderRadius: '8px' }}>
                    <iframe
                    title="AUDA-NEPAD Headquarters Map"
                    src="https://maps.google.com/maps?q=-25.9986,28.1300&z=15&output=embed"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
                </div>
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Interested in <span className="highlight">Partnering</span> with GENADA?</h2>
            <p>
              Learn more about our genome editing programme and how you can collaborate with us.
            </p>
            <div className="cta-actions">
              <button className="btn-primary" onClick={() => window.location.href = '/about'}>
                <i className="fas fa-info-circle"></i> About GENADA
              </button>
              <button className="btn-secondary" onClick={() => window.location.href = '/projects'}>
                <i className="fas fa-project-diagram"></i> View Projects
              </button>
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default ContactPage;