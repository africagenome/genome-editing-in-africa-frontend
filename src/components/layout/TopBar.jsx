import React, { useState, useEffect } from 'react';
import LanguageSwitcher from '../navigation/LanguageSwitcher';

const TopBar = ({ 
  onLanguageChange, 
  onOpenModal, 
  onProjectsClick, 
  onCountriesClick, 
  onSearchClick, 
  onStakeholdersClick, 
  onInfrastructureClick,
  onDashboardClick,
  onExpertsClick 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { 
      id: 'projects',
      label: 'Projects', 
      icon: 'fas fa-project-diagram',
      onClick: onProjectsClick,
      color: '#5B7E96'
    },
    { 
      id: 'countries',
      label: 'Countries', 
      icon: 'fas fa-globe-africa',
      onClick: onCountriesClick,
      color: '#B4A269'
    },
    { 
      id: 'stakeholders',
      label: 'Stakeholders', 
      icon: 'fas fa-handshake',
      onClick: onStakeholdersClick,
      color: '#2C6E49'
    },
    { 
      id: 'infrastructure',
      label: 'Infrastructure', 
      icon: 'fas fa-microscope',
      onClick: onInfrastructureClick,
      color: '#6C9EBF'
    },
    { 
      id: 'experts',
      label: 'Experts', 
      icon: 'fas fa-users',
      onClick: onExpertsClick,
      color: '#D4A373'
    },
    { 
      id: 'dashboard',
      label: 'Analytics', 
      icon: 'fas fa-chart-line',
      onClick: onDashboardClick,
      color: '#8B5CF6'
    }
  ];

  return (
    <>
      <div className={`top-bar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          {/* Logo Section - Centered */}
          <div className="logo-section">
            <div className="logo-wrapper">
              <img 
                src="/images/logo.png" 
                alt="AUDA-NEPAD Genome Editing Programme" 
                className="logo-image"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/200x80?text=AUDA-NEPAD+Logo';
                }}
              />
              <div className="logo-text">
                <h1>Genome Editing Programme</h1>
                <span>African Union Development Agency · Agenda 2063</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation - Below Logo */}
          <div className="nav-section">
            <div className="nav-links-desktop">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  className="nav-item"
                  style={{ '--nav-color': item.color }}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            
            <div className="nav-actions">
              <LanguageSwitcher onLanguageChange={onLanguageChange} />
              <button onClick={onOpenModal} className="search-db-btn">
                <i className="fas fa-database"></i>
                <span>Search DB</span>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-nav">
          <div className="mobile-nav-items">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  item.onClick();
                  setMobileMenuOpen(false);
                }}
                className="mobile-nav-item"
                style={{ '--nav-color': item.color }}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </button>
            ))}
            <div className="mobile-nav-actions">
              <LanguageSwitcher onLanguageChange={onLanguageChange} />
              <button onClick={onOpenModal} className="mobile-search-db-btn">
                <i className="fas fa-database"></i>
                <span>Search Database</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TopBar;