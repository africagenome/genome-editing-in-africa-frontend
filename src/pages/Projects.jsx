// pages/Projects.jsx

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import apiService from '../services/apiService';
import './Projects.css';

// ============================================
// SEARCHABLE DROPDOWN COMPONENT
// ============================================
const SearchableDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  label, 
  icon,
  disabled = false,
  showCounts = true,
  compact = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

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
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && filteredOptions.length > 0) {
      handleSelect(filteredOptions[0]);
    }
  };

  return (
    <div className={`searchable-dropdown ${compact ? 'compact' : ''}`} ref={dropdownRef}>
      <div className="dropdown-label">
        {icon && <i className={icon}></i>}
        <span>{label}</span>
        {selectedOption && !isOpen && (
          <span className="dropdown-selected-value">{selectedOption.label}</span>
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
          placeholder={placeholder || `Search ${label}...`}
          value={isOpen ? searchTerm : (selectedOption?.label || '')}
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
            filteredOptions.map(option => (
              <div
                key={option.value}
                className={`dropdown-option ${value === option.value ? 'selected' : ''}`}
                onClick={() => handleSelect(option)}
                role="option"
                aria-selected={value === option.value}
              >
                {option.color && <span className="status-color-dot" style={{ backgroundColor: option.color }}></span>}
                <span>{option.label}</span>
                {showCounts && option.count !== undefined && (
                  <span className="option-count">{option.count}</span>
                )}
                {value === option.value && (
                  <i className="fas fa-check option-check"></i>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// MAIN PROJECTS COMPONENT
// ============================================
const Projects = ({ onBackClick }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { 
    projects: contextProjects, 
    countries, 
    organisms,
    institutions,
    loading: contextLoading 
  } = useData();

  // ===== STATE =====
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [similarProjects, setSimilarProjects] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  // ===== VIEW MODE STATE =====
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // ===== FILTERS =====
  const [filters, setFilters] = useState({
    status: '',
    technology: '',
    sector: '',
    country: '',
    organism: '',
    lead_institution: '',
    search: '',
    year: '',
    funding_min: '',
    funding_max: '',
    sort_by: '-start_year'
  });

  // ===== PAGINATION =====
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [totalCount, setTotalCount] = useState(0);

  // ===== STATS =====
  const [projectStats, setProjectStats] = useState(null);

  // ===== FILTER OPTIONS =====
  const [filterOptions, setFilterOptions] = useState({
    statuses: [],
    technologies: [],
    sectors: [],
    countries: [],
    organisms: [],
    lead_institutions: [],
    years: []
  });

  // ===== HELPER FUNCTIONS =====
  const getStatusDisplay = useCallback((status) => {
    const map = {
      'planning': 'Planning',
      'rd': 'R&D',
      'cft': 'Confined Field Trial',
      'commercial': 'Commercial Release',
      'completed': 'Completed',
      'suspended': 'Suspended'
    };
    return map[status] || status;
  }, []);

  const getStatusColor = useCallback((status) => {
    const map = {
      'planning': '#f39c12',
      'rd': '#3498db',
      'cft': '#2ecc71',
      'commercial': '#4a90d9',
      'completed': '#95a5a6',
      'suspended': '#e74c3c'
    };
    return map[status] || '#95a5a6';
  }, []);

  const getTechDisplay = useCallback((tech) => {
    const map = {
      'crispr': 'CRISPR-Cas9',
      'talens': 'TALENs',
      'zfns': 'ZFNs',
      'sdn1': 'SDN-1',
      'sdn2': 'SDN-2',
      'sdn3': 'SDN-3',
      'base_editing': 'Base Editing',
      'prime_editing': 'Prime Editing'
    };
    return map[tech] || tech;
  }, []);

  const getStatusBadgeClass = useCallback((status) => {
    const map = {
      'planning': 'status-planning',
      'rd': 'status-rd',
      'cft': 'status-cft',
      'commercial': 'status-commercial',
      'completed': 'status-completed',
      'suspended': 'status-suspended'
    };
    return map[status] || '';
  }, []);

  const getStatusIcon = useCallback((status) => {
    const map = {
      'planning': 'fa-clock',
      'rd': 'fa-flask',
      'cft': 'fa-seedling',
      'commercial': 'fa-rocket',
      'completed': 'fa-check-circle',
      'suspended': 'fa-pause-circle'
    };
    return map[status] || 'fa-circle';
  }, []);

  // ===== FETCH FILTER OPTIONS =====
  const fetchFilterOptions = useCallback(async () => {
    try {
      const stats = await apiService.getProjectStats();
      setProjectStats(stats);

      const options = {
        statuses: Object.keys(stats.by_status || {}).map(key => ({
          value: key,
          label: getStatusDisplay(key),
          count: stats.by_status[key],
          color: getStatusColor(key),
          icon: getStatusIcon(key)
        })),
        technologies: Object.keys(stats.by_technology || {}).map(key => ({
          value: key,
          label: getTechDisplay(key),
          count: stats.by_technology[key]
        })),
        sectors: Object.keys(stats.by_sector || {}).map(key => ({
          value: key,
          label: key.replace('_', ' ').toUpperCase(),
          count: stats.by_sector[key]
        })),
        countries: (stats.by_country || []).map(c => ({
          value: c.country__name,
          label: c.country__name,
          count: c.count
        })),
        organisms: (stats.by_organism || []).map(o => ({
          value: o.primary_organism__common_name,
          label: o.primary_organism__common_name || 'Unknown',
          count: o.count
        })),
        lead_institutions: [],
        years: []
      };

      if (contextProjects && contextProjects.length > 0) {
        const instSet = new Map();
        contextProjects.forEach(p => {
          if (p.lead_institution_name) {
            instSet.set(p.lead_institution_name, (instSet.get(p.lead_institution_name) || 0) + 1);
          }
        });
        options.lead_institutions = Array.from(instSet.entries()).map(([name, count]) => ({
          value: name,
          label: name,
          count
        }));

        const yearSet = new Set();
        contextProjects.forEach(p => {
          if (p.start_year) yearSet.add(p.start_year);
        });
        options.years = Array.from(yearSet)
          .sort((a, b) => b - a)
          .map(year => ({
            value: year,
            label: year.toString(),
            count: contextProjects.filter(p => p.start_year === year).length
          }));
      }

      setFilterOptions(options);
    } catch (err) {
      console.error('Error fetching filter options:', err);
    }
  }, [contextProjects, getStatusDisplay, getStatusColor, getTechDisplay, getStatusIcon]);

  // ===== FETCH PROJECTS =====
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        page_size: itemsPerPage,
        ...filters
      };

      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await apiService.getProjects(params);
      const projectData = response.results || response;
      setProjects(projectData);
      setFilteredProjects(projectData);
      setTotalCount(response.count || projectData.length);

    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message);
      if (contextProjects && contextProjects.length > 0) {
        let filtered = contextProjects;
        if (filters.search) {
          filtered = filtered.filter(p => 
            p.title.toLowerCase().includes(filters.search.toLowerCase())
          );
        }
        setProjects(filtered);
        setFilteredProjects(filtered);
        setTotalCount(filtered.length);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filters, contextProjects]);

  // ===== URL PARAM HANDLING =====
  useEffect(() => {
    if (id) {
      const fetchProject = async () => {
        try {
          const project = await apiService.getProject(id);
          setSelectedProject(project);
          setShowDetailModal(true);
          document.body.style.overflow = 'hidden';
          const similar = await apiService.getSimilarProjects(id);
          setSimilarProjects(similar);
        } catch (err) {
          console.error('Error fetching project:', err);
        }
      };
      fetchProject();
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [id]);

  // ===== INITIAL LOAD =====
  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // ===== FILTER HANDLERS =====
  const handleFilterChange = (key, value) => {
    const cleanValue = value === '' || value === null || value === undefined ? '' : value;
    setFilters(prev => ({ 
      ...prev, 
      [key]: cleanValue 
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      technology: '',
      sector: '',
      country: '',
      organism: '',
      lead_institution: '',
      search: '',
      year: '',
      funding_min: '',
      funding_max: '',
      sort_by: '-start_year'
    });
    setCurrentPage(1);
  };

  // ===== VIEW MODE HANDLER =====
  const toggleViewMode = (mode) => {
    setViewMode(mode);
  };

  // ===== PROJECT SELECTION =====
  const handleProjectSelect = async (project) => {
    setSelectedProject(project);
    setShowDetailModal(true);
    document.body.style.overflow = 'hidden';
    navigate(`/projects/${project.id}`, { replace: true });
    try {
      const similar = await apiService.getSimilarProjects(project.id);
      setSimilarProjects(similar);
    } catch (err) {
      console.error('Error fetching similar projects:', err);
      setSimilarProjects([]);
    }
  };

  const handleModalClose = () => {
    setShowDetailModal(false);
    document.body.style.overflow = 'unset';
    navigate('/projects', { replace: true });
  };

  // ===== COMPUTED VALUES =====
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const activeFilterCount = Object.keys(filters).filter(key => {
    if (key === 'sort_by') return false;
    return filters[key] && filters[key] !== '';
  }).length;

  // ===== SORTED FILTER OPTIONS =====
  const sortedStatuses = useMemo(() => {
    const order = ['planning', 'rd', 'cft', 'commercial', 'completed', 'suspended'];
    return [...filterOptions.statuses].sort((a, b) => {
      return order.indexOf(a.value) - order.indexOf(b.value);
    });
  }, [filterOptions.statuses]);

  // ===== LOADING STATE =====
  if (loading && !projects.length) {
    return (
      <div className="projects-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading genome editing projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      {/* Back Button */}
      <button className="back-to-home" onClick={onBackClick} aria-label="Back to home">
        <i className="fas fa-arrow-left"></i>
        <span>Back to Home</span>
      </button>

      {/* ===== HEADER ===== */}
      <header className="projects-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <h1 className="page-title">
                <span className="title-icon"><i className="fas fa-flask"></i></span>
                <span className="title-text">Genome Editing Projects</span>
              </h1>
              <p className="page-subtitle">
                Exploring research and development initiatives across Africa
              </p>
            </div>
            <div className="header-right">
              <button 
                className={`filter-toggle-btn ${isMobileFilterOpen ? 'active' : ''}`}
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
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
          {projectStats && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon-wrapper">
                  <i className="fas fa-project-diagram"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{projectStats.total_projects || 0}</span>
                  <span className="stat-label">Total Projects</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper active">
                  <i className="fas fa-play-circle"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{projectStats.active_projects || 0}</span>
                  <span className="stat-label">Active Projects</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper cft">
                  <i className="fas fa-seedling"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">{projectStats.total_cfts || 0}</span>
                  <span className="stat-label">Field Trials</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper funding">
                  <i className="fas fa-coins"></i>
                </div>
                <div className="stat-info">
                  <span className="stat-number">
                    ${(projectStats.total_funding || 0).toLocaleString()}
                  </span>
                  <span className="stat-label">Total Funding</span>
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
              <label className="filter-label" htmlFor="search-projects">
                <i className="fas fa-search"></i> Search
              </label>
              <input
                id="search-projects"
                type="text"
                placeholder="Search projects..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="filter-input"
                aria-label="Search projects"
              />
            </div>

            {/* Status */}
            <div className="filter-group">
              <SearchableDropdown
                label="Status"
                icon="fas fa-circle"
                placeholder="Search status..."
                options={sortedStatuses}
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
                showCounts={true}
              />
            </div>

            {/* Technology */}
            <div className="filter-group">
              <SearchableDropdown
                label="Technology"
                icon="fas fa-microscope"
                placeholder="Search technology..."
                options={filterOptions.technologies}
                value={filters.technology}
                onChange={(value) => handleFilterChange('technology', value)}
                showCounts={true}
              />
            </div>

            {/* Year */}
            <div className="filter-group">
              <SearchableDropdown
                label="Year"
                icon="fas fa-calendar"
                placeholder="Search year..."
                options={filterOptions.years}
                value={filters.year}
                onChange={(value) => handleFilterChange('year', value)}
                showCounts={true}
              />
            </div>

            {/* Sector */}
            <div className="filter-group">
              <SearchableDropdown
                label="Sector"
                icon="fas fa-industry"
                placeholder="Select sector..."
                options={filterOptions.sectors}
                value={filters.sector}
                onChange={(value) => handleFilterChange('sector', value)}
                showCounts={true}
              />
            </div>

            {/* Country */}
            <div className="filter-group">
              <SearchableDropdown
                label="Country"
                icon="fas fa-globe-africa"
                placeholder="Search countries..."
                options={filterOptions.countries}
                value={filters.country}
                onChange={(value) => handleFilterChange('country', value)}
                showCounts={true}
              />
            </div>

            {/* Organism */}
            <div className="filter-group">
              <SearchableDropdown
                label="Organism"
                icon="fas fa-seedling"
                placeholder="Search organisms..."
                options={filterOptions.organisms}
                value={filters.organism}
                onChange={(value) => handleFilterChange('organism', value)}
                showCounts={true}
              />
            </div>

            {/* Lead Institution */}
            <div className="filter-group">
              <SearchableDropdown
                label="Lead Institution"
                icon="fas fa-university"
                placeholder="Search institutions..."
                options={filterOptions.lead_institutions}
                value={filters.lead_institution}
                onChange={(value) => handleFilterChange('lead_institution', value)}
                showCounts={true}
              />
            </div>

            {/* Funding Range */}
            <div className="filter-group">
              <label className="filter-label">
                <i className="fas fa-money-bill-wave"></i> Funding Range
              </label>
              <div className="funding-range">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.funding_min}
                  onChange={(e) => handleFilterChange('funding_min', e.target.value)}
                  className="filter-input funding-input"
                  aria-label="Minimum funding"
                  min="0"
                />
                <span className="range-separator">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.funding_max}
                  onChange={(e) => handleFilterChange('funding_max', e.target.value)}
                  className="filter-input funding-input"
                  aria-label="Maximum funding"
                  min="0"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="filter-group">
              <label className="filter-label" htmlFor="sort-projects">
                <i className="fas fa-sort"></i> Sort By
              </label>
              <select
                id="sort-projects"
                value={filters.sort_by}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                className="filter-select"
              >
                <option value="-start_year">Latest First</option>
                <option value="start_year">Oldest First</option>
                <option value="-created_at">Recently Added</option>
                <option value="title">Alphabetical</option>
                <option value="-funding_amount">Highest Funding</option>
                <option value="funding_amount">Lowest Funding</option>
              </select>
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

        {/* ===== PROJECTS GRID ===== */}
        <main className="projects-content">
          <div className="results-header">
            <div className="results-info">
              <span className="results-count">
                <strong>{totalCount}</strong> projects found
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
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
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
              <h3>Error Loading Projects</h3>
              <p>{error}</p>
              <button onClick={fetchProjects} className="btn-primary">
                <i className="fas fa-redo"></i> Retry
              </button>
            </div>
          ) : (
            <>
              <div className={`projects-grid ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
                {filteredProjects.length === 0 ? (
                  <div className="no-projects">
                    <i className="fas fa-inbox empty-icon"></i>
                    <h3>No projects found</h3>
                    <p>Try adjusting your filters or search terms</p>
                    <button onClick={resetFilters} className="btn-primary">
                      <i className="fas fa-undo"></i> Clear All Filters
                    </button>
                  </div>
                ) : (
                  filteredProjects.map((project, index) => (
                    <div 
                      key={project.id} 
                      className="project-card"
                      onClick={() => handleProjectSelect(project)}
                      style={{ animationDelay: `${index * 0.05}s` }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && handleProjectSelect(project)}
                      aria-label={`View details for ${project.title}`}
                    >
                      <div className="project-card-header">
                        <div className="project-title-section">
                          <h3 className="project-title">{project.title}</h3>
                          <span 
                            className={`project-status ${getStatusBadgeClass(project.status)}`}
                          >
                            <i className={`fas ${getStatusIcon(project.status)}`}></i>
                            {getStatusDisplay(project.status)}
                          </span>
                        </div>
                      </div>

                      <div className="project-card-body">
                        <div className="project-meta-grid">
                          <div className="meta-item">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>{project.country_name || 'N/A'}</span>
                          </div>
                          <div className="meta-item">
                            <i className="fas fa-microscope"></i>
                            <span>{getTechDisplay(project.technology)}</span>
                          </div>
                          <div className="meta-item">
                            <i className="fas fa-calendar-alt"></i>
                            <span>{project.start_year || 'N/A'}</span>
                          </div>
                          {project.primary_organism_name && (
                            <div className="meta-item">
                              <i className="fas fa-seedling"></i>
                              <span>{project.primary_organism_name}</span>
                            </div>
                          )}
                        </div>

                        {project.organisms_list && project.organisms_list.length > 0 && (
                          <div className="project-organisms">
                            {project.organisms_list.slice(0, 4).map(org => (
                              <span key={org.id} className="organism-tag">
                                {org.common_name || org.name}
                              </span>
                            ))}
                            {project.organisms_list.length > 4 && (
                              <span className="organism-tag more">
                                +{project.organisms_list.length - 4}
                              </span>
                            )}
                          </div>
                        )}

                        {project.funding_amount && (
                          <div className="project-funding">
                            <span className="funding-amount">
                              <i className="fas fa-coins"></i>
                              ${Number(project.funding_amount).toLocaleString()}
                            </span>
                            {project.funding_source && (
                              <span className="funding-source">
                                • {project.funding_source}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="project-card-footer">
                        <span className="lead-institution">
                          <i className="fas fa-university"></i>
                          {project.lead_institution_name || 'N/A'}
                        </span>
                        <span className="view-details">
                          View Details <i className="fas fa-arrow-right"></i>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* ===== PAGINATION ===== */}
              {totalPages > 1 && (
                <nav className="pagination" aria-label="Project pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                    aria-label="Previous page"
                  >
                    <i className="fas fa-chevron-left"></i> Previous
                  </button>
                  <div className="pagination-pages">
                    {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 7) {
                        pageNum = i + 1;
                      } else if (currentPage <= 4) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        pageNum = totalPages - 6 + i;
                      } else {
                        pageNum = currentPage - 3 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          className={`pagination-page ${currentPage === pageNum ? 'active' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                          aria-label={`Go to page ${pageNum}`}
                          aria-current={currentPage === pageNum ? 'page' : undefined}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                    aria-label="Next page"
                  >
                    Next <i className="fas fa-chevron-right"></i>
                  </button>
                </nav>
              )}
            </>
          )}
        </main>
      </div>

      {/* ===== PROJECT DETAIL MODAL ===== */}
      {showDetailModal && selectedProject && (
        <div 
          className="modal-overlay" 
          onClick={handleModalClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="modal-container">
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button 
                className="modal-close" 
                onClick={handleModalClose}
                aria-label="Close project details"
              >
                <i className="fas fa-times"></i>
              </button>

              <div className="modal-body">
                <div className="modal-header">
                  <div className="modal-title-section">
                    <h2 id="modal-title">{selectedProject.title}</h2>
                    <span 
                      className={`project-status ${getStatusBadgeClass(selectedProject.status)}`}
                    >
                      <i className={`fas ${getStatusIcon(selectedProject.status)}`}></i>
                      {getStatusDisplay(selectedProject.status)}
                    </span>
                  </div>
                </div>

                <div className="modal-meta-grid">
                  <div className="modal-meta-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <div>
                      <label>Country</label>
                      <span>{selectedProject.country_name || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="modal-meta-item">
                    <i className="fas fa-microscope"></i>
                    <div>
                      <label>Technology</label>
                      <span>{getTechDisplay(selectedProject.technology)}</span>
                    </div>
                  </div>
                  <div className="modal-meta-item">
                    <i className="fas fa-industry"></i>
                    <div>
                      <label>Sector</label>
                      <span>{selectedProject.sector || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="modal-meta-item">
                    <i className="fas fa-calendar-alt"></i>
                    <div>
                      <label>Year</label>
                      <span>{selectedProject.start_year || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="modal-meta-item">
                    <i className="fas fa-university"></i>
                    <div>
                      <label>Lead Institution</label>
                      <span>{selectedProject.lead_institution_name || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="modal-meta-item">
                    <i className="fas fa-coins"></i>
                    <div>
                      <label>Funding</label>
                      <span>
                        {selectedProject.funding_amount 
                          ? `$${Number(selectedProject.funding_amount).toLocaleString()}`
                          : 'N/A'
                        }
                        {selectedProject.funding_source && ` • ${selectedProject.funding_source}`}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedProject.description && (
                  <div className="modal-section">
                    <h3><i className="fas fa-info-circle"></i> Description</h3>
                    <p>{selectedProject.description}</p>
                  </div>
                )}

                {selectedProject.objectives && (
                  <div className="modal-section">
                    <h3><i className="fas fa-bullseye"></i> Objectives</h3>
                    <p>{selectedProject.objectives}</p>
                  </div>
                )}

                {selectedProject.key_achievements && (
                  <div className="modal-section">
                    <h3><i className="fas fa-trophy"></i> Key Achievements</h3>
                    <p>{selectedProject.key_achievements}</p>
                  </div>
                )}

                {selectedProject.organisms_detail && selectedProject.organisms_detail.length > 0 && (
                  <div className="modal-section">
                    <h3><i className="fas fa-seedling"></i> Organisms</h3>
                    <div className="modal-organism-grid">
                      {selectedProject.organisms_detail.map(org => (
                        <div key={org.id} className="modal-organism-item">
                          {org.category_icon && (
                            <i className={`fas ${org.category_icon}`} style={{ color: org.category_color || '#5B7E96' }}></i>
                          )}
                          <div>
                            <span className="organism-name">{org.common_name || org.name}</span>
                            {org.scientific_name && (
                              <span className="organism-scientific">({org.scientific_name})</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.cft_location && (
                  <div className="modal-section">
                    <h3><i className="fas fa-map-pin"></i> Field Trial Details</h3>
                    <div className="modal-cft-details">
                      <div><strong>Location:</strong> {selectedProject.cft_location}</div>
                      {selectedProject.cft_size && (
                        <div><strong>Size:</strong> {selectedProject.cft_size} hectares</div>
                      )}
                      {selectedProject.cft_approval_date && (
                        <div><strong>Approval Date:</strong> {new Date(selectedProject.cft_approval_date).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                )}

                {similarProjects.length > 0 && (
                  <div className="modal-section">
                    <h3><i className="fas fa-link"></i> Similar Projects</h3>
                    <div className="modal-similar-list">
                      {similarProjects.slice(0, 5).map(similar => (
                        <div 
                          key={similar.id} 
                          className="modal-similar-item"
                          onClick={() => {
                            handleModalClose();
                            handleProjectSelect(similar);
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && handleModalClose() && handleProjectSelect(similar)}
                        >
                          <span className="similar-title">{similar.title}</span>
                          <span className="similar-country">
                            <i className="fas fa-map-marker-alt"></i>
                            {similar.country_name}
                          </span>
                          <i className="fas fa-chevron-right similar-arrow"></i>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.partners && selectedProject.partners.length > 0 && (
                  <div className="modal-section">
                    <h3><i className="fas fa-handshake"></i> Partners</h3>
                    <div className="modal-partners-list">
                      {selectedProject.partners.map(partner => (
                        <span key={partner.id} className="modal-partner-tag">
                          {partner.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;