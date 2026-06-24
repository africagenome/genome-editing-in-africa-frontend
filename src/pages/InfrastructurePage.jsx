// pages/InfrastructurePage.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useData } from '../context/DataContext';
import apiService from '../services/apiService';
import './InfrastructurePage.css';

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
// MAIN INFRASTRUCTURE COMPONENT
// ============================================
const InfrastructurePage = ({ onBackClick }) => {
  const { countries } = useData();
  const [facilities, setFacilities] = useState([]);
  const [filteredFacilities, setFilteredFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  // Filter states
  const [selectedBiosafetyLevel, setSelectedBiosafetyLevel] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedOrganisation, setSelectedOrganisation] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedEquipmentType, setSelectedEquipmentType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filterOptions, setFilterOptions] = useState({
    biosafetyLevels: [],
    countries: [],
    organisations: [],
    statuses: [],
    equipmentTypes: []
  });
  
  const [stats, setStats] = useState({
    total: 0,
    fullyEquipped: 0,
    partiallyEquipped: 0,
    operational: 0,
    developing: 0
  });

  // Status color mapping
  const statusColors = {
    'fully_equipped': '#10B981',
    'operational': '#10B981',
    'partially_equipped': '#F59E0B',
    'not-fully_equipped': '#F59E0B',
    'developing': '#3B82F6',
    'under_construction': '#8B5CF6',
    'planned': '#6B7280',
    'needs_upgrade': '#EF4444'
  };

  const statusIcons = {
    'fully_equipped': 'fa-check-circle',
    'operational': 'fa-check-circle',
    'partially_equipped': 'fa-exclamation-triangle',
    'not-fully_equipped': 'fa-exclamation-triangle',
    'developing': 'fa-chart-line',
    'under_construction': 'fa-hard-hat',
    'planned': 'fa-clock',
    'needs_upgrade': 'fa-tools'
  };

  const biosafetyLevelColors = {
    'bsl1': '#10B981',
    'bsl2': '#3B82F6',
    'bsl3': '#F59E0B',
    'bsl4': '#EF4444',
    'none': '#6B7280'
  };

  const getStatusDisplay = (status) => {
    const map = {
      'fully_equipped': 'Fully Equipped',
      'operational': 'Operational',
      'partially_equipped': 'Partially Equipped',
      'not-fully_equipped': 'Not Fully Equipped',
      'developing': 'Developing',
      'under_construction': 'Under Construction',
      'planned': 'Planned',
      'needs_upgrade': 'Needs Upgrade'
    };
    return map[status] || status;
  };

  const getBiosafetyLevelDisplay = (level) => {
    const map = {
      'bsl1': 'BSL-1',
      'bsl2': 'BSL-2',
      'bsl3': 'BSL-3',
      'bsl4': 'BSL-4',
      'none': 'Not Specified'
    };
    return map[level] || level?.toUpperCase() || 'Not Specified';
  };

  // ===== VIEW MODE HANDLER =====
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  // ===== FETCH FACILITIES =====
  const fetchFacilities = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const facilitiesResponse = await apiService.getLaboratoryFacilities({ limit: 100 });
      let facilitiesData = facilitiesResponse.results || facilitiesResponse || [];

      const institutionsResponse = await apiService.getInstitutions({ limit: 100 });
      const institutionsData = institutionsResponse.results || institutionsResponse || [];

      setFacilities(facilitiesData);
      setFilteredFacilities(facilitiesData);

      // Build filter options
      const biosafetyLevelsSet = new Set();
      facilitiesData.forEach(f => {
        if (f.biosafety_level && Array.isArray(f.biosafety_level)) {
          f.biosafety_level.forEach(level => {
            if (level) biosafetyLevelsSet.add(level);
          });
        }
      });
      const biosafetyLevels = [...biosafetyLevelsSet].map(level => ({
        value: level,
        label: getBiosafetyLevelDisplay(level),
        count: facilitiesData.filter(f => 
          f.biosafety_level && f.biosafety_level.includes(level)
        ).length,
        color: biosafetyLevelColors[level] || '#6B7280'
      }));

      const countrySet = new Set();
      facilitiesData.forEach(f => {
        if (f.country_name) {
          countrySet.add(f.country_name);
        }
      });
      const countriesList = [...countrySet].sort().map(countryName => ({
        value: countryName,
        label: countryName,
        count: facilitiesData.filter(f => f.country_name === countryName).length
      }));

      const organisations = institutionsData.map(inst => ({
        value: inst.id,
        label: inst.name,
        count: facilitiesData.filter(f => f.institution === inst.id).length
      }));

      const statuses = [...new Set(facilitiesData.map(f => f.status))].map(status => ({
        value: status,
        label: getStatusDisplay(status),
        count: facilitiesData.filter(f => f.status === status).length,
        color: statusColors[status] || '#6B7280'
      }));

      const equipmentTypesSet = new Set();
      facilitiesData.forEach(f => {
        if (f.equipment_list && Array.isArray(f.equipment_list)) {
          f.equipment_list.forEach(eq => {
            if (eq) equipmentTypesSet.add(eq);
          });
        }
      });
      const equipmentTypes = [...equipmentTypesSet].map(type => ({
        value: type,
        label: type,
        count: facilitiesData.filter(f => 
          f.equipment_list && f.equipment_list.includes(type)
        ).length
      }));

      setFilterOptions({
        biosafetyLevels,
        countries: countriesList,
        organisations,
        statuses,
        equipmentTypes
      });

      const fullyEquipped = facilitiesData.filter(f => f.status === 'fully_equipped').length;
      const partiallyEquipped = facilitiesData.filter(f => 
        f.status === 'partially_equipped' || f.status === 'not-fully_equipped'
      ).length;
      const operational = facilitiesData.filter(f => 
        f.status === 'operational' || f.status === 'fully_equipped'
      ).length;
      const developing = facilitiesData.filter(f => 
        f.status === 'developing' || f.status === 'under_construction'
      ).length;

      setStats({
        total: facilitiesData.length,
        fullyEquipped,
        partiallyEquipped,
        operational,
        developing
      });

    } catch (err) {
      console.error('Error fetching facilities:', err);
      setError(err.message || 'Failed to load infrastructure data.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== FETCH ON MOUNT =====
  useEffect(() => {
    fetchFacilities();
  }, [fetchFacilities]);

  // ===== FILTER FACILITIES =====
  const filterFacilities = useCallback(() => {
    let filtered = [...facilities];

    if (selectedBiosafetyLevel) {
      filtered = filtered.filter(f => 
        f.biosafety_level && f.biosafety_level.includes(selectedBiosafetyLevel)
      );
    }

    if (selectedCountry) {
      filtered = filtered.filter(f => f.country_name === selectedCountry);
    }

    if (selectedOrganisation) {
      filtered = filtered.filter(f => f.institution === parseInt(selectedOrganisation));
    }

    if (selectedStatus) {
      filtered = filtered.filter(f => f.status === selectedStatus);
    }

    if (selectedEquipmentType) {
      filtered = filtered.filter(f => 
        f.equipment_list && f.equipment_list.includes(selectedEquipmentType)
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(f =>
        f.name?.toLowerCase().includes(term) ||
        f.institution_name?.toLowerCase().includes(term) ||
        f.country_name?.toLowerCase().includes(term) ||
        f.description?.toLowerCase().includes(term) ||
        f.facility_type?.toLowerCase().includes(term)
      );
    }

    setFilteredFacilities(filtered);
  }, [facilities, selectedBiosafetyLevel, selectedCountry, selectedOrganisation, selectedStatus, selectedEquipmentType, searchTerm]);

  useEffect(() => {
    filterFacilities();
  }, [filterFacilities]);

  // ===== RESET FILTERS =====
  const resetFilters = () => {
    setSelectedBiosafetyLevel('');
    setSelectedCountry('');
    setSelectedOrganisation('');
    setSelectedStatus('');
    setSelectedEquipmentType('');
    setSearchTerm('');
  };

  // ===== COUNT ACTIVE FILTERS =====
  const activeFilterCount = [
    selectedBiosafetyLevel, 
    selectedCountry, 
    selectedOrganisation, 
    selectedStatus, 
    selectedEquipmentType,
    searchTerm
  ].filter(f => f).length;

  // ===== TOGGLE FILTER =====
  const toggleFilterSidebar = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
  };

  // ===== LOADING STATE =====
  if (loading && !facilities.length) {
    return (
      <div className="infrastructure-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading infrastructure data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="infrastructure-page">
      {/* Back Button */}
      <button className="back-to-home" onClick={onBackClick} aria-label="Back to home">
        <i className="fas fa-arrow-left"></i>
        <span>Back to Home</span>
      </button>

      {/* ===== HEADER ===== */}
      <header className="infra-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <h1 className="page-title">
                <span className="title-icon"><i className="fas fa-microscope"></i></span>
                <span className="title-text">Infrastructure & Equipment</span>
              </h1>
              <p className="page-subtitle">
                State-of-the-art facilities, core equipment, and capacity-building centers supporting genome editing research across Africa
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
                  <i className="fas fa-flask"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.total}</span>
                  <span className="stat-label">Total Facilities</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper active">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.fullyEquipped}</span>
                  <span className="stat-label">Fully Equipped</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper cft">
                  <i className="fas fa-exclamation-triangle"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.partiallyEquipped}</span>
                  <span className="stat-label">Partially Equipped</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper funding">
                  <i className="fas fa-play-circle"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{stats.operational}</span>
                  <span className="stat-label">Operational</span>
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
              <label className="filter-label" htmlFor="search-facilities">
                <i className="fas fa-search"></i> Search
              </label>
              <input
                id="search-facilities"
                type="text"
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-input"
                aria-label="Search facilities"
              />
            </div>

            {/* Biosafety Level */}
            <div className="filter-group">
              <SearchableDropdown
                label="Biosafety Level"
                icon="fas fa-shield-alt"
                placeholder="Search biosafety levels..."
                options={filterOptions.biosafetyLevels}
                value={selectedBiosafetyLevel}
                onChange={(value) => setSelectedBiosafetyLevel(value)}
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

            {/* Organisation */}
            <div className="filter-group">
              <SearchableDropdown
                label="Organisation"
                icon="fas fa-building"
                placeholder="Search organisations..."
                options={filterOptions.organisations}
                value={selectedOrganisation}
                onChange={(value) => setSelectedOrganisation(value)}
                showCounts={true}
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

            {/* Equipment Type */}
            <div className="filter-group">
              <SearchableDropdown
                label="Equipment Type"
                icon="fas fa-microscope"
                placeholder="Search equipment..."
                options={filterOptions.equipmentTypes}
                value={selectedEquipmentType}
                onChange={(value) => setSelectedEquipmentType(value)}
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

        {/* ===== FACILITIES GRID ===== */}
        <main className="infra-content">
          <div className="results-header">
            <div className="results-info">
              <span className="results-count">
                <strong>{filteredFacilities.length}</strong> facilities found
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
              <h3>Unable to load infrastructure data</h3>
              <p>{error}</p>
              <button onClick={fetchFacilities} className="btn-primary">
                <i className="fas fa-redo"></i> Retry
              </button>
            </div>
          ) : (
            <>
              <div className={`facilities-grid ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
                {filteredFacilities.map((facility, index) => (
                  <div 
                    key={facility.id} 
                    className="facility-card"
                    onClick={() => setSelectedFacility(facility)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedFacility(facility)}
                    aria-label={`View details for ${facility.name}`}
                  >
                    <div className="facility-card-header">
                      <div className="facility-icon">
                        <i className="fas fa-flask"></i>
                      </div>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: statusColors[facility.status] || '#6B7280' }}
                      >
                        <i className={`fas ${statusIcons[facility.status] || 'fa-circle'}`}></i>
                        {getStatusDisplay(facility.status)}
                      </span>
                    </div>

                    <h3>{facility.name}</h3>

                    <div className="facility-meta">
                      <span className="meta-item">
                        <i className="fas fa-building"></i>
                        {facility.institution_name || 'Unknown Institution'}
                      </span>
                      <span className="meta-item">
                        <i className="fas fa-map-marker-alt"></i>
                        {facility.country_name || 'Unknown Country'}
                      </span>
                      {facility.biosafety_level && facility.biosafety_level.length > 0 && (
                        <span className="meta-item biosafety-levels">
                          <i className="fas fa-shield-alt"></i>
                          {facility.biosafety_level.map(level => (
                            <span key={level} className="biosafety-level-tag" style={{ backgroundColor: biosafetyLevelColors[level] || '#6B7280' }}>
                              {getBiosafetyLevelDisplay(level)}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>

                    <div className="facility-desc">
                      {facility.description?.substring(0, 120)}...
                    </div>

                    {facility.equipment_list && facility.equipment_list.length > 0 && (
                      <div className="equipment-tags">
                        {facility.equipment_list.slice(0, 3).map((eq, idx) => (
                          <span key={idx} className="equipment-tag">{eq}</span>
                        ))}
                        {facility.equipment_list.length > 3 && (
                          <span className="equipment-tag more">+{facility.equipment_list.length - 3}</span>
                        )}
                      </div>
                    )}

                    <div className="facility-footer">
                      <span className="view-details">
                        View Details <i className="fas fa-arrow-right"></i>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* No Results */}
              {filteredFacilities.length === 0 && (
                <div className="no-results">
                  <i className="fas fa-flask empty-icon"></i>
                  <h3>No facilities found</h3>
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

      {/* ===== FACILITY DETAIL MODAL ===== */}
      {selectedFacility && (
        <div 
          className="modal-overlay" 
          onClick={() => setSelectedFacility(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="modal-container">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button 
                className="modal-close" 
                onClick={() => setSelectedFacility(null)}
                aria-label="Close facility details"
              >
                <i className="fas fa-times"></i>
              </button>

              <div className="modal-body">
                <div className="modal-header-section">
                  <div className="modal-title-section">
                    <h2 id="modal-title">{selectedFacility.name}</h2>
                    <span 
                      className="status-badge large"
                      style={{ backgroundColor: statusColors[selectedFacility.status] || '#6B7280' }}
                    >
                      <i className={`fas ${statusIcons[selectedFacility.status] || 'fa-circle'}`}></i>
                      {getStatusDisplay(selectedFacility.status)}
                    </span>
                  </div>
                  <div className="modal-meta">
                    <span><i className="fas fa-building"></i> {selectedFacility.institution_name || 'Unknown Institution'}</span>
                    <span><i className="fas fa-map-marker-alt"></i> {selectedFacility.country_name || 'Unknown Country'}</span>
                    {selectedFacility.biosafety_level && selectedFacility.biosafety_level.length > 0 && (
                      <span>
                        <i className="fas fa-shield-alt"></i>
                        {selectedFacility.biosafety_level.map(level => (
                          <span key={level} className="biosafety-level-tag modal-tag" style={{ backgroundColor: biosafetyLevelColors[level] || '#6B7280' }}>
                            {getBiosafetyLevelDisplay(level)}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                </div>

                {/* Overview */}
                <div className="modal-section">
                  <h3><i className="fas fa-info-circle"></i> Overview</h3>
                  <p>{selectedFacility.description || 'No description available.'}</p>
                </div>

                {/* Stats */}
                <div className="modal-stats-grid">
                  <div className="modal-stat">
                    <div className="stat-number">{selectedFacility.researcher_count || 0}</div>
                    <div className="stat-label">Researchers</div>
                  </div>
                  <div className="modal-stat">
                    <div className="stat-number">{selectedFacility.equipment_count || 0}</div>
                    <div className="stat-label">Equipment Items</div>
                  </div>
                  <div className="modal-stat">
                    <div className="stat-number">{selectedFacility.biosafety_level?.length || 0}</div>
                    <div className="stat-label">Biosafety Levels</div>
                  </div>
                </div>

                {/* Equipment */}
                {selectedFacility.equipment_list && selectedFacility.equipment_list.length > 0 && (
                  <div className="modal-section">
                    <h3><i className="fas fa-microscope"></i> Equipment</h3>
                    <div className="equipment-list-modal">
                      {selectedFacility.equipment_list.map((eq, idx) => (
                        <span key={idx} className="equipment-item">{eq}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Equipment Needs */}
                {selectedFacility.equipment_needs && selectedFacility.equipment_needs.length > 0 && (
                  <div className="modal-section">
                    <h3><i className="fas fa-tools"></i> Equipment Needs</h3>
                    <div className="equipment-list-modal">
                      {selectedFacility.equipment_needs.map((eq, idx) => (
                        <span key={idx} className="equipment-item need">{eq}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Limitations */}
                {selectedFacility.limitations && (
                  <div className="modal-section">
                    <h3><i className="fas fa-exclamation-triangle"></i> Limitations</h3>
                    <p>{selectedFacility.limitations}</p>
                  </div>
                )}

                {/* Support Needed */}
                {selectedFacility.support_needed && (
                  <div className="modal-section">
                    <h3><i className="fas fa-hand-holding-heart"></i> Support Needed</h3>
                    <p>{selectedFacility.support_needed}</p>
                  </div>
                )}

                {/* Facility Type */}
                {selectedFacility.facility_type && (
                  <div className="modal-section">
                    <h3><i className="fas fa-tag"></i> Facility Type</h3>
                    <p>{selectedFacility.facility_type}</p>
                  </div>
                )}

                <div className="modal-footer">
                  <span>Status: {getStatusDisplay(selectedFacility.status)}</span>
                  {selectedFacility.is_active !== undefined && (
                    <span className={selectedFacility.is_active ? 'status-active' : 'status-inactive'}>
                      {selectedFacility.is_active ? 'Active' : 'Inactive'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== FOOTER ===== */}
      <footer className="infra-footer">
        <div className="container">
          <div className="footer-content">
            <p>© {new Date().getFullYear()} AUDA-NEPAD Genome Editing Programme — Building world-class infrastructure for African science.</p>
            <button onClick={onBackClick} className="footer-back-btn">
              <i className="fas fa-home"></i> Back to Home
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InfrastructurePage;