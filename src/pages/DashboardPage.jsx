// pages/DashboardPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import apiService from '../services/apiService';
import './DashboardPage.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale
);

const getReadinessLevel = (score) => {
  if (score >= 0.7) return { level: 'Advanced', color: '#10B981', icon: '🚀' };
  if (score >= 0.55) return { level: 'Intermediate', color: '#F59E0B', icon: '📈' };
  return { level: 'Foundational', color: '#EF4444', icon: '🌱' };
};

const DashboardPage = ({ onBackClick }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        projectsRes,
        institutionsRes,
        countriesRes,
        organismsRes
      ] = await Promise.all([
        apiService.getProjects({ limit: 500 }),
        apiService.getInstitutions({ limit: 500 }),
        apiService.getCountries({ limit: 100 }),
        apiService.getOrganisms({ limit: 500 })
      ]);

      const projects = projectsRes.results || projectsRes || [];
      const institutions = institutionsRes.results || institutionsRes || [];
      const countries = countriesRes.results || countriesRes || [];
      const organisms = organismsRes.results || organismsRes || [];

      // Projects per year
      const projectsByYear = projects.reduce((acc, p) => {
        const year = p.start_year || p.year || 'Unknown';
        if (year !== 'Unknown') {
          acc[year] = (acc[year] || 0) + 1;
        }
        return acc;
      }, {});
      const sortedYears = Object.keys(projectsByYear).sort();

      // Projects per country
      const projectsByCountry = projects.reduce((acc, p) => {
        const country = p.country_name || p.country?.name || 'Unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {});
      const sortedCountries = Object.keys(projectsByCountry)
        .filter(c => c !== 'Unknown')
        .sort((a, b) => projectsByCountry[b] - projectsByCountry[a])
        .slice(0, 12);

      // Readiness per country
      const readinessByCountry = countries.reduce((acc, c) => {
        const name = c.name || c.country_name || 'Unknown';
        const score = c.readiness_score || c.readiness || 0;
        acc[name] = {
          score: score,
          level: getReadinessLevel(score)
        };
        return acc;
      }, {});
      const readinessSorted = Object.keys(readinessByCountry)
        .sort((a, b) => readinessByCountry[b].score - readinessByCountry[a].score)
        .slice(0, 12);

      // Institutions per country
      const institutionsByCountry = institutions.reduce((acc, inst) => {
        const country = inst.country_name || inst.country?.name || 'Unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {});
      const institutionsSorted = Object.keys(institutionsByCountry)
        .filter(c => c !== 'Unknown')
        .sort((a, b) => institutionsByCountry[b] - institutionsByCountry[a])
        .slice(0, 12);

      // Institutions by category
      const institutionsByCategory = institutions.reduce((acc, inst) => {
        const category = inst.type || inst.category || 'Research';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      // Organisms per country
      const organismsByCountry = organisms.reduce((acc, org) => {
        const country = org.country_name || org.country?.name || 'Unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {});
      const organismsSorted = Object.keys(organismsByCountry)
        .filter(c => c !== 'Unknown')
        .sort((a, b) => organismsByCountry[b] - organismsByCountry[a])
        .slice(0, 12);

      const summary = {
        totalProjects: projects.length,
        totalCountries: countries.length,
        totalInstitutions: institutions.length,
        totalOrganisms: organisms.length,
      };

      const processedData = {
        summary,
        projectsByYear,
        projectsByCountry,
        readinessByCountry,
        institutionsByCountry,
        institutionsByCategory,
        organismsByCountry,
        sortedYears,
        sortedCountries,
        readinessSorted,
        institutionsSorted,
        organismsSorted,
      };

      setDashboardData(processedData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Chart Configurations
  const projectsByYearChartData = useMemo(() => {
    if (!dashboardData) return null;
    const { projectsByYear, sortedYears } = dashboardData;
    
    return {
      labels: sortedYears,
      datasets: [{
        label: 'Projects',
        data: sortedYears.map(y => projectsByYear[y] || 0),
        borderColor: '#5B7E96',
        backgroundColor: 'rgba(91, 126, 150, 0.08)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#5B7E96',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        borderWidth: 3,
      }]
    };
  }, [dashboardData]);

  const projectsByCountryChartData = useMemo(() => {
    if (!dashboardData) return null;
    const { projectsByCountry, sortedCountries } = dashboardData;
    
    const gradientColors = sortedCountries.map((_, i) => {
      const opacity = 0.4 + (i / sortedCountries.length) * 0.4;
      return `rgba(91, 126, 150, ${opacity})`;
    });
    
    return {
      labels: sortedCountries,
      datasets: [{
        label: 'Projects',
        data: sortedCountries.map(c => projectsByCountry[c] || 0),
        backgroundColor: gradientColors,
        borderColor: '#5B7E96',
        borderWidth: 1.5,
        borderRadius: 6,
        barThickness: 16,
      }]
    };
  }, [dashboardData]);

  const readinessChartData = useMemo(() => {
    if (!dashboardData) return null;
    const { readinessByCountry, readinessSorted } = dashboardData;
    
    const colors = readinessSorted.map(c => readinessByCountry[c].level.color);
    
    return {
      labels: readinessSorted,
      datasets: [{
        label: 'Readiness Score',
        data: readinessSorted.map(c => Math.round(readinessByCountry[c].score * 100)),
        backgroundColor: colors.map(c => c + '30'),
        borderColor: colors,
        borderWidth: 2.5,
        borderRadius: 6,
        barThickness: 16,
      }]
    };
  }, [dashboardData]);

  const institutionsByCountryChartData = useMemo(() => {
    if (!dashboardData) return null;
    const { institutionsByCountry, institutionsSorted } = dashboardData;
    
    return {
      labels: institutionsSorted,
      datasets: [{
        label: 'Institutions',
        data: institutionsSorted.map(c => institutionsByCountry[c] || 0),
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: '#8B5CF6',
        borderWidth: 1.5,
        borderRadius: 6,
        barThickness: 16,
      }]
    };
  }, [dashboardData]);

  const institutionsByCategoryChartData = useMemo(() => {
    if (!dashboardData) return null;
    const { institutionsByCategory } = dashboardData;
    
    const categoryColors = {
      'research': '#3B82F6',
      'regulatory': '#EF4444',
      'academic': '#8B5CF6',
      'private': '#10B981',
      'cso': '#F59E0B',
      'government': '#6B7280',
      'cg_center': '#14B8A6',
      'international': '#EC4899'
    };
    
    const labels = Object.keys(institutionsByCategory);
    const colors = labels.map(l => categoryColors[l.toLowerCase()] || '#6B7280');
    
    return {
      labels,
      datasets: [{
        data: Object.values(institutionsByCategory),
        backgroundColor: colors,
        borderWidth: 3,
        borderColor: '#FFFFFF',
        hoverOffset: 12,
      }]
    };
  }, [dashboardData]);

  const organismsByCountryChartData = useMemo(() => {
    if (!dashboardData) return null;
    const { organismsByCountry, organismsSorted } = dashboardData;
    
    return {
      labels: organismsSorted,
      datasets: [{
        label: 'Organisms',
        data: organismsSorted.map(c => organismsByCountry[c] || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: '#10B981',
        borderWidth: 1.5,
        borderRadius: 6,
        barThickness: 16,
      }]
    };
  }, [dashboardData]);

  const readinessSummary = useMemo(() => {
    if (!dashboardData) return null;
    const { readinessByCountry } = dashboardData;
    const values = Object.values(readinessByCountry);
    const avgScore = values.reduce((sum, v) => sum + v.score, 0) / values.length || 0;
    const advanced = values.filter(v => v.score >= 0.7).length;
    const intermediate = values.filter(v => v.score >= 0.55 && v.score < 0.7).length;
    const foundational = values.filter(v => v.score < 0.55).length;
    
    return { avgScore, advanced, intermediate, foundational, total: values.length };
  }, [dashboardData]);

  // Chart options
  const horizontalBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: { 
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { size: 12, weight: '600' },
        bodyFont: { size: 11 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => `${ctx.parsed.x} items`
        }
      }
    },
    scales: {
      x: { 
        beginAtZero: true, 
        grid: { color: 'rgba(0,0,0,0.05)' },
        title: { display: true, text: 'Count', font: { size: 11, weight: '500' } }
      },
      y: { 
        grid: { display: false },
        ticks: { font: { size: 11 } }
      }
    }
  };

  const readinessBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleFont: { size: 12, weight: '600' },
        bodyFont: { size: 11 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (ctx) => `${ctx.parsed.x}% Readiness`
        }
      }
    },
    scales: {
      x: { 
        beginAtZero: true, 
        max: 100,
        grid: { color: 'rgba(0,0,0,0.05)' },
        title: { display: true, text: 'Score (%)', font: { size: 11, weight: '500' } }
      },
      y: { 
        grid: { display: false },
        ticks: { font: { size: 11 } }
      }
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: { 
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: '500' }
        }
      }
    },
    scales: {
      y: { 
        beginAtZero: true, 
        grid: { color: 'rgba(0,0,0,0.05)' },
        title: { display: true, text: 'Number of Projects', font: { size: 11, weight: '500' } }
      },
      x: { 
        grid: { display: false },
        ticks: { font: { size: 11 } }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'right',
        labels: { 
          usePointStyle: true,
          padding: 16,
          font: { size: 11, weight: '500' },
          generateLabels: (chart) => {
            const data = chart.data;
            return data.labels.map((label, i) => ({
              text: `${label} (${data.datasets[0].data[i]})`,
              fillStyle: data.datasets[0].backgroundColor[i],
              strokeStyle: data.datasets[0].backgroundColor[i],
              index: i
            }));
          }
        }
      }
    },
    cutout: '60%',
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Unable to load dashboard</h3>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="retry-btn">
            <span>⟳</span> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { summary } = dashboardData;

  return (
    <div className="dashboard-page">
      {/* Navigation */}
      <nav className="dashboard-nav">
        <div className="nav-container">
          <button className="nav-back" onClick={onBackClick}>
            <span>←</span> Back
          </button>
          <div className="nav-tabs">
            <button 
              className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📊 Overview
            </button>
            <button 
              className={`nav-tab ${activeTab === 'readiness' ? 'active' : ''}`}
              onClick={() => setActiveTab('readiness')}
            >
              🎯 Readiness
            </button>
            <button 
              className={`nav-tab ${activeTab === 'institutions' ? 'active' : ''}`}
              onClick={() => setActiveTab('institutions')}
            >
              🏛️ Institutions
            </button>
          </div>
          <div className="nav-actions">
            <button className="nav-refresh" onClick={fetchDashboardData}>
              ⟳
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="dashboard-header">
        <div className="container">
          <div className="header-grid">
            <div className="header-title-group">
              <h1 className="dashboard-title">
                <span className="title-badge">📈</span>
                Analytics Dashboard
              </h1>
              <p className="dashboard-subtitle">
                Genome editing research & development across Africa
              </p>
            </div>
            <div className="header-metrics">
              <div className="metric-item">
                <span className="metric-value">{summary.totalProjects}</span>
                <span className="metric-label">Projects</span>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-item">
                <span className="metric-value">{summary.totalCountries}</span>
                <span className="metric-label">Countries</span>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-item">
                <span className="metric-value">{summary.totalInstitutions}</span>
                <span className="metric-label">Institutions</span>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-item">
                <span className="metric-value">{summary.totalOrganisms}</span>
                <span className="metric-label">Organisms</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="container">

          {/* Readiness Overview */}
          {readinessSummary && (
            <section className="readiness-section">
              <div className="readiness-card">
                <div className="readiness-icon">🎯</div>
                <div className="readiness-content">
                  <div className="readiness-header">
                    <h4>Average Gene Editing Readiness</h4>
                    <div className="readiness-score">
                      <span className="score-value">{(readinessSummary.avgScore * 100).toFixed(0)}%</span>
                      <span className={`score-level ${readinessSummary.avgScore >= 0.7 ? 'advanced' : readinessSummary.avgScore >= 0.55 ? 'intermediate' : 'foundational'}`}>
                        {readinessSummary.avgScore >= 0.7 ? 'Advanced' : readinessSummary.avgScore >= 0.55 ? 'Intermediate' : 'Foundational'}
                      </span>
                    </div>
                  </div>
                  <div className="readiness-breakdown">
                    <span className="breakdown-item">
                      <span className="dot advanced"></span>
                      {readinessSummary.advanced} Advanced
                    </span>
                    <span className="breakdown-item">
                      <span className="dot intermediate"></span>
                      {readinessSummary.intermediate} Intermediate
                    </span>
                    <span className="breakdown-item">
                      <span className="dot foundational"></span>
                      {readinessSummary.foundational} Foundational
                    </span>
                    <span className="breakdown-total">
                      {readinessSummary.total} countries
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          <p>&nbsp;</p>

          {/* Quick Stats */}
          {/* <section className="stats-section">
            <div className="stats-grid">
              <div className="stat-card" style={{ '--stat-color': '#5B7E96' }}>
                <div className="stat-icon">📋</div>
                <div className="stat-info">
                  <span className="stat-number">{summary.totalProjects}</span>
                  <span className="stat-label">Total Projects</span>
                </div>
              </div>
              <div className="stat-card" style={{ '--stat-color': '#10B981' }}>
                <div className="stat-icon">🌍</div>
                <div className="stat-info">
                  <span className="stat-number">{summary.totalCountries}</span>
                  <span className="stat-label">Countries</span>
                </div>
              </div>
              <div className="stat-card" style={{ '--stat-color': '#8B5CF6' }}>
                <div className="stat-icon">🏛️</div>
                <div className="stat-info">
                  <span className="stat-number">{summary.totalInstitutions}</span>
                  <span className="stat-label">Institutions</span>
                </div>
              </div>
              <div className="stat-card" style={{ '--stat-color': '#F59E0B' }}>
                <div className="stat-icon">🧬</div>
                <div className="stat-info">
                  <span className="stat-number">{summary.totalOrganisms}</span>
                  <span className="stat-label">Organisms</span>
                </div>
              </div>
            </div>
          </section> */}

          {/* Charts Grid */}
          <div className="charts-grid">
            {/* Projects per Year */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>📈 Projects per Year</h3>
                <span className="chart-badge">Trend</span>
              </div>
              <div className="chart-body">
                {projectsByYearChartData && (
                  <Line data={projectsByYearChartData} options={lineOptions} />
                )}
              </div>
            </div>

            {/* Projects per Country */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>🌍 Projects per Country</h3>
                <span className="chart-badge">Distribution</span>
              </div>
              <div className="chart-body">
                {projectsByCountryChartData && (
                  <Bar data={projectsByCountryChartData} options={horizontalBarOptions} />
                )}
              </div>
            </div>

            {/* Readiness per Country */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>🎯 Readiness per Country</h3>
                <span className="chart-badge">Score</span>
              </div>
              <div className="chart-body">
                {readinessChartData && (
                  <Bar data={readinessChartData} options={readinessBarOptions} />
                )}
              </div>
            </div>

            {/* Institutions per Country */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>🏛️ Institutions per Country</h3>
                <span className="chart-badge">Count</span>
              </div>
              <div className="chart-body">
                {institutionsByCountryChartData && (
                  <Bar data={institutionsByCountryChartData} options={horizontalBarOptions} />
                )}
              </div>
            </div>

            {/* Institutions by Category */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>📊 Institutions by Category</h3>
                <span className="chart-badge">Distribution</span>
              </div>
              <div className="chart-body chart-doughnut">
                {institutionsByCategoryChartData && (
                  <Doughnut data={institutionsByCategoryChartData} options={doughnutOptions} />
                )}
              </div>
            </div>

            {/* Organisms per Country */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>🧬 Organisms per Country</h3>
                <span className="chart-badge">Count</span>
              </div>
              <div className="chart-body">
                {organismsByCountryChartData && (
                  <Bar data={organismsByCountryChartData} options={horizontalBarOptions} />
                )}
              </div>
            </div>
          </div>

          {/* Legend Footer */}
          <section className="legend-section">
            <div className="legend-container">
              <div className="legend-title">Readiness Levels</div>
              <div className="legend-items">
                <div className="legend-item">
                  <span className="legend-color" style={{ background: '#10B981' }}></span>
                  <div className="legend-info">
                    <strong>Advanced</strong>
                    <span>70%+</span>
                  </div>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ background: '#F59E0B' }}></span>
                  <div className="legend-info">
                    <strong>Intermediate</strong>
                    <span>55-69%</span>
                  </div>
                </div>
                <div className="legend-item">
                  <span className="legend-color" style={{ background: '#EF4444' }}></span>
                  <div className="legend-info">
                    <strong>Foundational</strong>
                    <span>&lt;55%</span>
                  </div>
                </div>
              </div>
              <div className="legend-note">
                <span>💡</span>
                <span>Based on regulatory framework, infrastructure, and research capacity</span>
              </div>
            </div>
          </section>
        </div>
      </main>

    
    </div>
  );
};

export default DashboardPage;