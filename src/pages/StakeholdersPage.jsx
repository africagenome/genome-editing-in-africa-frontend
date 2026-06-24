// pages/StakeholdersPage.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useData } from '../context/DataContext';
import apiService from '../services/apiService';
import './StakeholdersPage.css';

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
// MAIN STAKEHOLDERS COMPONENT
// ============================================
const StakeholdersPage = ({ onBackClick }) => {
  const { countries } = useData();
  const [stakeholders, setStakeholders] = useState([]);
  const [filteredStakeholders, setFilteredStakeholders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [filterOptions, setFilterOptions] = useState({
    categories: [],
    countries: [],
    types: []
  });
  const [stats, setStats] = useState({
    total: 0,
    countries: 0,
    international: 0,
    regions: 0
  });

  // Category mapping
  const categoryMap = {
    'research': 'Research',
    'regulatory': 'Regulatory',
    'academic': 'Academic',
    'private': 'Private Sector',
    'cso': 'Civil Society',
    'international': 'International',
    'government': 'Government',
    'cg_center': 'CGIAR Center'
  };

  const categoryColors = {
    'Regulatory': '#e74c3c',
    'Research': '#3498db',
    'Academic': '#9b59b6',
    'Private Sector': '#f39c12',
    'Civil Society': '#2ecc71',
    'International': '#1abc9c',
    'Government': '#e67e22',
    'CGIAR Center': '#2c3e50'
  };

  const categoryIcons = {
    'Regulatory': 'fa-gavel',
    'Research': 'fa-flask',
    'Academic': 'fa-university',
    'Private Sector': 'fa-building',
    'Civil Society': 'fa-users',
    'International': 'fa-globe-africa',
    'Government': 'fa-landmark',
    'CGIAR Center': 'fa-globe'
  };

  // Get country names
  const getCountryNames = (inst) => {
    if (!inst) return ['Unknown'];
    
    if (inst.countries_details && inst.countries_details.length > 0) {
      return inst.countries_details.map(c => c.name || 'Unknown');
    }
    
    if (inst.countries_list && inst.countries_list.length > 0) {
      return inst.countries_list;
    }
    
    if (inst.countries && inst.countries.length > 0) {
      return ['Unknown'];
    }
    
    return ['Unknown'];
  };

  const getCountriesString = (inst) => {
    const countries = getCountryNames(inst);
    if (!countries || countries.length === 0 || (countries.length === 1 && countries[0] === 'Unknown')) {
      return 'No country specified';
    }
    if (countries.length === 1) return countries[0];
    return countries.join(', ');
  };

  const getPrimaryCountry = (inst) => {
    const countries = getCountryNames(inst);
    if (!countries || countries.length === 0 || countries[0] === 'Unknown') {
      return 'No country specified';
    }
    return countries[0];
  };

  // ===== VIEW MODE HANDLER =====
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  // ===== FETCH INSTITUTIONS =====
  const fetchInstitutions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getInstitutions({ limit: 100 });
      const institutions = response.results || response || [];

      const transformedData = institutions.map(inst => {
        const category = categoryMap[inst.type] || inst.type || 'Research';
        const countryNames = getCountryNames(inst);
        const primaryCountry = countryNames[0] || 'No country specified';
        
        return {
          id: inst.id || Math.random().toString(),
          name: inst.name || 'Unnamed Institution',
          acronym: inst.acronym || '',
          category: category,
          country: primaryCountry,
          country_names: countryNames,
          countries_string: getCountriesString(inst),
          country_id: inst.country?.id || inst.country_id,
          region: inst.country?.region || 'Africa',
          description: inst.description || `${inst.name || 'This institution'} is working on genome editing in Africa.`,
          fullDescription: inst.description || `${inst.name || 'This institution'} is working on genome editing in Africa.`,
          tags: inst.tags || ['research', 'genome editing'],
          contact: inst.email || 'contact@institution.org',
          website: inst.website || '',
          icon: categoryIcons[category] || 'fa-handshake',
          founded: inst.established_year || null,
          stakeholders: inst.stakeholders_count || 0,
          projects: inst.projects_count || 0,
          type: inst.type,
          type_display: inst.get_type_display || inst.type || 'Unknown',
          is_active: inst.is_active !== undefined ? inst.is_active : true,
          logo: inst.logo || null,
          address: inst.address || '',
          phone: inst.phone || '',
          originalData: inst
        };
      });

      setStakeholders(transformedData);
      setFilteredStakeholders(transformedData);

      // Build filter options
      const categories = [...new Set(transformedData.map(s => s.category))].map(cat => ({
        value: cat?.toString() || 'unknown',
        label: cat?.toString() || 'Unknown',
        count: transformedData.filter(s => s.category === cat).length,
        color: categoryColors[cat] || '#95a5a6'
      }));

      const allCountries = new Set();
      transformedData.forEach(s => {
        if (s.country_names && s.country_names.length > 0) {
          s.country_names.forEach(c => {
            if (c !== 'Unknown' && c !== 'No country specified') {
              allCountries.add(c);
            }
          });
        }
      });

      const countries = [...allCountries].sort().map(country => ({
        value: country?.toString() || 'unknown',
        label: country?.toString() || 'Unknown',
        count: transformedData.filter(s => 
          s.country_names && s.country_names.includes(country)
        ).length
      }));

      setFilterOptions({ categories, countries });

      const uniqueCountries = allCountries.size;
      const internationalCount = transformedData.filter(s => s.category === 'International').length;
      const uniqueRegions = new Set(transformedData.map(s => s.region));

      setStats({
        total: transformedData.length,
        countries: uniqueCountries,
        international: internationalCount,
        regions: uniqueRegions.size
      });

    } catch (err) {
      console.error('Error fetching institutions:', err);
      setError(err.message || 'Failed to load stakeholders. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== FETCH ON MOUNT =====
  useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

  // ===== FILTER STAKEHOLDERS =====
  const filterStakeholders = useCallback(() => {
    let filtered = [...stakeholders];
    
    if (selectedCategory) {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }
    
    if (selectedCountry) {
      filtered = filtered.filter(s => 
        s.country_names && s.country_names.includes(selectedCountry)
      );
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        (s.name && s.name.toLowerCase().includes(term)) ||
        (s.acronym && s.acronym.toLowerCase().includes(term)) ||
        (s.description && s.description.toLowerCase().includes(term)) ||
        (s.country && s.country.toLowerCase().includes(term)) ||
        (s.countries_string && s.countries_string.toLowerCase().includes(term)) ||
        (s.tags && s.tags.some(tag => tag && tag.toLowerCase().includes(term)))
      );
    }
    
    setFilteredStakeholders(filtered);
  }, [stakeholders, selectedCategory, selectedCountry, searchTerm]);

  useEffect(() => {
    filterStakeholders();
  }, [filterStakeholders]);

  // ===== RESET FILTERS =====
  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedCountry('');
    setSearchTerm('');
  };

  // ===== COUNT ACTIVE FILTERS =====
  const activeFilterCount = [selectedCategory, selectedCountry, searchTerm].filter(f => f).length;

  // ===== TOGGLE FILTER =====
  const toggleFilterSidebar = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
  };

  // ===== LOADING STATE =====
  if (loading && !stakeholders.length) {
    return (
      <div className="stakeholders-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading stakeholders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stakeholders-page">
      {/* Back Button */}
      <button className="back-to-home" onClick={onBackClick} aria-label="Back to home">
        <i className="fas fa-arrow-left"></i>
        <span>Back to Home</span>
      </button>

      {/* ===== HEADER ===== */}
      <header className="stakeholders-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <h1 className="page-title">
                <span className="title-icon"><i className="fas fa-handshake"></i></span>
                <span className="title-text">Stakeholders & Partners</span>
              </h1>
              <p className="page-subtitle">
                Meet the institutions, organizations, and experts driving genome editing innovation across Africa
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
                  <i className="fas fa-building"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.total}</span>
                  <span className="stat-label">Institutions</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper active">
                  <i className="fas fa-globe-africa"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.countries}</span>
                  <span className="stat-label">Countries</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper cft">
                  <i className="fas fa-handshake"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.international}</span>
                  <span className="stat-label">International Partners</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper funding">
                  <i className="fas fa-flag"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.regions}</span>
                  <span className="stat-label">Regions</span>
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
              <label className="filter-label" htmlFor="search-stakeholders">
                <i className="fas fa-search"></i> Search
              </label>
              <input
                id="search-stakeholders"
                type="text"
                placeholder="Search stakeholders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
                aria-label="Search stakeholders"
              />
            </div>

            {/* Category */}
            <div className="filter-group">
              <SearchableDropdown
                label="Category"
                icon="fas fa-tag"
                placeholder="Search categories..."
                options={filterOptions.categories}
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value)}
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

        {/* ===== STAKEHOLDERS GRID ===== */}
        <main className="stakeholders-content">
          <div className="results-header">
            <div className="results-info">
              <span className="results-count">
                <strong>{filteredStakeholders.length}</strong> stakeholders found
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
              <h3>Unable to load stakeholders</h3>
              <p>{error}</p>
              <button onClick={fetchInstitutions} className="btn-primary">
                <i className="fas fa-redo"></i> Retry
              </button>
            </div>
          ) : (
            <>
              <div className={`stakeholders-grid ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
                {filteredStakeholders.map((stakeholder, index) => (
                  <div 
                    key={stakeholder.id} 
                    className="stakeholder-card"
                    onClick={() => setSelectedStakeholder(stakeholder)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedStakeholder(stakeholder)}
                    aria-label={`View details for ${stakeholder.name}`}
                  >
                    <div className="stakeholder-card-top">
                      <div className="stakeholder-icon">
                        {stakeholder.logo ? (
                          <img src={stakeholder.logo} alt={stakeholder.name} className="stakeholder-logo" />
                        ) : (
                          <i className={`fas ${stakeholder.icon || 'fa-handshake'}`} style={{ color: categoryColors[stakeholder.category] || '#5B7E96' }}></i>
                        )}
                      </div>
                      <span 
                        className="stakeholder-category-badge"
                        style={{ backgroundColor: categoryColors[stakeholder.category] || '#5B7E96' }}
                      >
                        {stakeholder.category}
                      </span>
                    </div>

                    <div className="stakeholder-info">
                      <h3>{stakeholder.name}</h3>
                      {stakeholder.acronym && (
                        <span className="stakeholder-acronym">{stakeholder.acronym}</span>
                      )}
                    </div>

                    <div className="stakeholder-desc">
                      {stakeholder.description && stakeholder.description.length > 100 
                        ? `${stakeholder.description.substring(0, 100)}...` 
                        : stakeholder.description || 'No description available'}
                    </div>

                    <div className="stakeholder-meta">
                      <span className="meta-item">
                        <i className="fas fa-map-marker-alt"></i>
                        {stakeholder.countries_string}
                      </span>
                      {stakeholder.projects > 0 && (
                        <span className="meta-item">
                          <i className="fas fa-project-diagram"></i>
                          {stakeholder.projects} projects
                        </span>
                      )}
                    </div>

                    <div className="stakeholder-tags">
                      {stakeholder.tags && stakeholder.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="tag">#{tag}</span>
                      ))}
                    </div>

                    <div className="stakeholder-footer">
                      <span className="view-details">
                        View Details <i className="fas fa-arrow-right"></i>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Results */}
              {filteredStakeholders.length === 0 && (
                <div className="no-results">
                  <i className="fas fa-users empty-icon"></i>
                  <h3>No stakeholders found</h3>
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

      {/* ===== STAKEHOLDER DETAIL MODAL ===== */}
      {selectedStakeholder && (
        <div 
          className="modal-overlay" 
          onClick={() => setSelectedStakeholder(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="modal-container">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button 
                className="modal-close" 
                onClick={() => setSelectedStakeholder(null)}
                aria-label="Close stakeholder details"
              >
                <i className="fas fa-times"></i>
              </button>

              <div className="modal-body">
                <div className="modal-header-section">
                  <div className="modal-icon-wrapper">
                    {selectedStakeholder.logo ? (
                      <img src={selectedStakeholder.logo} alt={selectedStakeholder.name} className="modal-logo" />
                    ) : (
                      <i className={`fas ${selectedStakeholder.icon || 'fa-handshake'}`} style={{ color: categoryColors[selectedStakeholder.category] || '#5B7E96', fontSize: '2rem' }}></i>
                    )}
                  </div>
                  <div className="modal-title-section">
                    <h2 id="modal-title">{selectedStakeholder.name}</h2>
                    {selectedStakeholder.acronym && (
                      <span className="modal-acronym">{selectedStakeholder.acronym}</span>
                    )}
                    <span 
                      className="modal-category-badge"
                      style={{ backgroundColor: categoryColors[selectedStakeholder.category] || '#5B7E96' }}
                    >
                      {selectedStakeholder.category}
                    </span>
                  </div>
                </div>

                <div className="modal-meta-grid">
                  <div className="modal-meta-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <div>
                      <label>Countries</label>
                      <span>{selectedStakeholder.countries_string}</span>
                    </div>
                  </div>
                  <div className="modal-meta-item">
                    <i className="fas fa-globe"></i>
                    <div>
                      <label>Region</label>
                      <span>{selectedStakeholder.region || 'Africa'}</span>
                    </div>
                  </div>
                  {selectedStakeholder.type_display && (
                    <div className="modal-meta-item">
                      <i className="fas fa-tag"></i>
                      <div>
                        <label>Type</label>
                        <span>{selectedStakeholder.type_display}</span>
                      </div>
                    </div>
                  )}
                  {selectedStakeholder.founded && (
                    <div className="modal-meta-item">
                      <i className="fas fa-calendar-alt"></i>
                      <div>
                        <label>Founded</label>
                        <span>{selectedStakeholder.founded}</span>
                      </div>
                    </div>
                  )}
                  {selectedStakeholder.is_active !== undefined && (
                    <div className="modal-meta-item">
                      <i className="fas fa-circle"></i>
                      <div>
                        <label>Status</label>
                        <span className={selectedStakeholder.is_active ? 'status-active' : 'status-inactive'}>
                          {selectedStakeholder.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {selectedStakeholder.fullDescription && (
                  <div className="modal-section">
                    <h3><i className="fas fa-info-circle"></i> Overview</h3>
                    <p>{selectedStakeholder.fullDescription}</p>
                  </div>
                )}

                {selectedStakeholder.address && (
                  <div className="modal-section">
                    <h3><i className="fas fa-map-pin"></i> Address</h3>
                    <p>{selectedStakeholder.address}</p>
                  </div>
                )}

                {selectedStakeholder.tags && selectedStakeholder.tags.length > 0 && (
                  <div className="modal-section">
                    <h3><i className="fas fa-tags"></i> Areas of Expertise</h3>
                    <div className="modal-tags">
                      {selectedStakeholder.tags.map((tag, idx) => (
                        <span key={idx} className="modal-tag">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="modal-stats-grid">
                  <div className="modal-stat">
                    <div className="stat-number">{selectedStakeholder.stakeholders || 0}</div>
                    <div className="stat-label">Stakeholders Engaged</div>
                  </div>
                  <div className="modal-stat">
                    <div className="stat-number">{selectedStakeholder.projects || 0}</div>
                    <div className="stat-label">Active Projects</div>
                  </div>
                </div>

                <div className="modal-contact-section">
                  <h3><i className="fas fa-address-card"></i> Contact Information</h3>
                  <div className="modal-contact-grid">
                    {selectedStakeholder.contact && selectedStakeholder.contact !== 'contact@institution.org' && (
                      <div className="contact-item">
                        <i className="fas fa-envelope"></i>
                        <a href={`mailto:${selectedStakeholder.contact}`}>{selectedStakeholder.contact}</a>
                      </div>
                    )}
                    {selectedStakeholder.phone && (
                      <div className="contact-item">
                        <i className="fas fa-phone"></i>
                        <a href={`tel:${selectedStakeholder.phone}`}>{selectedStakeholder.phone}</a>
                      </div>
                    )}
                    {selectedStakeholder.website && (
                      <div className="contact-item">
                        <i className="fas fa-globe"></i>
                        <a href={`https://${selectedStakeholder.website}`} target="_blank" rel="noopener noreferrer">
                          {selectedStakeholder.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== FOOTER ===== */}
      <footer className="stakeholders-footer">
        <div className="container">
          <div className="footer-content">
            <p>© {new Date().getFullYear()} AUDA-NEPAD Genome Editing Programme — Building partnerships for responsible innovation in Africa.</p>
            <button onClick={onBackClick} className="footer-back-btn">
              <i className="fas fa-home"></i> Back to Home
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StakeholdersPage;