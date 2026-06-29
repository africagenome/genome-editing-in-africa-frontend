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
  onAboutClick,
  onContactClick,
  onHomeClick,
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

  // ===== NAVIGATION STRUCTURE - FLAT MENU =====
  // Each top-level item is a direct link or dropdown
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: 'fas fa-home',
      path: '/',
      onClick: onHomeClick || handleLogoClick,
      isDirect: true,
      color: '#5B7E96'
    },
    {
      id: 'about',
      label: 'About',
      icon: 'fas fa-info-circle',
      isDirect: true,
      path: '/about',
      onClick: onAboutClick,
      color: '#5B7E96'
    },
    {
      id: 'explore',
      label: 'Explore',
      icon: 'fas fa-compass',
      isDropdown: true,
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
      isDropdown: true,
      items: [
        { 
          id: 'regulatory',
          path: '/regulatory-frameworks',
          label: 'Regulatory Frameworks', 
          icon: 'fas fa-gavel',
          onClick: onRegulatoryClick,
          color: '#e74c3c'
        },
        // { 
        //   id: 'experts',
        //   path: '/experts',
        //   label: 'Experts Directory', 
        //   icon: 'fas fa-users',
        //   onClick: onExpertsClick,
        //   color: '#D4A373'
        // },
      ]
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: 'fas fa-chart-line',
      isDirect: true,
      path: '/dashboard',
      onClick: onDashboardClick,
      color: '#8B5CF6'
    },
    {
      id: 'contact',
      label: 'Contact',
      icon: 'fas fa-envelope',
      isDirect: true,
      path: '/contact',
      onClick: onContactClick,
      color: '#B4A269'
    }
  ];

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
                  Genome Editing Database for Agricultural Development in Africa
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
              {navItems.map((item) => {
                // ===== DIRECT LINK ITEMS =====
                if (item.isDirect) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.onClick)}
                      className={`nav-item direct-nav-item ${isActive(item.path) ? 'active' : ''}`}
                      style={{ '--nav-color': item.color }}
                      aria-current={isActive(item.path) ? 'page' : undefined}
                    >
                      <i className={item.icon} aria-hidden="true"></i>
                      <span>{item.label}</span>
                      {isActive(item.path) && (
                        <span className="nav-indicator" aria-hidden="true"></span>
                      )}
                    </button>
                  );
                }

                // ===== DROPDOWN ITEMS =====
                if (item.isDropdown) {
                  const isGroupActive = item.items.some(subItem => isActive(subItem.path));
                  const isOpen = openDropdown === item.id;

                  return (
                    <div 
                      key={item.id}
                      className={`nav-dropdown ${isOpen ? 'open' : ''}`}
                      onMouseEnter={() => setOpenDropdown(item.id)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <button
                        className={`nav-dropdown-trigger ${isGroupActive ? 'active' : ''}`}
                        onClick={() => setOpenDropdown(isOpen ? null : item.id)}
                        aria-expanded={isOpen}
                        aria-haspopup="true"
                      >
                        <i className={item.icon} aria-hidden="true"></i>
                        <span>{item.label}</span>
                        <i className={`fas fa-chevron-down dropdown-arrow ${isOpen ? 'rotated' : ''}`} aria-hidden="true"></i>
                      </button>

                      <div className="nav-dropdown-menu" role="menu">
                        {item.items.map((subItem) => (
                          <button
                            key={subItem.id}
                            onClick={() => handleNavClick(subItem.onClick)}
                            className={`nav-dropdown-item ${isActive(subItem.path) ? 'active' : ''}`}
                            style={{ '--nav-color': subItem.color }}
                            role="menuitem"
                            aria-current={isActive(subItem.path) ? 'page' : undefined}
                          >
                            <i className={subItem.icon} aria-hidden="true"></i>
                            <span>{subItem.label}</span>
                            {isActive(subItem.path) && (
                              <span className="dropdown-item-indicator" aria-hidden="true"></span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }

                return null;
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
            {navItems.map((item) => {
              // ===== DIRECT LINK ITEMS (Mobile) =====
              if (item.isDirect) {
                return (
                  <React.Fragment key={item.id}>
                    <button
                      onClick={() => handleNavClick(item.onClick)}
                      className={`mobile-nav-item direct-mobile-item ${isActive(item.path) ? 'active' : ''}`}
                      style={{ '--nav-color': item.color }}
                      aria-current={isActive(item.path) ? 'page' : undefined}
                    >
                      <i className={item.icon} aria-hidden="true"></i>
                      <span>{item.label}</span>
                      {isActive(item.path) && (
                        <span className="mobile-nav-indicator" aria-hidden="true"></span>
                      )}
                    </button>
                    {item.id !== navItems[navItems.length - 1].id && (
                      <div className="mobile-nav-divider" aria-hidden="true"></div>
                    )}
                  </React.Fragment>
                );
              }

              // ===== DROPDOWN ITEMS (Mobile - expanded) =====
              if (item.isDropdown) {
                return (
                  <React.Fragment key={item.id}>
                    <div className="mobile-nav-group">
                      <div className="mobile-nav-group-header">
                        <i className={item.icon} aria-hidden="true"></i>
                        <span className="mobile-nav-group-label">{item.label}</span>
                      </div>
                      {item.items.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => handleNavClick(subItem.onClick)}
                          className={`mobile-nav-item ${isActive(subItem.path) ? 'active' : ''}`}
                          style={{ '--nav-color': subItem.color }}
                          aria-current={isActive(subItem.path) ? 'page' : undefined}
                        >
                          <i className={subItem.icon} aria-hidden="true"></i>
                          <span>{subItem.label}</span>
                          {isActive(subItem.path) && (
                            <span className="mobile-nav-indicator" aria-hidden="true"></span>
                          )}
                        </button>
                      ))}
                    </div>
                    {item.id !== navItems[navItems.length - 1].id && (
                      <div className="mobile-nav-divider" aria-hidden="true"></div>
                    )}
                  </React.Fragment>
                );
              }

              return null;
            })}
            
            {/* Search Database in Mobile */}
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