// pages/ExpertsPage.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useData } from '../context/DataContext';
import apiService from '../services/apiService';
import './ExpertsPage.css';

// ============================================
// SEARCHABLE DROPDOWN COMPONENT
// ============================================
const SearchableDropdown = ({ 
  options = [], 
  value = '', 
  onChange, 
  placeholder = 'Search...', 
  label = '', 
  icon = null,
  showCounts = true,
  disabled = false,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredOptions = (options || []).filter(opt => {
    if (!opt) return false;
    const labelStr = opt.label?.toString()?.toLowerCase() || '';
    const searchStr = searchTerm?.toString()?.toLowerCase() || '';
    return labelStr.includes(searchStr);
  });

  const selectedOption = (options || []).find(opt => {
    if (!opt) return false;
    const optValue = opt.value?.toString() || '';
    const currentValue = value?.toString() || '';
    return optValue === currentValue;
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSelect = (option) => {
    onChange(option?.value || '');
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredOptions.length > 0) {
      handleSelect(filteredOptions[0]);
    }
  };

  const displayValue = selectedOption?.label?.toString() || '';

  return (
    <div className={`searchable-dropdown ${compact ? 'compact' : ''}`} ref={dropdownRef}>
      <div className="dropdown-label">
        {icon && <i className={icon}></i>}
        <span>{label}</span>
        {selectedOption && !isOpen && (
          <span className="dropdown-selected-value">{displayValue}</span>
        )}
      </div>
      <div 
        className={`dropdown-input-wrapper ${isOpen ? 'focused' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <input
          type="text"
          placeholder={placeholder}
          value={isOpen ? searchTerm : displayValue}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => !disabled && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="dropdown-input"
          disabled={disabled}
          readOnly={!isOpen}
          aria-label={`Search ${label}`}
          autoComplete="off"
        />
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} dropdown-arrow`}></i>
        {selectedOption && !isOpen && value && (
          <button 
            className="dropdown-clear"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            aria-label={`Clear ${label} filter`}
          >
            <i className="fas fa-times-circle"></i>
          </button>
        )}
      </div>
      {isOpen && (
        <div className="dropdown-options" role="listbox">
          <div 
            className={`dropdown-option all-option ${!value ? 'selected' : ''}`} 
            onClick={() => handleSelect({ value: '' })}
            role="option"
            aria-selected={!value}
          >
            <span>All {label}</span>
            {!value && <i className="fas fa-check option-check"></i>}
          </div>
          {filteredOptions.length === 0 ? (
            <div className="dropdown-no-results">No options found</div>
          ) : (
            filteredOptions.map((option, index) => {
              const isSelected = value?.toString() === option.value?.toString();
              const optionKey = option.value?.toString() || `option-${index}`;
              return (
                <div
                  key={optionKey}
                  className={`dropdown-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(option)}
                  role="option"
                  aria-selected={isSelected}
                >
                  {option.color && <span className="status-color-dot" style={{ backgroundColor: option.color }}></span>}
                  <span>{option.label?.toString() || 'Unknown'}</span>
                  {showCounts && option.count !== undefined && (
                    <span className="option-count">{option.count}</span>
                  )}
                  {isSelected && (
                    <i className="fas fa-check option-check"></i>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN EXPERTS COMPONENT
// ============================================
const ExpertsPage = ({ onBackClick }) => {
  const { countries } = useData();
  const [experts, setExperts] = useState([]);
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  // Filter states
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('');
  
  const [filterOptions, setFilterOptions] = useState({
    sectors: [],
    countries: [],
    expertise: []
  });

  // Sector color mapping
  const sectorColors = {
    'Research': '#3B82F6',
    'Regulatory': '#EF4444',
    'Policy': '#F59E0B',
    'Private': '#10B981',
    'Academia': '#8B5CF6',
    'Civil Society': '#14B8A6'
  };

  const sectorIcons = {
    'Research': 'fa-flask',
    'Regulatory': 'fa-gavel',
    'Policy': 'fa-file-signature',
    'Private': 'fa-building',
    'Academia': 'fa-university',
    'Civil Society': 'fa-handshake'
  };

  // ===== VIEW MODE HANDLER =====
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  // ===== FETCH EXPERTS =====
  const fetchExperts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getExperts({ limit: 100, is_verified: true });
      const expertsData = response.results || response || [];

      const enrichedExperts = expertsData.map(expert => ({
        id: expert.id,
        name: expert.name,
        title: expert.title || 'Researcher',
        institution: expert.institution_name || 'Unknown Institution',
        country: expert.country_name || 'Unknown',
        region: expert.country?.region?.name || 'Africa',
        sector: expert.sector || 'Research',
        expertise: expert.expertise || [],
        bio: expert.bio || `${expert.name} is a genome editing expert in Africa.`,
        fullBio: expert.bio || `${expert.name} is a genome editing expert in Africa.`,
        email: expert.email || 'contact@institution.org',
        phone: expert.phone || 'N/A',
        linkedin: expert.linkedin || '#',
        twitter: expert.twitter || '',
        publications: expert.publications_count || 0,
        projects: expert.projects_count || 0,
        education: expert.education || 'Not specified',
        awards: expert.awards || [],
        is_verified: expert.is_verified,
        is_featured: expert.is_featured,
        profile_image: expert.profile_image || null,
        institution_id: expert.institution,
        country_id: expert.country,
        originalData: expert
      }));

      setExperts(enrichedExperts);
      setFilteredExperts(enrichedExperts);

      // Build filter options
      const sectors = [...new Set(enrichedExperts.map(e => e.sector))].map(sector => ({
        value: sector,
        label: sector,
        count: enrichedExperts.filter(e => e.sector === sector).length,
        color: sectorColors[sector] || '#6B7280'
      }));

      const countries = [...new Set(enrichedExperts.map(e => e.country))].filter(c => c !== 'Unknown').map(country => ({
        value: country,
        label: country,
        count: enrichedExperts.filter(e => e.country === country).length
      }));

      const expertise = [];
      const expertiseMap = {};
      enrichedExperts.forEach(e => {
        if (e.expertise && Array.isArray(e.expertise)) {
          e.expertise.forEach(exp => {
            if (exp) {
              if (!expertiseMap[exp]) {
                expertiseMap[exp] = 0;
              }
              expertiseMap[exp]++;
            }
          });
        }
      });
      Object.keys(expertiseMap).forEach(exp => {
        expertise.push({
          value: exp,
          label: exp,
          count: expertiseMap[exp]
        });
      });
      expertise.sort((a, b) => a.label.localeCompare(b.label));

      setFilterOptions({
        sectors,
        countries,
        expertise
      });

    } catch (err) {
      console.error('Error fetching experts:', err);
      setError(err.message || 'Failed to load experts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== FETCH ON MOUNT =====
  useEffect(() => {
    fetchExperts();
  }, [fetchExperts]);

  // ===== APPLY FILTERS =====
  const applyFilters = useCallback(() => {
    let results = [...experts];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(e => 
        e.name?.toLowerCase().includes(term) ||
        e.title?.toLowerCase().includes(term) ||
        e.institution?.toLowerCase().includes(term) ||
        e.bio?.toLowerCase().includes(term) ||
        e.expertise?.some(exp => exp?.toLowerCase().includes(term))
      );
    }

    if (selectedSector) {
      results = results.filter(e => e.sector === selectedSector);
    }

    if (selectedCountry) {
      results = results.filter(e => e.country === selectedCountry);
    }

    if (selectedExpertise) {
      results = results.filter(e => 
        e.expertise && e.expertise.includes(selectedExpertise)
      );
    }

    setFilteredExperts(results);
  }, [experts, searchTerm, selectedSector, selectedCountry, selectedExpertise]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // ===== RESET FILTERS =====
  const resetFilters = () => {
    setSelectedSector('');
    setSelectedCountry('');
    setSelectedExpertise('');
    setSearchTerm('');
  };

  // ===== COUNT ACTIVE FILTERS =====
  const activeFilterCount = [selectedSector, selectedCountry, selectedExpertise, searchTerm].filter(f => f).length;

  // ===== TOGGLE FILTER =====
  const toggleFilterSidebar = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
  };

  // ===== HELPER FUNCTIONS =====
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getSectorIcon = (sector) => {
    return sectorIcons[sector] || 'fa-user';
  };

  const getSectorColor = (sector) => {
    return sectorColors[sector] || '#6B7280';
  };

  const getSectorBadgeClass = (sector) => {
    const classes = {
      'Research': 'sector-research',
      'Regulatory': 'sector-regulatory',
      'Policy': 'sector-policy',
      'Private': 'sector-private',
      'Academia': 'sector-academia',
      'Civil Society': 'sector-civil'
    };
    return classes[sector] || '';
  };

  // ===== STATS =====
  const stats = {
    total: experts.length,
    countries: new Set(experts.map(e => e.country)).size,
    institutions: new Set(experts.map(e => e.institution)).size,
    regulatory: experts.filter(e => e.sector === 'Regulatory').length
  };

  // ===== LOADING STATE =====
  if (loading && !experts.length) {
    return (
      <div className="experts-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading experts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="experts-page">
      {/* Back Button */}
      <button className="back-to-home" onClick={onBackClick} aria-label="Back to home">
        <i className="fas fa-arrow-left"></i>
        <span>Back to Home</span>
      </button>

      {/* ===== HEADER ===== */}
      <header className="experts-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <h1 className="page-title">
                <span className="title-icon"><i className="fas fa-users"></i></span>
                <span className="title-text">Expert Directory & Network</span>
              </h1>
              <p className="page-subtitle">
                Connect with leading genome editing researchers, regulators, and policymakers across Africa
              </p>
            </div>
            <div className="header-right">
              <button 
                className={`filter-toggle-btn ${isMobileFilterOpen ? 'active' : ''}`}
                onClick={toggleFilterSidebar}
                aria-expanded={isMobileFilterOpen}
                aria-label="Toggle filters"
              >
                <i className="fas fa-sliders-h"></i>
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="filter-badge">{activeFilterCount}</span>
                )}
                <i className={`fas fa-chevron-${isMobileFilterOpen ? 'up' : 'down'}`}></i>
              </button>
            </div>
          </div>

          {/* ===== STATS - IMPROVED VISIBILITY ===== */}
          {!loading && !error && stats.total > 0 && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <i className="fas fa-user-graduate"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.total}</span>
                  <span className="stat-label">Registered Experts</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper active">
                  <i className="fas fa-globe-africa"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.countries}</span>
                  <span className="stat-label">Countries Represented</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper cft">
                  <i className="fas fa-university"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.institutions}</span>
                  <span className="stat-label">Research Institutions</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper funding">
                  <i className="fas fa-gavel"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.regulatory}</span>
                  <span className="stat-label">Regulatory Experts</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <div className="container main-content">
        {/* ===== FILTER SIDEBAR ===== */}
        <aside className={`filter-sidebar ${isMobileFilterOpen ? 'open' : ''}`}>
          <div className="filter-sidebar-header">
            <h3>
              <i className="fas fa-sliders-h"></i> Filters
              {activeFilterCount > 0 && (
                <span className="filter-count-badge">{activeFilterCount} active</span>
              )}
            </h3>
            <button 
              className="close-sidebar" 
              onClick={() => setIsMobileFilterOpen(false)}
              aria-label="Close filters"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="filter-sidebar-body">
            {/* Search */}
            <div className="filter-group">
              <label className="filter-label" htmlFor="search-experts">
                <i className="fas fa-search"></i> Search
              </label>
              <input
                id="search-experts"
                type="text"
                placeholder="Search experts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
                aria-label="Search experts"
              />
            </div>

            {/* Sector */}
            <div className="filter-group">
              <SearchableDropdown
                label="Sector"
                icon="fas fa-building"
                placeholder="Search sectors..."
                options={filterOptions.sectors}
                value={selectedSector}
                onChange={(value) => setSelectedSector(value)}
                showCounts={true}
              />
            </div>

            {/* Country */}
            <div className="filter-group">
              <SearchableDropdown
                label="Country"
                icon="fas fa-map-marker-alt"
                placeholder="Search countries..."
                options={filterOptions.countries}
                value={selectedCountry}
                onChange={(value) => setSelectedCountry(value)}
                showCounts={true}
              />
            </div>

            {/* Expertise */}
            <div className="filter-group">
              <SearchableDropdown
                label="Area of Expertise"
                icon="fas fa-tags"
                placeholder="Search expertise..."
                options={filterOptions.expertise}
                value={selectedExpertise}
                onChange={(value) => setSelectedExpertise(value)}
                showCounts={true}
              />
            </div>

            <button 
              className="reset-filters-btn" 
              onClick={resetFilters}
              aria-label="Reset all filters"
            >
              <i className="fas fa-undo"></i> Reset All Filters
            </button>
          </div>
        </aside>

        {/* ===== EXPERTS GRID ===== */}
        <main className="experts-content">
          <div className="results-header">
            <div className="results-info">
              <span className="results-count">
                <strong>{filteredExperts.length}</strong> experts found
              </span>
              {activeFilterCount > 0 && (
                <span className="active-filters-badge">
                  <i className="fas fa-filter"></i>
                  {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                </span>
              )}
            </div>
            <div className="results-actions">
              <button 
                className="view-toggle"
                onClick={toggleFilterSidebar}
                aria-expanded={isMobileFilterOpen}
              >
                <i className={`fas fa-${isMobileFilterOpen ? 'times' : 'sliders-h'}`}></i>
                {isMobileFilterOpen ? 'Hide Filters' : 'Show Filters'}
              </button>
              
              {/* ===== VIEW TOGGLE BUTTONS ===== */}
              <div className="view-toggle-group">
                <button 
                  className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => toggleViewMode('grid')}
                  aria-label="Grid view"
                  title="Grid view"
                >
                  <i className="fas fa-th"></i>
                </button>
                <button 
                  className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => toggleViewMode('list')}
                  aria-label="List view"
                  title="List view"
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
            </div>
          </div>

          {error ? (
            <div className="error-message">
              <i className="fas fa-exclamation-circle error-icon"></i>
              <h3>Unable to load experts</h3>
              <p>{error}</p>
              <button onClick={fetchExperts} className="btn-primary">
                <i className="fas fa-redo"></i> Retry
              </button>
            </div>
          ) : (
            <>
              <div className={`experts-grid ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
                {filteredExperts.map((expert, index) => (
                  <div 
                    key={expert.id} 
                    className="expert-card"
                    onClick={() => setSelectedExpert(expert)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedExpert(expert)}
                    aria-label={`View profile for ${expert.name}`}
                  >
                    <div className="expert-card-header">
                      <div className="expert-avatar" style={{ backgroundColor: getSectorColor(expert.sector) }}>
                        {expert.profile_image ? (
                          <img src={expert.profile_image} alt={expert.name} className="expert-avatar-img" />
                        ) : (
                          getInitials(expert.name)
                        )}
                      </div>
                      <div className="expert-info">
                        <h3>{expert.name}</h3>
                        <div className="expert-title">{expert.title}</div>
                        <div className="expert-location">
                          <i className="fas fa-map-marker-alt"></i> {expert.country}
                        </div>
                      </div>
                      <span className={`sector-badge ${getSectorBadgeClass(expert.sector)}`}>
                        <i className={`fas ${getSectorIcon(expert.sector)}`}></i>
                        {expert.sector}
                      </span>
                    </div>

                    <div className="expert-body">
                      <div className="expert-expertise">
                        {expert.expertise && expert.expertise.slice(0, 3).map((exp, idx) => (
                          <span key={idx} className="expertise-tag">{exp}</span>
                        ))}
                        {expert.expertise && expert.expertise.length > 3 && (
                          <span className="expertise-tag more">+{expert.expertise.length - 3}</span>
                        )}
                      </div>
                      <div className="expert-bio">
                        {expert.bio && expert.bio.substring(0, 120)}...
                      </div>
                      <div className="expert-meta">
                        <span className="meta-item">
                          <i className="fas fa-file-alt"></i> {expert.publications} pubs
                        </span>
                        <span className="meta-item">
                          <i className="fas fa-project-diagram"></i> {expert.projects} projects
                        </span>
                        {expert.is_verified && (
                          <span className="verified-badge">
                            <i className="fas fa-check-circle"></i> Verified
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="expert-footer">
                      <span className="view-details">
                        View Profile <i className="fas fa-arrow-right"></i>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Results */}
              {filteredExperts.length === 0 && (
                <div className="no-results">
                  <i className="fas fa-users empty-icon"></i>
                  <h3>No experts found</h3>
                  <p>Try adjusting your search or filter criteria.</p>
                  <button className="clear-filters-btn" onClick={resetFilters}>
                    <i className="fas fa-undo"></i> Clear all filters
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ===== EXPERT DETAIL MODAL ===== */}
      {selectedExpert && (
        <div 
          className="modal-overlay" 
          onClick={() => setSelectedExpert(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="modal-container">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button 
                className="modal-close" 
                onClick={() => setSelectedExpert(null)}
                aria-label="Close expert profile"
              >
                <i className="fas fa-times"></i>
              </button>

              <div className="modal-body">
                <div className="modal-expert-header">
                  <div className="modal-avatar" style={{ backgroundColor: getSectorColor(selectedExpert.sector) }}>
                    {selectedExpert.profile_image ? (
                      <img src={selectedExpert.profile_image} alt={selectedExpert.name} className="modal-avatar-img" />
                    ) : (
                      getInitials(selectedExpert.name)
                    )}
                  </div>
                  <div className="modal-expert-info">
                    <h2 id="modal-title">{selectedExpert.name}</h2>
                    <p className="modal-title">{selectedExpert.title}</p>
                    <p><i className="fas fa-building"></i> {selectedExpert.institution}</p>
                    <p><i className="fas fa-map-marker-alt"></i> {selectedExpert.country}</p>
                    <div className="modal-badges">
                      <span className={`sector-badge ${getSectorBadgeClass(selectedExpert.sector)}`}>
                        <i className={`fas ${getSectorIcon(selectedExpert.sector)}`}></i>
                        {selectedExpert.sector}
                      </span>
                      {selectedExpert.is_verified && (
                        <span className="verified-badge">
                          <i className="fas fa-check-circle"></i> Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <h4><i className="fas fa-user-circle"></i> Biography</h4>
                  <p>{selectedExpert.fullBio || selectedExpert.bio || 'No biography available.'}</p>
                </div>

                <div className="modal-section">
                  <h4><i className="fas fa-tags"></i> Areas of Expertise</h4>
                  <div className="expert-expertise">
                    {selectedExpert.expertise && selectedExpert.expertise.map((exp, idx) => (
                      <span key={idx} className="expertise-tag">{exp}</span>
                    ))}
                  </div>
                </div>

                <div className="modal-stats">
                  <div className="modal-stat">
                    <div className="stat-value">{selectedExpert.publications || 0}</div>
                    <div className="stat-label">Publications</div>
                  </div>
                  <div className="modal-stat">
                    <div className="stat-value">{selectedExpert.projects || 0}</div>
                    <div className="stat-label">Active Projects</div>
                  </div>
                </div>

                {selectedExpert.education && selectedExpert.education !== 'Not specified' && (
                  <div className="modal-section">
                    <h4><i className="fas fa-graduation-cap"></i> Education</h4>
                    <p>{selectedExpert.education}</p>
                  </div>
                )}

                {selectedExpert.awards && selectedExpert.awards.length > 0 && (
                  <div className="modal-section">
                    <h4><i className="fas fa-trophy"></i> Awards & Recognition</h4>
                    <ul className="awards-list">
                      {selectedExpert.awards.map((award, idx) => (
                        <li key={idx}><i className="fas fa-award"></i> {award}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="modal-contact-section">
                  <h4><i className="fas fa-address-card"></i> Contact Information</h4>
                  {selectedExpert.email && selectedExpert.email !== 'contact@institution.org' && (
                    <p><i className="fas fa-envelope"></i> <a href={`mailto:${selectedExpert.email}`}>{selectedExpert.email}</a></p>
                  )}
                  {selectedExpert.phone && selectedExpert.phone !== 'N/A' && (
                    <p><i className="fas fa-phone"></i> {selectedExpert.phone}</p>
                  )}
                  <div className="social-links">
                    {selectedExpert.linkedin && selectedExpert.linkedin !== '#' && (
                      <a href={selectedExpert.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                        <i className="fab fa-linkedin"></i> LinkedIn
                      </a>
                    )}
                    {selectedExpert.twitter && selectedExpert.twitter !== '' && (
                      <a href={`https://twitter.com/${selectedExpert.twitter}`} target="_blank" rel="noopener noreferrer" className="social-link">
                        <i className="fab fa-twitter"></i> Twitter
                      </a>
                    )}
                    {selectedExpert.email && selectedExpert.email !== 'contact@institution.org' && (
                      <button 
                        className="contact-btn-primary"
                        onClick={() => window.location.href = `mailto:${selectedExpert.email}?subject=AUDA-NEPAD Genome Editing Network Inquiry`}
                      >
                        <i className="fas fa-envelope"></i> Send Message
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== FOOTER ===== */}
      <footer className="experts-footer">
        <div className="container">
          <div className="footer-content">
            <p>© {new Date().getFullYear()} AUDA-NEPAD Genome Editing Programme — Connect, collaborate, advance African science.</p>
            <button onClick={onBackClick} className="footer-back-btn">
              <i className="fas fa-home"></i> Back to Home
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ExpertsPage;