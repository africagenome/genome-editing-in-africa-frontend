import React, { useState, useEffect } from 'react';
import './AdvancedSearchPage.css';

const AdvancedSearchPage = ({ onBackClick, onSearchResults }) => {
  const [filters, setFilters] = useState({
    biosafety: [],
    tech: [],
    sector: [],
    crop: [],
    trait: [],
    status: [],
    region: [],
    country: '',
    searchQuery: ''
  });

  const [expandedSections, setExpandedSections] = useState({
    regulatory: true,
    technology: true,
    sector: true,
    crop: true,
    status: true,
    region: true
  });

  // Filter options
  const filterOptions = {
    biosafety: [
      "Functional Framework",
      "Draft Guidelines (Genome Editing Specific)",
      "No Specific Framework",
      "Policy Development"
    ],
    tech: ["CRISPR-Cas9", "TALENs", "SDN-1", "SDN-2", "Base Editing", "Prime Editing"],
    sector: [
      "Agriculture (Crops & Livestock)",
      "Public Health (Disease Vector Control)",
      "Human Gene Therapy",
      "Industrial Biotechnology",
      "Environmental Conservation"
    ],
    crop: ["Maize", "Cassava", "Sorghum", "Cowpea", "Teff", "Cotton", "Rice", "Banana", "Tomato", "Wheat"],
    trait: [
      "Drought Tolerance",
      "Viral Resistance",
      "Pest Resistance",
      "Salt Tolerance",
      "Heat Tolerance",
      "Yield Improvement",
      "Nutritional Enhancement",
      "Herbicide Tolerance",
      "Fungal Resistance"
    ],
    status: [
      "Proof of Concept / Confined Field Trial",
      "Commercial Release",
      "Research & Development Only",
      "Regulatory Review",
      "Approved for Release"
    ],
    region: ["East Africa", "West Africa", "Southern Africa", "North Africa", "Central Africa"],
    countries: [
      "Kenya", "Nigeria", "South Africa", "Ghana", "Ethiopia", 
      "Uganda", "Tanzania", "Rwanda", "Zimbabwe", "Burkina Faso",
      "Mali", "Senegal", "Malawi", "Zambia", "Mozambique"
    ]
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (category, value) => {
    setFilters(prev => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const handleCountryChange = (e) => {
    setFilters(prev => ({ ...prev, country: e.target.value }));
  };

  const handleSearchQueryChange = (e) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
  };

  const handleClearAll = () => {
    setFilters({
      biosafety: [],
      tech: [],
      sector: [],
      crop: [],
      trait: [],
      status: [],
      region: [],
      country: '',
      searchQuery: ''
    });
  };

  const handleSearch = () => {
    // Pass filters to parent component
    if (onSearchResults) {
      onSearchResults(filters);
    }
  };

  const getSelectedCount = () => {
    let count = 0;
    count += filters.biosafety.length;
    count += filters.tech.length;
    count += filters.sector.length;
    count += filters.crop.length;
    count += filters.trait.length;
    count += filters.status.length;
    count += filters.region.length;
    if (filters.country) count++;
    if (filters.searchQuery) count++;
    return count;
  };

  return (
    <div className="advanced-search-page">
      {/* Header */}
      <header className="search-header">
        <div className="container">
          <div className="header-inner">
            <div className="logo-area">
              <img 
                className="logo-img" 
                src="https://www.nepad.org/sites/default/files/AUDA%2025TH%20ANNIVERSARY%20LOGO%20Lock%20up-01.png" 
                alt="AUDA-NEPAD Logo" 
                onError={(e) => e.target.src = 'https://placehold.co/120x50'}
              />
              <div className="logo-text">
                <h2>Genome Editing Database</h2>
                <p>AUDA-NEPAD · Advanced Search</p>
              </div>
            </div>
            <div className="nav-links">
              <button onClick={onBackClick} className="back-link">
                <i className="fas fa-arrow-left"></i> Back to Home
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="search-hero">
        <div className="container">
          <div className="hero-badge">
            <i className="fas fa-search"></i> ADVANCED SEARCH
          </div>
          <h1>Genome Editing Database</h1>
          <p>Search through comprehensive regulatory and research data across African nations.</p>
        </div>
      </div>

      <div className="container">
        {/* Search Bar */}
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search by project title, country, institution, or keyword..."
              value={filters.searchQuery}
              onChange={handleSearchQueryChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="search-actions">
            <button className="clear-all-btn" onClick={handleClearAll}>
              <i className="fas fa-undo-alt"></i> Clear all ({getSelectedCount()})
            </button>
            <button className="search-btn" onClick={handleSearch}>
              <i className="fas fa-search"></i> Search Database
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="filters-grid">
          {/* Regulatory Status */}
          <div className="filter-card">
            <div className="filter-card-header" onClick={() => toggleSection('regulatory')}>
              <h3><i className="fas fa-gavel"></i> Regulatory & Policy Status</h3>
              <i className={`fas fa-chevron-${expandedSections.regulatory ? 'up' : 'down'}`}></i>
            </div>
            {expandedSections.regulatory && (
              <div className="filter-options-grid">
                {filterOptions.biosafety.map(option => (
                  <label key={option} className="filter-option">
                    <input 
                      type="checkbox" 
                      checked={filters.biosafety.includes(option)}
                      onChange={() => handleFilterChange('biosafety', option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Technology */}
          <div className="filter-card">
            <div className="filter-card-header" onClick={() => toggleSection('technology')}>
              <h3><i className="fas fa-microscope"></i> Technology / Tool Used</h3>
              <i className={`fas fa-chevron-${expandedSections.technology ? 'up' : 'down'}`}></i>
            </div>
            {expandedSections.technology && (
              <div className="filter-options-grid">
                {filterOptions.tech.map(option => (
                  <label key={option} className="filter-option">
                    <input 
                      type="checkbox" 
                      checked={filters.tech.includes(option)}
                      onChange={() => handleFilterChange('tech', option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Sector */}
          <div className="filter-card">
            <div className="filter-card-header" onClick={() => toggleSection('sector')}>
              <h3><i className="fas fa-chart-line"></i> Sector / Application</h3>
              <i className={`fas fa-chevron-${expandedSections.sector ? 'up' : 'down'}`}></i>
            </div>
            {expandedSections.sector && (
              <div className="filter-options-grid">
                {filterOptions.sector.map(option => (
                  <label key={option} className="filter-option">
                    <input 
                      type="checkbox" 
                      checked={filters.sector.includes(option)}
                      onChange={() => handleFilterChange('sector', option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Crop / Target Trait */}
          <div className="filter-card">
            <div className="filter-card-header" onClick={() => toggleSection('crop')}>
              <h3><i className="fas fa-seedling"></i> Crop / Target Trait</h3>
              <i className={`fas fa-chevron-${expandedSections.crop ? 'up' : 'down'}`}></i>
            </div>
            {expandedSections.crop && (
              <>
                <div className="filter-subsection">
                  <h4>Crops</h4>
                  <div className="filter-options-grid">
                    {filterOptions.crop.map(option => (
                      <label key={option} className="filter-option">
                        <input 
                          type="checkbox" 
                          checked={filters.crop.includes(option)}
                          onChange={() => handleFilterChange('crop', option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="filter-subsection">
                  <h4>Traits</h4>
                  <div className="filter-options-grid">
                    {filterOptions.trait.map(option => (
                      <label key={option} className="filter-option">
                        <input 
                          type="checkbox" 
                          checked={filters.trait.includes(option)}
                          onChange={() => handleFilterChange('trait', option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Project Status */}
          <div className="filter-card">
            <div className="filter-card-header" onClick={() => toggleSection('status')}>
              <h3><i className="fas fa-chart-simple"></i> Project Status</h3>
              <i className={`fas fa-chevron-${expandedSections.status ? 'up' : 'down'}`}></i>
            </div>
            {expandedSections.status && (
              <div className="filter-options-grid">
                {filterOptions.status.map(option => (
                  <label key={option} className="filter-option">
                    <input 
                      type="checkbox" 
                      checked={filters.status.includes(option)}
                      onChange={() => handleFilterChange('status', option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Geographic Filters */}
          <div className="filter-card">
            <div className="filter-card-header" onClick={() => toggleSection('region')}>
              <h3><i className="fas fa-map-marker-alt"></i> Region & Country</h3>
              <i className={`fas fa-chevron-${expandedSections.region ? 'up' : 'down'}`}></i>
            </div>
            {expandedSections.region && (
              <>
                <div className="filter-subsection">
                  <h4>Regions</h4>
                  <div className="filter-options-grid">
                    {filterOptions.region.map(option => (
                      <label key={option} className="filter-option">
                        <input 
                          type="checkbox" 
                          checked={filters.region.includes(option)}
                          onChange={() => handleFilterChange('region', option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="filter-subsection">
                  <h4>Country</h4>
                  <select className="country-select" value={filters.country} onChange={handleCountryChange}>
                    <option value="">All Countries</option>
                    {filterOptions.countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Search Actions */}
        <div className="search-actions-bottom">
          <button className="clear-all-btn-large" onClick={handleClearAll}>
            <i className="fas fa-undo-alt"></i> Clear All Filters
          </button>
          <button className="search-btn-large" onClick={handleSearch}>
            <i className="fas fa-search"></i> Search Database
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="search-footer">
        <div className="container">
          <div className="footer-content">
            <p>© 2026 AUDA-NEPAD Genome Editing Programme — Data from African regulatory & research landscape analyses.</p>
            <button onClick={onBackClick} className="footer-back-btn">
              <i className="fas fa-home"></i> Back to Home
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdvancedSearchPage;