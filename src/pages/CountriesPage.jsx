// pages/CountriesPage.jsx

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Chart from 'chart.js/auto';
import { useData } from '../context/DataContext';
import apiService from '../services/apiService';
import './CountriesPage.css';

// ============================================
// MAIN COUNTRIES COMPONENT
// ============================================
const CountriesPage = ({ onBackClick }) => {
  const { countries: contextCountries } = useData();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countries, setCountries] = useState([]);
  
  // Filter states - kept for internal use but no sidebar
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filterOptions, setFilterOptions] = useState({
    regions: [],
    statuses: [],
    sectors: []
  });

  // Priority Crops State
  const [allPriorityCrops, setAllPriorityCrops] = useState([]);

  const trendChartRef = useRef(null);
  const focusChartRef = useRef(null);
  const readinessChartRef = useRef(null);
  const chartInstances = useRef({ trend: null, focus: null, readiness: null });

  // ===== FETCH PRIORITY CROPS =====
  const fetchPriorityCrops = useCallback(async () => {
    try {
      const response = await apiService.getPriorityCrops({ limit: 500 });
      const cropsData = response.results || response || [];
      setAllPriorityCrops(cropsData);
    } catch (err) {
      console.warn('Could not fetch priority crops:', err);
      setAllPriorityCrops([]);
    }
  }, []);

  // ===== FILTER OPTIONS =====
  useEffect(() => {
    if (countries.length > 0) {
      const regions = [...new Set(countries.map(c => c.region_name).filter(Boolean))].map(region => ({
        value: region,
        label: region,
        count: countries.filter(c => c.region_name === region).length
      }));

      const statuses = [
        { value: 'functional', label: 'Functional Framework', count: countries.filter(c => c.biosafety_status === 'functional').length },
        { value: 'draft', label: 'Draft Guidelines', count: countries.filter(c => c.biosafety_status === 'draft').length },
        { value: 'development', label: 'Policy Development', count: countries.filter(c => c.biosafety_status === 'development').length },
        { value: 'none', label: 'No Specific Framework', count: countries.filter(c => c.biosafety_status === 'none').length }
      ];

      const sectors = [
        { value: 'agriculture', label: 'Agriculture', count: countries.filter(c => c.sector === 'agriculture').length },
        { value: 'health', label: 'Health', count: countries.filter(c => c.sector === 'health').length },
        { value: 'industry', label: 'Industry', count: countries.filter(c => c.sector === 'industry').length }
      ];

      setFilterOptions({ regions, statuses, sectors });
    }
  }, [countries]);

  // ===== FETCH COUNTRIES =====
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const response = await apiService.getCountries({ limit: 100 });
        const countriesData = response.results || response || [];
        setCountries(countriesData);
        
        if (countriesData.length > 0 && !selectedCountry) {
          setSelectedCountry(countriesData[0]);
        }
      } catch (err) {
        console.error('Error fetching countries:', err);
        setError('Failed to load countries. Please try again.');
        if (contextCountries && contextCountries.length > 0) {
          setCountries(contextCountries);
          setSelectedCountry(contextCountries[0]);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
    fetchPriorityCrops();
  }, [contextCountries, fetchPriorityCrops]);

  // ===== FETCH COUNTRY DETAILS =====
  useEffect(() => {
    if (selectedCountry) {
      fetchCountryDetails(selectedCountry);
    }
  }, [selectedCountry]);

  // ===== FILTER COUNTRIES =====
  const filteredCountries = useMemo(() => {
    let results = [...countries];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(c => 
        c.name?.toLowerCase().includes(term) ||
        c.region_name?.toLowerCase().includes(term)
      );
    }

    if (selectedRegion) {
      results = results.filter(c => c.region_name === selectedRegion);
    }

    if (selectedStatus) {
      results = results.filter(c => c.biosafety_status === selectedStatus);
    }

    if (selectedSector) {
      results = results.filter(c => c.sector === selectedSector);
    }

    return results;
  }, [countries, searchTerm, selectedRegion, selectedStatus, selectedSector]);

  // ===== RESET FILTERS =====
  const resetFilters = () => {
    setSelectedRegion('');
    setSelectedStatus('');
    setSelectedSector('');
    setSearchTerm('');
  };

  // ===== GET PRIORITY CROPS FOR A COUNTRY =====
  const getCountryPriorityCrops = useCallback((country) => {
    if (!country || !allPriorityCrops.length) return [];
    
    const crops = allPriorityCrops.filter(crop => {
      if (crop.country === country.id) return true;
      if (crop.country_name?.toLowerCase() === country.name?.toLowerCase()) return true;
      if (crop.country_code?.toLowerCase() === country.code?.toLowerCase()) return true;
      return false;
    });
    
    return crops;
  }, [allPriorityCrops]);

  // ===== FETCH COUNTRY DETAILS =====
  const fetchCountryDetails = async (country) => {
    try {
      setLoading(true);
      setError(null);

      const countryDetail = await apiService.getCountry(country.id);
      const projectsResponse = await apiService.getCountryProjects(country.id);
      const projects = projectsResponse.results || projectsResponse || [];
      const pubsResponse = await apiService.getCountryPublications(country.id);
      const publications = pubsResponse.results || pubsResponse || [];
      const expertsResponse = await apiService.getCountryExperts(country.id);
      const experts = expertsResponse.results || expertsResponse || [];
      const organismsResponse = await apiService.getCountryOrganisms(country.id);
      const organisms = organismsResponse.results || organismsResponse || [];

      // Get priority crops for this country
      const countryCrops = getCountryPriorityCrops(country);

      // Get commercial projects count
      let commercialProjects = 0;
      try {
        const statsResponse = await apiService.getProjectStats();
        if (statsResponse && statsResponse.by_country) {
          const countryStats = statsResponse.by_country.find(c => c.country__name === country.name);
          if (countryStats) {
            commercialProjects = projects.filter(p => p.status === 'commercial').length;
          }
        }
      } catch (statsErr) {
        commercialProjects = projects.filter(p => p.status === 'commercial').length;
      }

      const enrichedData = {
        id: country.id,
        name: country.name,
        flag: country.flag_emoji || '🌍',
        capital: country.capital || 'N/A',
        population: country.population || 'N/A',
        code: country.code,
        region: country.region_name,
        metrics: {
          projects: country.active_projects || projects.length,
          cfts: country.confined_field_trials || 0,
          commercial: commercialProjects,
          publications: country.publications_count || publications.length,
          institutions: country.institutions_count || 0,
          researchers: country.researchers_trained || 0,
          readiness: country.readiness_score || 0,
          collaborations: country.international_alignment ? 1 : 0,
          priority_crops: countryCrops.length || 0
        },
        trends: buildTrends(projects, publications),
        focus: buildFocusAreas(projects),
        projects: projects.slice(0, 5),
        timeline: buildTimeline(countryDetail, projects),
        regulatory: {
          biosafety: getBiosafetyStatus(country.biosafety_status),
          gedGuidelines: country.ged_guidelines || 'Not specified',
          classification: country.classification_approach || 'Not specified',
          lastUpdate: country.updated_at ? new Date(country.updated_at).getFullYear() : 'N/A',
          status: getRegulatoryStatus(country.biosafety_status)
        },
        publications: publications.slice(0, 5),
        experts: experts.slice(0, 5),
        organisms: organisms.slice(0, 5),
        priorityCrops: countryCrops
      };

      setCountryData(enrichedData);
    } catch (err) {
      console.error('Error fetching country details:', err);
      setError('Failed to load country details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ===== HELPER FUNCTIONS =====
  const buildTrends = (projects, publications) => {
    const years = ['2021', '2022', '2023', '2024', '2025', '2026'];
    const projectCounts = years.map(year => 
      projects.filter(p => p.start_year && p.start_year <= parseInt(year)).length
    );
    const pubCounts = years.map(year => 
      publications.filter(p => p.year && p.year <= parseInt(year)).length
    );
    
    return { years, projects: projectCounts, pubs: pubCounts };
  };

  const buildFocusAreas = (projects) => {
    const focusMap = {};
    projects.forEach(p => {
      const sector = p.sector || 'Agriculture';
      focusMap[sector] = (focusMap[sector] || 0) + 1;
    });
    
    const labels = Object.keys(focusMap);
    const values = Object.values(focusMap);
    const total = values.reduce((a, b) => a + b, 0);
    
    if (total === 0) {
      return { labels: ['Agriculture', 'Health', 'Capacity Building'], values: [60, 25, 15] };
    }
    
    return {
      labels: labels.map(l => l.replace('_', ' ').toUpperCase()),
      values: values.map(v => Math.round((v / total) * 100))
    };
  };

  const buildTimeline = (country, projects) => {
    const timeline = [];
    
    if (country.biosafety_act_date) {
      timeline.push({
        year: new Date(country.biosafety_act_date).getFullYear().toString(),
        text: 'Biosafety Act enacted',
        type: 'policy'
      });
    }
    
    if (country.ged_guidelines_date) {
      timeline.push({
        year: new Date(country.ged_guidelines_date).getFullYear().toString(),
        text: 'Genome Editing Guidelines adopted',
        type: 'policy'
      });
    }
    
    projects.slice(0, 3).forEach(p => {
      if (p.start_year) {
        timeline.push({
          year: p.start_year.toString(),
          text: p.title,
          type: 'project'
        });
      }
    });
    
    timeline.sort((a, b) => parseInt(a.year) - parseInt(b.year));
    
    if (timeline.length === 0) {
      return [
        { year: '2022', text: 'Policy development initiated', type: 'policy' },
        { year: '2024', text: 'Stakeholder engagement underway', type: 'milestone' }
      ];
    }
    
    return timeline;
  };

  const getBiosafetyStatus = (status) => {
    const map = {
      'functional': 'Functional Framework',
      'draft': 'Draft Guidelines',
      'development': 'Policy Development',
      'none': 'No Specific Framework',
      'under_review': 'Under Review'
    };
    return map[status] || 'Not specified';
  };

  const getRegulatoryStatus = (status) => {
    const map = {
      'functional': 'Active',
      'implemented': 'Active',
      'draft': 'In Development',
      'development': 'In Development',
      'under_review': 'Under Review',
      'none': 'Not Started'
    };
    return map[status] || 'Not specified';
  };

  const getStatusClass = (status) => {
    const map = { "cft": "status-cft", "rd": "status-rd", "commercial": "status-commercial", "planning": "status-rd" };
    return map[status] || "status-rd";
  };

  const getTimelineTypeClass = (type) => {
    const map = { "policy": "timeline-policy", "milestone": "timeline-milestone", "project": "timeline-project" };
    return map[type] || "timeline-milestone";
  };

  const getReadinessLevel = (score) => {
    if (score >= 0.7) return { level: 'Advanced', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
    if (score >= 0.55) return { level: 'Intermediate', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' };
    return { level: 'Foundational', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' };
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
      'High': 'fa-arrow-up text-success',
      'Medium': 'fa-minus text-warning',
      'Low': 'fa-arrow-down text-danger'
    };
    return map[potential] || 'fa-circle text-secondary';
  };

  // ===== CHART INITIALIZATION =====
  useEffect(() => {
    if (countryData && !loading) {
      const timer = setTimeout(() => initializeCharts(), 100);
      return () => clearTimeout(timer);
    }
  }, [countryData, loading]);

  const destroyCharts = () => {
    Object.keys(chartInstances.current).forEach(key => {
      if (chartInstances.current[key]) {
        chartInstances.current[key].destroy();
        chartInstances.current[key] = null;
      }
    });
  };

  const initializeCharts = () => {
    if (!countryData) return;
    destroyCharts();

    const trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
      chartInstances.current.trend = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: countryData.trends.years,
          datasets: [
            { 
              label: 'Active Projects', 
              data: countryData.trends.projects, 
              borderColor: '#5B7E96', 
              backgroundColor: 'rgba(91,126,150,0.1)', 
              fill: true, 
              tension: 0.3,
              borderWidth: 3,
              pointRadius: 4,
              pointHoverRadius: 6
            },
            { 
              label: 'Publications', 
              data: countryData.trends.pubs, 
              borderColor: '#B4A269', 
              backgroundColor: 'rgba(180,162,105,0.05)', 
              fill: true, 
              tension: 0.3,
              borderWidth: 3,
              pointRadius: 4,
              pointHoverRadius: 6
            }
          ]
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: true,
          plugins: { 
            legend: { position: 'top' },
            tooltip: { mode: 'index', intersect: false }
          },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Count' } }
          }
        }
      });
    }

    const focusCtx = document.getElementById('focusChart');
    if (focusCtx) {
      chartInstances.current.focus = new Chart(focusCtx, {
        type: 'doughnut',
        data: {
          labels: countryData.focus.labels,
          datasets: [{ 
            data: countryData.focus.values, 
            backgroundColor: ['#5B7E96', '#B4A269', '#6C9EBF', '#D4A373', '#2C6E49'],
            borderWidth: 0,
            hoverOffset: 10
          }]
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: true,
          plugins: { 
            legend: { position: 'bottom' },
            tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw}%` } }
          }
        }
      });
    }

    const readinessCtx = document.getElementById('readinessChart');
    if (readinessCtx) {
      const readinessScore = countryData.metrics.readiness * 100;
      chartInstances.current.readiness = new Chart(readinessCtx, {
        type: 'doughnut',
        data: {
          labels: ['Readiness Score', 'Remaining'],
          datasets: [{ 
            data: [readinessScore, 100 - readinessScore], 
            backgroundColor: ['#2C6E49', '#E4E8EF'],
            borderWidth: 0
          }]
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: true,
          cutout: '70%',
          plugins: { 
            legend: { display: false },
            tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw}%` } }
          }
        }
      });
    }
  };

  const readiness = countryData ? getReadinessLevel(countryData.metrics.readiness) : { level: '', color: '', bg: '' };

  // ===== LOADING STATE =====
  if (loading && !countryData) {
    return (
      <div className="countries-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading country data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="countries-page">
      {/* Back Button */}
      <button className="back-to-home" onClick={onBackClick} aria-label="Back to home">
        <i className="fas fa-arrow-left"></i>
        <span>Back to Home</span>
      </button>

      {/* ===== HEADER ===== */}
      <header className="countries-header">
        <div className="container">
          <div className="header-content">
            <div className="header-left">
              <h1 className="page-title">
                <span className="title-icon"><i className="fas fa-flag-checkered"></i></span>
                <span className="title-text">Country Profile Dashboard</span>
              </h1>
              <p className="page-subtitle">
                Comprehensive genome editing landscape data for African nations
              </p>
            </div>
          </div>

         
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <div className="container main-content">
        {/* ===== COUNTRY CONTENT ===== */}
        <main className="countries-content-full">
          {/* Results Header with Search */}
          <div className="results-header">
            <div className="results-info">
              <span className="results-count">
                <strong>{filteredCountries.length}</strong> countries found
              </span>
            </div>
            {/* <div className="results-actions">
              <div className="search-box-inline">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input-inline"
                  aria-label="Search countries"
                />
              </div>
            </div> */}
          </div>

          {error ? (
            <div className="error-message">
              <i className="fas fa-exclamation-circle error-icon"></i>
              <h3>Unable to load countries</h3>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="btn-primary">
                <i className="fas fa-redo"></i> Retry
              </button>
            </div>
          ) : (
            <>
              {/* Country Selector */}
              <div className="country-selector-enhanced">
                <div className="selector-header">
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Select Country:</span>
                </div>
                <select 
                  className="country-select-enhanced" 
                  value={selectedCountry?.id || ''}
                  onChange={(e) => {
                    const country = filteredCountries.find(c => c.id === parseInt(e.target.value));
                    if (country) setSelectedCountry(country);
                  }}
                >
                  {filteredCountries.map(country => (
                    <option key={country.id} value={country.id}>
                      {country.flag_emoji || '🌍'} {country.name}
                    </option>
                  ))}
                </select>
               
              </div>

              {loading ? (
                <div className="loading-state">
                  <div className="loading-spinner"></div>
                  <p>Loading country data...</p>
                </div>
              ) : countryData && (
                <>
                  {/* Country Header */}
                  <div className="country-header-card">
                    <div className="country-flag-large">
                      <span>{countryData.flag}</span>
                    </div>
                    <div className="country-info">
                      <h2>{countryData.name}</h2>
                      <div className="country-meta">
                        <span><i className="fas fa-building"></i> Capital: {countryData.capital}</span>
                        <span><i className="fas fa-users"></i> Population: {countryData.population}</span>
                        <span><i className="fas fa-globe"></i> Region: {countryData.region}</span>
                      </div>
                      <div className="readiness-badge" style={{ background: readiness.bg, color: readiness.color }}>
                        <i className="fas fa-chart-line"></i> Readiness: {readiness.level} ({(countryData.metrics.readiness * 100).toFixed(0)}%)
                      </div>
                    </div>
                  </div>

                  {/* KPI Cards */}
                  <div className="kpi-grid">
                    <div className="kpi-card">
                      <div className="kpi-icon"><i className="fas fa-project-diagram"></i></div>
                      <div className="kpi-content">
                        <div className="kpi-value">{countryData.metrics.projects}</div>
                        <div className="kpi-label">Active Projects</div>
                      </div>
                    </div>
                   
                    <div className="kpi-card">
                      <div className="kpi-icon"><i className="fas fa-rocket"></i></div>
                      <div className="kpi-content">
                        <div className="kpi-value">{countryData.metrics.commercial || 0}</div>
                        <div className="kpi-label">Commercial Release</div>
                      </div>
                    </div>
                    <div className="kpi-card">
                      <div className="kpi-icon"><i className="fas fa-seedling"></i></div>
                      <div className="kpi-content">
                        <div className="kpi-value">{countryData.metrics.priority_crops || 0}</div>
                        <div className="kpi-label">Priority Crops/Livestock</div>
                      </div>
                    </div>
                    
                    <div className="kpi-card">
                      <div className="kpi-icon"><i className="fas fa-university"></i></div>
                      <div className="kpi-content">
                        <div className="kpi-value">{countryData.metrics.institutions}</div>
                        <div className="kpi-label">Institutions</div>
                      </div>
                    </div>
                  </div>

                  {/* Charts Row */}
                  <div className="charts-row">
                    <div className="chart-card">
                      <h3><i className="fas fa-chart-line"></i> Project Trends</h3>
                      <div className="chart-container">
                        <canvas id="trendChart"></canvas>
                      </div>
                    </div>
                    {/* <div className="chart-card">
                      <h3><i className="fas fa-chart-pie"></i> Research Focus Areas</h3>
                      <div className="chart-container">
                        <canvas id="focusChart"></canvas>
                      </div>
                    </div> */}
                    <div className="chart-card">
                      <h3><i className="fas fa-tachometer-alt"></i> Readiness Score</h3>
                      <div className="gauge-container">
                        <canvas id="readinessChart"></canvas>
                        <div className="gauge-center">
                          <span className="gauge-value">{Math.round(countryData.metrics.readiness * 100)}%</span>
                          <span className="gauge-label">Ready</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ===== NATIONAL PRIORITY CROPS SECTION ===== */}
                  <div className="info-card priority-crops-card">
                    <h3>
                      <i className="fas fa-seedling"></i> National Priority Crops/Livestock
                      <span className="badge-crops">{countryData.priorityCrops?.length || 0}</span>
                    </h3>
                    
                    {countryData.priorityCrops && countryData.priorityCrops.length > 0 ? (
                      <>
                        <div className="priority-crops-grid">
                          {countryData.priorityCrops.map((crop, idx) => (
                            <div key={idx} className="crop-card">
                              <div className="crop-header">
                                <div className="crop-icon">
                                  <i className="fas fa-seedling"></i>
                                </div>
                                <div className="crop-name">
                                  <h4>{crop.organism_name}</h4>
                                  <span className="crop-scientific">{crop.organism_scientific}</span>
                                </div>
                                <span className={`crop-potential-badge ${getGedPotentialBadgeClass(crop.ged_potential)}`}>
                                  <i className={`fas ${getGedPotentialIcon(crop.ged_potential)}`}></i>
                                  {crop.ged_potential_display}
                                </span>
                              </div>
                              <div className="crop-details">
                                <div className="crop-detail-item">
                                  <span className="detail-label">Trait Improvement:</span>
                                  <span className="detail-value">{crop.trait_improvement || 'N/A'}</span>
                                </div>
                                <div className="crop-detail-item">
                                  <span className="detail-label">Socio-Economic Importance:</span>
                                  <span className="detail-value">{crop.socio_economic_importance || 'N/A'}</span>
                                </div>
                                {crop.existing_rd && (
                                  <div className="crop-detail-item">
                                    <span className="detail-label">Existing R&D:</span>
                                    <span className="detail-value">{crop.existing_rd_details || crop.existing_rd}</span>
                                  </div>
                                )}
                                {crop.production_gap && (
                                  <div className="crop-detail-item">
                                    <span className="detail-label">Production Gap:</span>
                                    <span className={`detail-value ${crop.has_production_increase ? 'text-success' : 'text-danger'}`}>
                                      {crop.production_gap_percentage && `${Math.abs(crop.production_gap_percentage).toFixed(1)}%`}
                                      {crop.has_production_increase ? ' ↑' : ' ↓'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="crops-note">
                          <i className="fas fa-info-circle"></i>
                          <span>Priority crops identified as having high potential for genome editing technology application.</span>
                        </div>
                      </>
                    ) : (
                      <div className="crops-empty-state">
                        <div className="crops-empty-icon">
                          <i className="fas fa-seedling"></i>
                        </div>
                        <h4>No Priority Crops/Livestock Data Available</h4>
                        <p>Priority crop data for {countryData.name} is currently being compiled. Check back later for updates.</p>
                        <div className="crops-empty-hint">
                          <i className="fas fa-lightbulb"></i>
                          <span>Countries with priority crop data will appear here</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Regulatory Framework */}
                  <div className="info-card">
                    <h3><i className="fas fa-gavel"></i> Regulatory Framework</h3>
                    <div className="regulatory-grid">
                      <div className="regulatory-item">
                        <span className="reg-label">Biosafety Framework:</span>
                        <span className="reg-value">{countryData.regulatory.biosafety}</span>
                      </div>
                      <div className="regulatory-item">
                        <span className="reg-label">GEd Guidelines:</span>
                        <span className="reg-value">{countryData.regulatory.gedGuidelines}</span>
                      </div>
                      <div className="regulatory-item">
                        <span className="reg-label">Classification:</span>
                        <span className="reg-value">{countryData.regulatory.classification}</span>
                      </div>
                      <div className="regulatory-item">
                        <span className="reg-label">Last Update:</span>
                        <span className="reg-value">{countryData.regulatory.lastUpdate}</span>
                      </div>
                      <div className="regulatory-item">
                        <span className="reg-label">Status:</span>
                        <span className={`reg-status ${countryData.regulatory.status === 'Active' ? 'active' : 'developing'}`}>
                          {countryData.regulatory.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Key Projects */}
                  {countryData.projects && countryData.projects.length > 0 && (
                    <div className="info-card">
                      <h3><i className="fas fa-microscope"></i> Key Projects</h3>
                      <div className="projects-list">
                        {countryData.projects.map((project, idx) => (
                          <div key={idx} className="project-item">
                            <div className="project-info">
                              <div className="project-name">{project.title}</div>
                              <div className="project-details">
                                <span><i className="fas fa-calendar"></i> {project.start_year || 'N/A'}</span>
                                <span><i className="fas fa-building"></i> {project.lead_institution_name || 'N/A'}</span>
                              </div>
                            </div>
                            <span className={`project-status ${getStatusClass(project.status)}`}>
                              {project.status?.toUpperCase() || 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Experts */}
                  {countryData.experts && countryData.experts.length > 0 && (
                    <div className="info-card">
                      <h3><i className="fas fa-users"></i> Key Experts</h3>
                      <div className="experts-list">
                        {countryData.experts.map((expert, idx) => (
                          <div key={idx} className="expert-item">
                            <div className="expert-icon"><i className="fas fa-user-circle"></i></div>
                            <div className="expert-info">
                              <div className="expert-name">{expert.name}</div>
                              <div className="expert-meta">
                                <span>{expert.title || 'Researcher'}</span>
                                <span>{expert.institution_name || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Publications */}
                  {countryData.publications && countryData.publications.length > 0 && (
                    <div className="info-card">
                      <h3><i className="fas fa-file-alt"></i> Key Reports</h3>
                      <div className="publications-list">
                        {countryData.publications.map((pub, idx) => (
                          <div key={idx} className="publication-item">
                            <div className="pub-icon"><i className="fas fa-file-pdf"></i></div>
                            <div className="pub-info">
                              <div className="pub-title">{pub.title}</div>
                              <div className="pub-meta">
                                <span>{pub.journal || 'N/A'}</span>
                                <span>{pub.year || 'N/A'}</span>
                                <span><i className="fas fa-quote-right"></i> {pub.citations || 0} citations</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="info-card">
                    <h3><i className="fas fa-history"></i> Regulatory & Policy Timeline</h3>
                    <div className="timeline-container">
                      {countryData.timeline.map((item, idx) => (
                        <div key={idx} className={`timeline-item ${getTimelineTypeClass(item.type)}`}>
                          <div className="timeline-year">{item.year}</div>
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <p>{item.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="countries-footer">
        <div className="container">
          <div className="footer-content">
            <p>© {new Date().getFullYear()} AUDA-NEPAD Genome Editing Programme — Data updated quarterly.</p>
            <button onClick={onBackClick} className="footer-back-btn">
              <i className="fas fa-home"></i> Back to Home
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CountriesPage;