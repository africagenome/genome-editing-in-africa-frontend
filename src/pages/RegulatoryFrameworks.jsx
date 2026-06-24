// pages/RegulatoryFrameworks.jsx

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useData } from '../context/DataContext';
import apiService from '../services/apiService';
import './RegulatoryFrameworks.css';

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
// MAIN REGULATORY FRAMEWORKS COMPONENT
// ============================================
const RegulatoryFrameworks = ({ onBackClick }) => {
  const { countries } = useData();
  const [frameworks, setFrameworks] = useState([]);
  const [filteredFrameworks, setFilteredFrameworks] = useState([]);
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  // Filter states
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedApproach, setSelectedApproach] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [stats, setStats] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    statuses: [],
    approaches: [],
    countries: []
  });

  // Status color mapping
  const statusColors = {
    'functional': '#10B981',
    'implemented': '#059669',
    'draft': '#F59E0B',
    'development': '#3B82F6',
    'under_review': '#8B5CF6',
    'none': '#EF4444',
    'not_specified': '#6B7280'
  };

  const statusIcons = {
    'functional': 'fa-check-circle',
    'implemented': 'fa-check-double',
    'draft': 'fa-pencil-alt',
    'development': 'fa-cogs',
    'under_review': 'fa-sync-alt',
    'none': 'fa-times-circle',
    'not_specified': 'fa-question-circle'
  };

  const approachColors = {
    'product_based': '#3B82F6',
    'process_based': '#10B981',
    'hybrid': '#8B5CF6',
    'not_specified': '#6B7280'
  };

  const getStatusDisplay = (status) => {
    const map = {
      'functional': 'Functional Framework',
      'implemented': 'Fully Implemented',
      'draft': 'Draft Guidelines',
      'development': 'Policy Development',
      'under_review': 'Under Review',
      'none': 'No Specific Framework',
      'not_specified': 'Not Specified'
    };
    return map[status] || status;
  };

  const getApproachDisplay = (approach) => {
    const map = {
      'product_based': 'Product-based',
      'process_based': 'Process-based',
      'hybrid': 'Hybrid Approach',
      'not_specified': 'Not Specified'
    };
    return map[approach] || approach;
  };

  // ===== VIEW MODE HANDLER =====
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  // ===== FETCH FRAMEWORKS =====
  const fetchFrameworks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getRegulatoryFrameworks();
      const frameworksData = response.results || response || [];

      setFrameworks(frameworksData);
      setFilteredFrameworks(frameworksData);

      // Build filter options
      const statuses = [...new Set(frameworksData.map(f => f.status))].map(status => ({
        value: status,
        label: getStatusDisplay(status),
        count: frameworksData.filter(f => f.status === status).length,
        color: statusColors[status] || '#6B7280'
      }));

      const approaches = [...new Set(frameworksData.map(f => f.approach))].map(approach => ({
        value: approach,
        label: getApproachDisplay(approach),
        count: frameworksData.filter(f => f.approach === approach).length,
        color: approachColors[approach] || '#6B7280'
      }));

      const countries = frameworksData.map(f => ({
        value: f.country,
        label: f.country_name,
        count: 1
      }));

      setFilterOptions({ statuses, approaches, countries });

      // Get stats
      const statsResponse = await apiService.getRegulatoryFrameworkStats();
      setStats(statsResponse);

    } catch (err) {
      console.error('Error fetching regulatory frameworks:', err);
      setError(err.message || 'Failed to load regulatory frameworks.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== FETCH ON MOUNT =====
  useEffect(() => {
    fetchFrameworks();
  }, [fetchFrameworks]);

  // ===== FILTER FRAMEWORKS =====
  const filterFrameworks = useCallback(() => {
    let filtered = [...frameworks];

    if (selectedStatus) {
      filtered = filtered.filter(f => f.status === selectedStatus);
    }

    if (selectedApproach) {
      filtered = filtered.filter(f => f.approach === selectedApproach);
    }

    if (selectedCountry) {
      filtered = filtered.filter(f => f.country === selectedCountry);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(f =>
        f.country_name?.toLowerCase().includes(term) ||
        f.summary?.toLowerCase().includes(term)
      );
    }

    setFilteredFrameworks(filtered);
  }, [frameworks, selectedStatus, selectedApproach, selectedCountry, searchTerm]);

  useEffect(() => {
    filterFrameworks();
  }, [filterFrameworks]);

  // ===== RESET FILTERS =====
  const resetFilters = () => {
    setSelectedStatus('');
    setSelectedApproach('');
    setSelectedCountry('');
    setSearchTerm('');
  };

  // ===== COUNT ACTIVE FILTERS =====
  const activeFilterCount = [selectedStatus, selectedApproach, selectedCountry, searchTerm].filter(f => f).length;

  // ===== TOGGLE FILTER =====
  const toggleFilterSidebar = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
  };

  // ===== FETCH FRAMEWORK DETAILS =====
  const fetchFrameworkDetails = useCallback(async (frameworkId) => {
    try {
      const details = await apiService.getRegulatoryFrameworkDetail(frameworkId);
      setSelectedFramework(details);
    } catch (err) {
      console.error('Error fetching framework details:', err);
    }
  }, []);

  // ===== LOADING STATE =====
  if (loading && !frameworks.length) {
    return (
      <div className="regulatory-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading regulatory frameworks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="regulatory-page">
      {/* Back Button */}
      <button className="back-to-home" onClick={onBackClick} aria-label="Back to home">
        <i className="fas fa-arrow-left"></i>
        <span>Back to Home</span>
      </button>

      {/* ===== HEADER ===== */}
      <header className="regulatory-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <h1 className="page-title">
                <span className="title-icon"><i className="fas fa-gavel"></i></span>
                <span className="title-text">Regulatory Frameworks</span>
              </h1>
              <p className="page-subtitle">
                Genome editing regulatory frameworks across African countries
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
          {stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <i className="fas fa-globe-africa"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.total_frameworks}</span>
                  <span className="stat-label">Total Frameworks</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper functional">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.functional_frameworks || 0}</span>
                  <span className="stat-label">Functional Frameworks</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper draft">
                  <i className="fas fa-file-alt"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.with_guidelines || 0}</span>
                  <span className="stat-label">With GEd Guidelines</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper development">
                  <i className="fas fa-cogs"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.by_status?.development || 0}</span>
                  <span className="stat-label">In Development</span>
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
              <label className="filter-label" htmlFor="search-frameworks">
                <i className="fas fa-search"></i> Search
              </label>
              <input
                id="search-frameworks"
                type="text"
                placeholder="Search by country or summary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
                aria-label="Search frameworks"
              />
            </div>

            {/* Status */}
            <div className="filter-group">
              <SearchableDropdown
                label="Status"
                icon="fas fa-circle"
                placeholder="Search status..."
                options={filterOptions.statuses}
                value={selectedStatus}
                onChange={(value) => setSelectedStatus(value)}
                showCounts={true}
              />
            </div>

            {/* Approach */}
            <div className="filter-group">
              <SearchableDropdown
                label="Approach"
                icon="fas fa-route"
                placeholder="Search approach..."
                options={filterOptions.approaches}
                value={selectedApproach}
                onChange={(value) => setSelectedApproach(value)}
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

            <button 
              className="reset-filters-btn" 
              onClick={resetFilters}
              aria-label="Reset all filters"
            >
              <i className="fas fa-undo"></i> Reset All Filters
            </button>
          </div>
        </aside>

        {/* ===== FRAMEWORKS GRID ===== */}
        <main className="regulatory-content">
          <div className="results-header">
            <div className="results-info">
              <span className="results-count">
                <strong>{filteredFrameworks.length}</strong> frameworks found
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
              <h3>Unable to load frameworks</h3>
              <p>{error}</p>
              <button onClick={fetchFrameworks} className="btn-primary">
                <i className="fas fa-redo"></i> Retry
              </button>
            </div>
          ) : (
            <>
              <div className={`frameworks-grid ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
                {filteredFrameworks.map((framework, index) => (
                  <div 
                    key={framework.id} 
                    className="framework-card"
                    onClick={() => fetchFrameworkDetails(framework.id)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && fetchFrameworkDetails(framework.id)}
                    aria-label={`View details for ${framework.country_name}`}
                  >
                    <div className="framework-card-header">
                      <div className="framework-country">
                        <span className="country-flag">{framework.country_flag || '🌍'}</span>
                        <h3>{framework.country_name}</h3>
                      </div>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: statusColors[framework.status] || '#6B7280' }}
                      >
                        <i className={`fas ${statusIcons[framework.status] || 'fa-circle'}`}></i>
                        {getStatusDisplay(framework.status)}
                      </span>
                    </div>

                    <div className="framework-body">
                      <div className="framework-meta">
                        <div className="meta-item">
                          <i className="fas fa-route"></i>
                          <span>Approach: <strong>{getApproachDisplay(framework.approach)}</strong></span>
                        </div>
                        {framework.ged_guidelines_date && (
                          <div className="meta-item">
                            <i className="fas fa-calendar-alt"></i>
                            <span>Guidelines: {new Date(framework.ged_guidelines_date).getFullYear()}</span>
                          </div>
                        )}
                        {framework.biosafety_act_date && (
                          <div className="meta-item">
                            <i className="fas fa-gavel"></i>
                            <span>Act: {new Date(framework.biosafety_act_date).getFullYear()}</span>
                          </div>
                        )}
                      </div>
                      <p className="framework-summary">
                        {framework.summary?.substring(0, 150)}...
                      </p>
                    </div>

                    <div className="framework-footer">
                      <span className="view-details">
                        View Details <i className="fas fa-arrow-right"></i>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Results */}
              {filteredFrameworks.length === 0 && (
                <div className="no-results">
                  <i className="fas fa-gavel empty-icon"></i>
                  <h3>No frameworks found</h3>
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

      {/* ===== FRAMEWORK DETAIL MODAL ===== */}
      {selectedFramework && (
        <div 
          className="modal-overlay" 
          onClick={() => setSelectedFramework(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="modal-container">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button 
                className="modal-close" 
                onClick={() => setSelectedFramework(null)}
                aria-label="Close framework details"
              >
                <i className="fas fa-times"></i>
              </button>

              <div className="modal-body">
                <div className="modal-header-section">
                  <div className="modal-title-section">
                    <h2 id="modal-title">{selectedFramework.country_name}</h2>
                    <span 
                      className="status-badge large"
                      style={{ backgroundColor: statusColors[selectedFramework.status] || '#6B7280' }}
                    >
                      <i className={`fas ${statusIcons[selectedFramework.status] || 'fa-circle'}`}></i>
                      {getStatusDisplay(selectedFramework.status)}
                    </span>
                  </div>
                  <p className="modal-subtitle">
                    <i className="fas fa-route"></i> Approach: {getApproachDisplay(selectedFramework.approach)}
                  </p>
                </div>

                {/* Overview */}
                <div className="modal-section">
                  <h3><i className="fas fa-info-circle"></i> Overview</h3>
                  <p>{selectedFramework.summary}</p>
                </div>

                {/* Key Dates */}
                {(selectedFramework.biosafety_act_date || selectedFramework.biosafety_regulations_date || selectedFramework.ged_guidelines_date) && (
                  <div className="modal-section">
                    <h3><i className="fas fa-calendar-alt"></i> Key Dates</h3>
                    <div className="modal-dates-grid">
                      {selectedFramework.biosafety_act_date && (
                        <div className="date-item">
                          <label>Biosafety Act</label>
                          <span>{new Date(selectedFramework.biosafety_act_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {selectedFramework.biosafety_regulations_date && (
                        <div className="date-item">
                          <label>Biosafety Regulations</label>
                          <span>{new Date(selectedFramework.biosafety_regulations_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      {selectedFramework.ged_guidelines_date && (
                        <div className="date-item">
                          <label>GEd Guidelines</label>
                          <span>{new Date(selectedFramework.ged_guidelines_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Multilateral Agreements */}
                {selectedFramework.multilateral_agreements && selectedFramework.multilateral_agreements.length > 0 && (
                  <div className="modal-section">
                    <h3><i className="fas fa-handshake"></i> Multilateral Agreements</h3>
                    <div className="agreements-list">
                      {selectedFramework.multilateral_agreements.map(agreement => (
                        <div key={agreement.id} className="agreement-item">
                          <div className="agreement-header">
                            <span className="agreement-type">{agreement.agreement_type_display}</span>
                            <span className="agreement-name">{agreement.name}</span>
                          </div>
                          <div className="agreement-dates">
                            {agreement.signed_date && (
                              <span>Signed: {new Date(agreement.signed_date).toLocaleDateString()}</span>
                            )}
                            {agreement.ratified_date && (
                              <span>Ratified: {new Date(agreement.ratified_date).toLocaleDateString()}</span>
                            )}
                            {agreement.accession_date && (
                              <span>Accession: {new Date(agreement.accession_date).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Regulatory Institutions */}
                {selectedFramework.regulatory_institutions && selectedFramework.regulatory_institutions.length > 0 && (
                  <div className="modal-section">
                    <h3><i className="fas fa-university"></i> Regulatory Institutions</h3>
                    <div className="institutions-list">
                      {selectedFramework.regulatory_institutions.map(inst => (
                        <div key={inst.id} className="institution-item">
                          <div className="inst-header">
                            <span className="inst-name">{inst.institution_name}</span>
                            <span className="inst-role">{inst.role_display}</span>
                          </div>
                          <p className="inst-mandate">{inst.mandate}</p>
                          {inst.website && (
                            <a href={`https://${inst.website}`} target="_blank" rel="noopener noreferrer" className="inst-website">
                              <i className="fas fa-globe"></i> {inst.website}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Regulatory Instruments */}
                {selectedFramework.regulatory_instruments && selectedFramework.regulatory_instruments.length > 0 && (
                  <div className="modal-section">
                    <h3><i className="fas fa-file-alt"></i> Regulatory Instruments</h3>
                    <div className="instruments-list">
                      {selectedFramework.regulatory_instruments.map(instrument => (
                        <div key={instrument.id} className="instrument-item">
                          <div className="inst-header">
                            <span className="inst-title">{instrument.title}</span>
                            <span className="inst-type">{instrument.instrument_type_display}</span>
                          </div>
                          <p className="inst-summary">{instrument.summary}</p>
                          <div className="inst-meta">
                            {instrument.date_enacted && (
                              <span>Enacted: {new Date(instrument.date_enacted).toLocaleDateString()}</span>
                            )}
                            {instrument.coverage_display && (
                              <span>Coverage: {instrument.coverage_display}</span>
                            )}
                            {instrument.is_current && (
                              <span className="current-badge">Current</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* GEd Regulatory Statuses */}
                {selectedFramework.ged_regulatory_statuses && selectedFramework.ged_regulatory_statuses.length > 0 && (
                  <div className="modal-section">
                    <h3><i className="fas fa-dna"></i> GEd Regulatory Status</h3>
                    <div className="ged-status-grid">
                      {selectedFramework.ged_regulatory_statuses.map(status => (
                        <div key={status.id} className="ged-status-item">
                          <div className="status-header">
                            <span className="status-category">{status.category_display}</span>
                            <span className="status-value">{status.status_display}</span>
                          </div>
                          <p className="status-description">{status.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Regulatory Timeline */}
                {selectedFramework.regulatory_timeline && selectedFramework.regulatory_timeline.length > 0 && (
                  <div className="modal-section">
                    <h3><i className="fas fa-timeline"></i> Regulatory Timeline</h3>
                    <div className="timeline">
                      {selectedFramework.regulatory_timeline.map((event, index) => (
                        <div key={event.id} className="timeline-item">
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <div className="timeline-header">
                              <span className="timeline-date">{new Date(event.event_date).toLocaleDateString()}</span>
                              <span className="timeline-type">{event.event_type_display}</span>
                            </div>
                            <h4>{event.title}</h4>
                            <p>{event.description}</p>
                            {event.reference && (
                              <a href={event.reference} target="_blank" rel="noopener noreferrer" className="timeline-ref">
                                <i className="fas fa-external-link-alt"></i> Reference
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="modal-footer">
                  <span>Last updated: {new Date(selectedFramework.last_updated).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegulatoryFrameworks;