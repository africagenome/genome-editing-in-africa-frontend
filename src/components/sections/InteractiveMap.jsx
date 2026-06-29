// components/sections/InteractiveMap.jsx

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import apiService from '../../services/apiService';
import AfricaMap from '../svg/AfricaMap';
import './InteractiveMap.css';

const InteractiveMap = () => {
  const { countries: contextCountries } = useData();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' });
  const [countryData, setCountryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCountryData, setSelectedCountryData] = useState(null);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [projectStats, setProjectStats] = useState(null);
  const [priorityCrops, setPriorityCrops] = useState([]);
  const mapRef = useRef(null);
  const tooltipTimeoutRef = useRef(null);

  // ===== FETCH PROJECT STATS =====
  const fetchProjectStats = useCallback(async () => {
    try {
      const stats = await apiService.getProjectStats();
      setProjectStats(stats);
      return stats;
    } catch (err) {
      console.warn('Could not fetch project stats:', err);
      return null;
    }
  }, []);

  // ===== FETCH PRIORITY CROPS =====
  const fetchPriorityCrops = useCallback(async () => {
    try {
      const response = await apiService.getPriorityCrops({ limit: 500 });
      const crops = response.results || response || [];
      setPriorityCrops(crops);
      return crops;
    } catch (err) {
      console.warn('Could not fetch priority crops:', err);
      return [];
    }
  }, []);

  // ===== FETCH ALL COUNTRY DATA =====
  const fetchCountryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [countriesRes, stats, crops] = await Promise.all([
        apiService.getCountries({ limit: 100 }),
        fetchProjectStats(),
        fetchPriorityCrops()
      ]);

      const countries = countriesRes.results || countriesRes || [];
      const dataMap = {};
      
      countries.forEach(country => {
        const slug = country.slug || country.name?.toLowerCase().replace(/\s+/g, '-') || '';
        
        const readinessScore = country.readiness_score || 0;
        let activity = 'low';
        if (readinessScore >= 0.7) activity = 'high';
        else if (readinessScore >= 0.4) activity = 'medium';
        
        const biosafetyStatusMap = {
          'functional': 'Functional Framework',
          'draft': 'Draft Guidelines',
          'development': 'Policy Development',
          'none': 'No Specific Framework',
          'under_review': 'Under Review',
          'implemented': 'Implemented'
        };
        
        // ===== GET PROJECT COUNT FROM PROJECT STATS =====
        let projectCount = country.active_projects || 0;
        if (stats && stats.by_country) {
          const countryStat = stats.by_country.find(c => c.country__name === country.name);
          if (countryStat) {
            projectCount = countryStat.count;
          }
        }
        
        // ===== GET PRIORITY CROPS FOR THIS COUNTRY =====
        const countryCrops = crops.filter(crop => 
          crop.country === country.id ||
          crop.country_name?.toLowerCase() === country.name?.toLowerCase() ||
          crop.country_code?.toLowerCase() === country.code?.toLowerCase()
        );
        
        // ===== GET CROP GED POTENTIAL COUNTS =====
        const highPotential = countryCrops.filter(c => c.ged_potential === 'High').length;
        const mediumPotential = countryCrops.filter(c => c.ged_potential === 'Medium').length;
        const lowPotential = countryCrops.filter(c => c.ged_potential === 'Low').length;
        
        dataMap[slug] = {
          id: country.id,
          name: country.name,
          code: country.code,
          flag_emoji: country.flag_emoji || '🌍',
          region: country.region_name || 'Africa',
          activity: activity,
          readinessScore: readinessScore,
          biosafetyStatus: country.biosafety_status || 'development',
          biosafetyStatusDisplay: biosafetyStatusMap[country.biosafety_status] || 'Not specified',
          classificationApproach: country.classification_approach || 'Not specified',
          projects: projectCount,
          priorityCrops: countryCrops,
          priorityCropsCount: countryCrops.length,
          highPotentialCrops: highPotential,
          mediumPotentialCrops: mediumPotential,
          lowPotentialCrops: lowPotential,
          notes: country.notes || '',
          rawData: country
        };
      });
      
      setCountryData(dataMap);
      
      if (window.location.hash) {
        const hashCountry = window.location.hash.substring(1);
        if (dataMap[hashCountry]) {
          setSelectedCountry(hashCountry);
          setSelectedCountryData(dataMap[hashCountry]);
        }
      }
      
    } catch (err) {
      console.error('Error fetching country data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchProjectStats, fetchPriorityCrops]);

  // Load data on mount
  useEffect(() => {
    fetchCountryData();
  }, [fetchCountryData]);

  const getActivityClass = (activity) => {
    switch(activity) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      default: return 'low';
    }
  };

  const getReadinessLevel = (score) => {
    if (score >= 0.7) return { label: 'Advanced', class: 'advanced' };
    if (score >= 0.4) return { label: 'Intermediate', class: 'intermediate' };
    return { label: 'Foundational', class: 'foundational' };
  };

  const getReadinessIcon = (score) => {
    if (score >= 0.7) return '🚀';
    if (score >= 0.4) return '📈';
    return '🌱';
  };

  const getBiosafetyStatusLabel = (status) => {
    const labels = {
      'functional': '✅ Functional Framework',
      'draft': '📝 Draft Guidelines',
      'development': '🔄 Policy Development',
      'none': '⭕ No Specific Framework',
      'under_review': '🔍 Under Review',
      'implemented': '🎯 Implemented'
    };
    return labels[status] || status;
  };

  const getGedPotentialBadgeClass = (potential) => {
    const map = {
      'High': 'bg-success',
      'Medium': 'bg-warning',
      'Low': 'bg-danger'
    };
    return map[potential] || 'bg-secondary';
  };

  const getGedPotentialIcon = (potential) => {
    const map = {
      'High': 'fa-arrow-up',
      'Medium': 'fa-minus',
      'Low': 'fa-arrow-down'
    };
    return map[potential] || 'fa-circle';
  };

  const handleCountryClick = (countryId) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setSelectedCountry(countryId);
    
    window.location.hash = countryId;
    
    const country = countryData[countryId];
    if (country) {
      setSelectedCountryData(country);
    }
    
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  const handleCountryHover = useCallback((event, countryId, countryName) => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    
    setHoveredCountry(countryId);
    
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 12,
      text: countryName
    });
  }, []);

  const handleCountryLeave = useCallback(() => {
    setHoveredCountry(null);
    tooltipTimeoutRef.current = setTimeout(() => {
      setTooltip({ visible: false, x: 0, y: 0, text: '' });
    }, 150);
  }, []);

  // Memoized stats - Removed institutions
  const stats = useMemo(() => {
    const countries = Object.values(countryData);
    const total = countries.length;
    const advanced = countries.filter(c => c.readinessScore >= 0.7).length;
    const intermediate = countries.filter(c => c.readinessScore >= 0.4 && c.readinessScore < 0.7).length;
    const foundational = countries.filter(c => c.readinessScore < 0.4).length;
    const avgScore = total > 0 ? countries.reduce((sum, c) => sum + c.readinessScore, 0) / total : 0;
    const totalProjects = countries.reduce((sum, c) => sum + c.projects, 0);
    const totalPriorityCrops = countries.reduce((sum, c) => sum + c.priorityCropsCount, 0);
    
    return { 
      total, 
      advanced, 
      intermediate, 
      foundational, 
      avgScore, 
      totalProjects, 
      totalPriorityCrops
    };
  }, [countryData]);

  // Check URL hash on mount
  useEffect(() => {
    if (window.location.hash && !loading && Object.keys(countryData).length > 0) {
      const hashCountry = window.location.hash.substring(1);
      if (countryData[hashCountry]) {
        setSelectedCountry(hashCountry);
        setSelectedCountryData(countryData[hashCountry]);
      }
    }
  }, [loading, countryData]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setTooltip({ visible: false, x: 0, y: 0, text: '' });
        setSelectedCountry(null);
        setSelectedCountryData(null);
        window.location.hash = '';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="interactive-map">
        <div className="map-loading">
          <div className="loading-spinner"></div>
          <p>Loading map data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="interactive-map">
        <div className="map-error">
          <span className="error-icon">⚠️</span>
          <h3>Failed to load map</h3>
          <p>{error}</p>
          <button onClick={fetchCountryData} className="retry-button">
            ⟳ Retry
          </button>
        </div>
      </div>
    );
  }

  const displayData = selectedCountryData || (selectedCountry ? countryData[selectedCountry] : null);

  return (
    <div className="interactive-map">
      {/* Header */}
      <header className="map-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="map-title">
              <span className="title-icon">🌍</span>
              Genome Editing in Africa
            </h1>
            <p className="map-subtitle">
              Interactive map showing genome editing readiness across the continent
            </p>
          </div>
          <div className="header-right">
            <div className="header-stats">
              <div className="stat-item">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Countries</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">{stats.totalProjects}</span>
                <span className="stat-label">Projects</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">{stats.totalPriorityCrops}</span>
                <span className="stat-label">Priority Crops</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <section className="map-section">
        <div className="map-grid">

          {/* Map Column */}
          <div className="map-column">
            <div className="map-wrapper">
              <div className="map-container" ref={mapRef}>
                <AfricaMap 
                  selectedCountry={selectedCountry}
                  onCountryClick={handleCountryClick}
                  onCountryHover={handleCountryHover}
                  onCountryLeave={handleCountryLeave}
                  countryData={countryData}
                  hoveredCountry={hoveredCountry}
                />
              </div>
              
              {/* Legend */}
              <div className="map-legend">
                <div className="legend-header">
                  <span className="legend-title">📊 Readiness Level</span>
                </div>
                <div className="legend-items">
                  <div className="legend-item">
                    <span className="legend-color advanced"></span>
                    <div className="legend-info">
                      <strong>Advanced</strong>
                      <span>70%+</span>
                    </div>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color intermediate"></span>
                    <div className="legend-info">
                      <strong>Intermediate</strong>
                      <span>40-69%</span>
                    </div>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color foundational"></span>
                    <div className="legend-info">
                      <strong>Foundational</strong>
                      <span>&lt;40%</span>
                    </div>
                  </div>
                </div>
                <div className="legend-note">
                  <span>💡</span>
                  <span>Click any country for detailed information</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content Column */}
          <div className="content-column">
            {!selectedCountry || !displayData ? (
              <div className="empty-state">
                <div className="empty-icon">👆</div>
                <h3>Select a Country</h3>
                <p>Click on any highlighted country on the map to explore its genome editing progress, readiness score, and key statistics.</p>
                <div className="empty-hint">
                  <span>💡</span>
                  <span>Hover for country names</span>
                </div>
              </div>
            ) : (
              <div className="country-panel">
                <div className="panel-header">
                  <div className="country-title">
                    <span className="country-flag">{displayData.flag_emoji}</span>
                    <h2>{displayData.name}</h2>
                  </div>
                  <button 
                    className="close-button"
                    onClick={() => {
                      setSelectedCountry(null);
                      setSelectedCountryData(null);
                      window.location.hash = '';
                    }}
                    aria-label="Close country details"
                  >
                    ✕
                  </button>
                </div>

                <div className="panel-body">
                  {/* Readiness Score */}
                  <div className="readiness-section">
                    <div className="readiness-display">
                      <div className="readiness-ring">
                        <svg viewBox="0 0 120 120" className="ring-chart">
                          <circle 
                            cx="60" cy="60" r="54" 
                            fill="none" 
                            stroke="#E5E7EB" 
                            strokeWidth="8"
                          />
                          <circle 
                            cx="60" cy="60" r="54" 
                            fill="none" 
                            stroke={displayData.readinessScore >= 0.7 ? '#10B981' : displayData.readinessScore >= 0.4 ? '#F59E0B' : '#EF4444'}
                            strokeWidth="8"
                            strokeDasharray={`${displayData.readinessScore * 339.292} 339.292`}
                            strokeLinecap="round"
                            transform="rotate(-90 60 60)"
                            className="ring-progress"
                          />
                          <text x="60" y="56" textAnchor="middle" className="ring-score">
                            {Math.round(displayData.readinessScore * 100)}%
                          </text>
                          <text x="60" y="76" textAnchor="middle" className="ring-label">
                            Score
                          </text>
                        </svg>
                      </div>
                      <div className="readiness-info">
                        <span className={`readiness-badge ${getReadinessLevel(displayData.readinessScore).class}`}>
                          {getReadinessIcon(displayData.readinessScore)} {getReadinessLevel(displayData.readinessScore).label}
                        </span>
                        <span className="readiness-region">{displayData.region}</span>
                      </div>
                    </div>
                  </div>

                  {/* Biosafety Status */}
                  {displayData.biosafetyStatus && (
                    <div className="biosafety-section">
                      <div className="biosafety-item">
                        <span className="biosafety-icon">🔬</span>
                        <div className="biosafety-content">
                          <span className="biosafety-label">Biosafety Framework</span>
                          <span className="biosafety-value">
                            {getBiosafetyStatusLabel(displayData.biosafetyStatus)}
                          </span>
                        </div>
                      </div>
                      {displayData.classificationApproach && displayData.classificationApproach !== 'Not specified' && (
                        <div className="biosafety-item">
                          <span className="biosafety-icon">📋</span>
                          <div className="biosafety-content">
                            <span className="biosafety-label">Classification</span>
                            <span className="biosafety-value">{displayData.classificationApproach}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Stats Grid - Projects and Priority Crops only */}
                  <center>
                  <div className="stats-grid">
                    <div className="stat-block">
                      <span className="stat-number">{displayData.projects || 0}</span>
                      <span className="stat-label">Projects</span>
                    </div>
                    <div className="stat-block">
                      <span className="stat-number">{displayData.priorityCropsCount || 0}</span>
                      <span className="stat-label">Priority Crops</span>
                    </div>
                  </div>
                  </center>

                  {/* Priority Crops Section - From API */}
                  {displayData.priorityCrops && displayData.priorityCrops.length > 0 ? (
                    <div className="priority-crops-section">
                      <h4 className="priority-crops-title">
                        <i className="fas fa-seedling"></i> National Priority Crops
                        <span className="crop-potential-summary">
                          <span className="potential-high">{displayData.highPotentialCrops} High</span>
                          <span className="potential-medium">{displayData.mediumPotentialCrops} Medium</span>
                          <span className="potential-low">{displayData.lowPotentialCrops} Low</span>
                        </span>
                      </h4>
                      <div className="priority-crops-list">
                        {displayData.priorityCrops.slice(0, 5).map((crop, idx) => (
                          <div key={idx} className="priority-crop-item">
                            <span className="crop-name-display">{crop.organism_name}</span>
                            <span className={`crop-potential-badge ${getGedPotentialBadgeClass(crop.ged_potential)}`}>
                              <i className={`fas ${getGedPotentialIcon(crop.ged_potential)}`}></i>
                              {crop.ged_potential_display}
                            </span>
                          </div>
                        ))}
                        {displayData.priorityCrops.length > 5 && (
                          <div className="priority-crop-item more">
                            <span className="crop-name-display">+{displayData.priorityCrops.length - 5} more</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="priority-crops-section empty">
                      <h4 className="priority-crops-title">
                        <i className="fas fa-seedling"></i> National Priority Crops
                      </h4>
                      <div className="priority-crops-empty">
                        <p>No priority crops data available for this country yet.</p>
                      </div>
                    </div>
                  )}

                  {/* Country Overview */}
                  <div className="overview-section">
                    <h4>📖 Country Overview</h4>
                    {displayData.notes ? (
                      <p>{displayData.notes}</p>
                    ) : (
                      <p>
                        {displayData.name} demonstrates a genome editing readiness score of 
                        <strong> {Math.round(displayData.readinessScore * 100)}%</strong>, 
                        placing it at the <strong>{getReadinessLevel(displayData.readinessScore).label.toLowerCase()}</strong> level.
                        {displayData.projects > 0 && ` With ${displayData.projects} active projects`}
                        {displayData.priorityCropsCount > 0 && ` and ${displayData.priorityCropsCount} priority crops identified for genome editing`}
                        {displayData.projects > 0 || displayData.priorityCropsCount > 0 ? ', the country shows growing engagement in genome editing.' : '.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tooltip */}
      {tooltip.visible && (
        <div 
          className="map-tooltip"
          style={{
            position: 'fixed',
            top: tooltip.y,
            left: tooltip.x,
            transform: 'translateX(-50%)'
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;