// components/layout/TopBar.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import LanguageSwitcher from '../navigation/LanguageSwitcher';

const TopBar = ({ 
  onLanguageChange, 
  onOpenModal,
  // Navigation handlers
  onProjectsClick,
  onCountriesClick,
  onStakeholdersClick,
  onInfrastructureClick,
  onExpertsClick,
  onRegulatoryClick,
  onDashboardClick,
  // Sub-navigation handlers
  // onStrategyClick,
  // onEthicsClick,
  // onPublicationsClick,
  // onEventsClick,
  onAboutClick,
  onContactClick,
  currentPage = '/'
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Handle scroll effect with debouncing
  useEffect(() => {
    let timeoutId;
    const handleScroll = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        setScrolled(window.scrollY > 10);
        timeoutId = null;
      }, 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
        }
        setOpenDropdown(null);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openDropdown && !e.target.closest('.nav-dropdown')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openDropdown]);

  const isActive = useCallback((path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  }, [location.pathname]);

  const handleLogoClick = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (onClick, closeMobile = true) => {
    onClick?.();
    if (closeMobile) {
      setMobileMenuOpen(false);
      setOpenDropdown(null);
    }
  };

  // Grouped navigation structure
  const navGroups = [
    {
      id: 'explore',
      label: 'Explore',
      icon: 'fas fa-compass',
      items: [
        { 
          id: 'projects',
          path: '/projects',
          label: 'Projects', 
          icon: 'fas fa-project-diagram',
          onClick: onProjectsClick,
          color: '#5B7E96'
        },
        { 
          id: 'countries',
          path: '/countries',
          label: 'Countries', 
          icon: 'fas fa-globe-africa',
          onClick: onCountriesClick,
          color: '#B4A269'
        },
        { 
          id: 'stakeholders',
          path: '/stakeholders',
          label: 'Stakeholders', 
          icon: 'fas fa-handshake',
          onClick: onStakeholdersClick,
          color: '#2C6E49'
        },
        { 
          id: 'infrastructure',
          path: '/infrastructure',
          label: 'Infrastructure', 
          icon: 'fas fa-microscope',
          onClick: onInfrastructureClick,
          color: '#6C9EBF'
        },
      ]
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: 'fas fa-book',
      items: [
        { 
          id: 'regulatory',
          path: '/regulatory-frameworks',
          label: 'Regulatory Frameworks', 
          icon: 'fas fa-gavel',
          onClick: onRegulatoryClick,
          color: '#e74c3c'
        },
        { 
          id: 'experts',
          path: '/experts',
          label: 'Experts Directory', 
          icon: 'fas fa-users',
          onClick: onExpertsClick,
          color: '#D4A373'
        },
        // { 
        //   id: 'publications',
        //   path: '/publications',
        //   label: 'Publications', 
        //   icon: 'fas fa-file-alt',
        //   onClick: onPublicationsClick,
        //   color: '#8B5CF6'
        // },
        // { 
        //   id: 'strategy',
        //   path: '/strategy',
        //   label: 'Strategic Roadmap', 
        //   icon: 'fas fa-road',
        //   onClick: onStrategyClick,
        //   color: '#10B981'
        // },
      ]
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: 'fas fa-chart-line',
      items: [
        { 
          id: 'dashboard',
          path: '/dashboard',
          label: 'Analytics Dashboard', 
          icon: 'fas fa-chart-pie',
          onClick: onDashboardClick,
          color: '#8B5CF6'
        },
        // { 
        //   id: 'ethics',
        //   path: '/ethics',
        //   label: 'Ethics Framework', 
        //   icon: 'fas fa-balance-scale',
        //   onClick: onEthicsClick,
        //   color: '#F59E0B'
        // },
        // { 
        //   id: 'events',
        //   path: '/events',
        //   label: 'Events & Webinars', 
        //   icon: 'fas fa-calendar-alt',
        //   onClick: onEventsClick,
        //   color: '#EC4899'
        // },
      ]
    },
    {
      id: 'about',
      label: 'About',
      icon: 'fas fa-info-circle',
      items: [
        { 
          id: 'about-genada',
          path: '/about',
          label: 'About GENADA', 
          icon: 'fas fa-info-circle',
          onClick: onAboutClick,
          color: '#5B7E96'
        },
        { 
          id: 'contact',
          path: '/contact',
          label: 'Contact Us', 
          icon: 'fas fa-envelope',
          onClick: onContactClick,
          color: '#B4A269'
        },
      ]
    }
  ];

  // Flatten all items for mobile menu
  const allMobileItems = navGroups.flatMap(group => group.items);

  return (
    <>
      <header className={`top-bar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          {/* Logo Section */}
          <div 
            className="logo-section" 
            onClick={handleLogoClick}
            onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}
            role="link"
            tabIndex={0}
            aria-label="Go to homepage"
          >
            <div className="logo-wrapper">
              <img 
                src="/images/logo.png" 
                alt="AUDA-NEPAD Genome Editing in Africa" 
                className="logo-image"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://placehold.co/200x80?text=AUDA-NEPAD+Logo';
                }}
              />
              <div className="logo-text">
                <div className="logo-title">
                  Genome Editing Network for Agricultural Development in Africa (GENADA)
                </div>
                <span className="logo-subtitle">
                  African Union Development Agency · Agenda 2063
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="nav-section" aria-label="Main navigation">
            <div className="nav-links-desktop">
              {navGroups.map((group) => {
                const isGroupActive = group.items.some(item => isActive(item.path));
                const isOpen = openDropdown === group.id;

                return (
                  <div 
                    key={group.id}
                    className={`nav-dropdown ${isOpen ? 'open' : ''}`}
                    onMouseEnter={() => setOpenDropdown(group.id)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      className={`nav-dropdown-trigger ${isGroupActive ? 'active' : ''}`}
                      onClick={() => setOpenDropdown(isOpen ? null : group.id)}
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                    >
                      <i className={group.icon} aria-hidden="true"></i>
                      <span>{group.label}</span>
                      <i className={`fas fa-chevron-down dropdown-arrow ${isOpen ? 'rotated' : ''}`} aria-hidden="true"></i>
                    </button>

                    <div className="nav-dropdown-menu" role="menu">
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleNavClick(item.onClick)}
                          className={`nav-dropdown-item ${isActive(item.path) ? 'active' : ''}`}
                          style={{ '--nav-color': item.color }}
                          role="menuitem"
                          aria-current={isActive(item.path) ? 'page' : undefined}
                        >
                          <i className={item.icon} aria-hidden="true"></i>
                          <span>{item.label}</span>
                          {isActive(item.path) && (
                            <span className="dropdown-item-indicator" aria-hidden="true"></span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="nav-actions">
              <LanguageSwitcher onLanguageChange={onLanguageChange} />
              <button 
                onClick={onOpenModal} 
                className={`search-db-btn ${isActive('/search') ? 'active' : ''}`}
                aria-label="Open search database"
              >
                <i className="fas fa-database" aria-hidden="true"></i>
                <span>Search DB</span>
              </button>
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`} aria-hidden="true"></i>
          </button>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <div className="mobile-nav-items">
            {navGroups.map((group) => (
              <React.Fragment key={group.id}>
                <div className="mobile-nav-group">
                  <div className="mobile-nav-group-header">
                    <i className={group.icon} aria-hidden="true"></i>
                    <span className="mobile-nav-group-label">{group.label}</span>
                  </div>
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.onClick)}
                      className={`mobile-nav-item ${isActive(item.path) ? 'active' : ''}`}
                      style={{ '--nav-color': item.color }}
                      aria-current={isActive(item.path) ? 'page' : undefined}
                    >
                      <i className={item.icon} aria-hidden="true"></i>
                      <span>{item.label}</span>
                      {isActive(item.path) && (
                        <span className="mobile-nav-indicator" aria-hidden="true"></span>
                      )}
                    </button>
                  ))}
                </div>
                {group.id !== navGroups[navGroups.length - 1].id && (
                  <div className="mobile-nav-divider" aria-hidden="true"></div>
                )}
              </React.Fragment>
            ))}
            <div className="mobile-nav-divider" aria-hidden="true"></div>
            <div className="mobile-nav-actions">
              <LanguageSwitcher onLanguageChange={onLanguageChange} />
              <button 
                onClick={() => handleNavClick(onOpenModal)} 
                className="mobile-search-db-btn"
              >
                <i className="fas fa-database" aria-hidden="true"></i>
                <span>Search Database</span>
              </button>
            </div>
          </div>
        </nav>
      )}
    </>
  );
};

export default TopBar;