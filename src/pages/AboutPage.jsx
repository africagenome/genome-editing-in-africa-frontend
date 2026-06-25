// pages/AboutPage.jsx

import React, { useState, useEffect } from 'react';
import './AboutPage.css';

const AboutPage = ({ onBackClick }) => {
  const [activeTab, setActiveTab] = useState('overview');

  // Timeline data
  const timelineData = [
    { year: '2021', title: 'Inception', description: 'Genome Editing Database for Agricultural Development in Africa was conceptualized as a flagship program under AUDA-NEPAD to advance genome editing research in Africa.' },
    { year: '2022', title: 'Stakeholder Engagement', description: 'Extensive consultations with African governments, research institutions, and international partners to define the program\'s strategic direction.' },
    { year: '2023', title: 'Program Launch', description: 'Official launch of Genome Editing Database for Agricultural Development in Africa at the AUDA-NEPAD headquarters in Midrand, South Africa.' },
    { year: '2024', title: 'First Projects', description: 'Inaugural cohort of genome editing projects initiated across 16 African countries.' },
    { year: '2025', title: 'Capacity Building', description: 'Establishment of training programs and partnerships with leading research institutions globally.' },
    { year: '2026', title: 'Current Phase', description: 'Expanding network, advancing research, and building Africa\'s genome editing ecosystem.' }
  ];

  // Leadership team data
  const leadershipData = [
    {
      name: 'Dr. Sarah Okonkwo',
      title: 'Director, Genome Editing Programme',
      institution: 'AUDA-NEPAD',
      bio: 'Dr. Okonkwo is a leading expert in agricultural biotechnology with over 20 years of experience in genome editing research and policy development across Africa.',
      image: null
    },
    {
      name: 'Prof. James Mwangi',
      title: 'Technical Lead',
      institution: 'University of Nairobi',
      bio: 'Prof. Mwangi specializes in CRISPR-Cas9 applications for crop improvement and has published extensively on genome editing in African agriculture.',
      image: null
    },
    {
      name: 'Dr. Amina Diallo',
      title: 'Policy & Regulatory Lead',
      institution: 'African Union Commission',
      bio: 'Dr. Diallo is a regulatory expert with a focus on biosafety frameworks and genome editing governance in African countries.',
      image: null
    },
    {
      name: 'Dr. Thabo Molefe',
      title: 'Research & Innovation Lead',
      institution: 'ARC South Africa',
      bio: 'Dr. Molefe leads research initiatives focused on developing gene-edited crops for enhanced resilience and nutrition in Sub-Saharan Africa.',
      image: null
    }
  ];

  // Key pillars data
  const pillarsData = [
    {
      id: 'research',
      title: 'Research & Innovation',
      icon: 'fa-flask',
      color: '#5B7E96',
      description: 'Advancing cutting-edge genome editing research to address Africa\'s agricultural and health challenges.',
      points: [
        'Development of climate-resilient crops',
        'Gene-editing for disease resistance',
        'Nutritional enhancement of staple foods',
        'Human health applications'
      ]
    },
    {
      id: 'capacity',
      title: 'Capacity Building',
      icon: 'fa-graduation-cap',
      color: '#B4A269',
      description: 'Building Africa\'s expertise in genome editing through training, mentorship, and knowledge exchange.',
      points: [
        'Training programs for researchers',
        'Workshops and seminars',
        'International exchange programs',
        'Infrastructure development'
      ]
    },
    {
      id: 'policy',
      title: 'Policy & Governance',
      icon: 'fa-gavel',
      color: '#e74c3c',
      description: 'Developing robust regulatory frameworks and governance mechanisms for responsible genome editing.',
      points: [
        'Regulatory framework development',
        'Ethics and biosafety guidelines',
        'Stakeholder engagement',
        'International alignment'
      ]
    },
    {
      id: 'collaboration',
      title: 'Partnerships & Collaboration',
      icon: 'fa-handshake',
      color: '#2C6E49',
      description: 'Forging strategic partnerships to accelerate genome editing innovation and adoption.',
      points: [
        'South-South cooperation',
        'International research partnerships',
        'Public-private partnerships',
        'Knowledge sharing networks'
      ]
    }
  ];

  // Partners data
  const partnersData = [
    { name: 'AUDA-NEPAD', logo: null, type: 'Implementing Partner' },
    { name: 'African Union Commission', logo: null, type: 'Strategic Partner' },
    { name: 'CGIAR', logo: null, type: 'Research Partner' },
    { name: 'IITA', logo: null, type: 'Research Partner' },
    { name: 'KALRO', logo: null, type: 'National Partner' },
    { name: 'University of Nairobi', logo: null, type: 'Academic Partner' },
    { name: 'ARC South Africa', logo: null, type: 'Research Partner' },
    { name: 'CSIR', logo: null, type: 'Research Partner' }
  ];

  // Statistics data
  const statsData = [
    { value: '16', label: 'African Countries', icon: 'fa-globe-africa' },
    { value: '47', label: 'Active Projects', icon: 'fa-project-diagram' },
    { value: '200+', label: 'Researchers Trained', icon: 'fa-users' },
    { value: '$48M', label: 'Investment 2025-27', icon: 'fa-coins' },
    { value: '24', label: 'Partner Institutions', icon: 'fa-university' },
    { value: '12', label: 'Publications', icon: 'fa-file-alt' }
  ];

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="about-page">  
      {/* ===== MISSION SECTION ===== */}
      <section id="mission" className="mission-section">
        <div className="container">
          <div className="mission-content">
            <div className="mission-text">
              <span className="section-tag">About Genome Editing Database for Agricultural Development in Africa</span>
              <h2>Advancing Genome Editing <span className="highlight">for Africa's Future</span></h2>
              <p>
                Genome Editing Database for Agricultural Development in Africa is committed to building a sustainable genome editing ecosystem in Africa 
                that delivers tangible benefits for farmers, consumers, and the environment.
              </p>
              <ul className="mission-list">
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Promote responsible genome editing research and innovation</span>
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Build human and institutional capacity across the continent</span>
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Develop and support robust regulatory frameworks</span>
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Foster partnerships and knowledge sharing</span>
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Ensure ethical and equitable access to genome editing benefits</span>
                </li>
                <li>
                  <i className="fas fa-check-circle"></i>
                  <span>Contribute to Agenda 2063 and the Sustainable Development Goals</span>
                </li>
              </ul>
            </div>
            <div className="mission-visual">
              <div className="mission-image-placeholder">
                <i className="fas fa-dna"></i>
                <p>Agenda 2063</p>
                <small>The Africa We Want</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PILLARS SECTION ===== */}
      <section id="pillars" className="pillars-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Strategic Pillars</span>
            <h2 className="section-title">Our <span className="highlight">Core Focus Areas</span></h2>
            <p className="section-subtitle">
              Genome Editing Database for Agricultural Development in Africa's work is organized around four interconnected pillars that drive our impact.
            </p>
          </div>

          <div className="pillars-grid">
            {pillarsData.map((pillar) => (
              <div key={pillar.id} className="pillar-card">
                <div className="pillar-header" style={{ borderBottomColor: pillar.color }}>
                  <div className="pillar-icon" style={{ backgroundColor: pillar.color }}>
                    <i className={`fas ${pillar.icon}`}></i>
                  </div>
                  <h3>{pillar.title}</h3>
                </div>
                <p className="pillar-description">{pillar.description}</p>
                <ul className="pillar-points">
                  {pillar.points.map((point, idx) => (
                    <li key={idx}>
                      <i className="fas fa-check-circle" style={{ color: pillar.color }}></i>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ===== CTA SECTION ===== */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Join Us in <span className="highlight">Advancing Genome Editing</span> for Africa</h2>
            <p>
              Whether you're a researcher, policymaker, student, or partner, there are many ways 
              to get involved with Genome Editing Database for Agricultural Development in Africa.
            </p>
            <div className="cta-actions">
              <button className="btn-primary">
                <i className="fas fa-handshake"></i> Partner with Us
              </button>
              <button className="btn-secondary">
                <i className="fas fa-envelope"></i> Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default AboutPage;