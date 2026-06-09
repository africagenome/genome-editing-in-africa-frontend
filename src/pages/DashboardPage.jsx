import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import './DashboardPage.css';

const DashboardPage = ({ onBackClick }) => {
  const [kpiData, setKpiData] = useState([]);
  const [countryRanking, setCountryRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Chart refs
  const sectorChartRef = useRef(null);
  const regulatoryChartRef = useRef(null);
  const trendChartRef = useRef(null);
  const techChartRef = useRef(null);
  const fundingChartRef = useRef(null);
  const regionChartRef = useRef(null);
  
  const chartInstances = useRef({});

  // KPI Data
  const kpiDataStatic = [
    { icon: "fas fa-flask", value: "47", label: "Active Projects", change: "+12 vs 2025", trend: "up", color: "primary" },
    { icon: "fas fa-file-alt", value: "156", label: "Publications", change: "+34% YoY", trend: "up", color: "primary" },
    { icon: "fas fa-gavel", value: "22", label: "Countries with GEd Guidelines", change: "+8 this year", trend: "up", color: "primary" },
    { icon: "fas fa-users", value: "1,250+", label: "Researchers Trained", change: "Since 2022", trend: "up", color: "primary" },
    { icon: "fas fa-dollar-sign", value: "$48M", label: "Total Investment", change: "2025-2027", trend: "up", color: "primary" },
    { icon: "fas fa-microscope", value: "45+", label: "Research Facilities", change: "+12 new labs", trend: "up", color: "primary" }
  ];

  // Chart Data
  const sectorData = {
    labels: ["Agriculture", "Human Health", "Environmental", "Industrial", "Capacity Building"],
    values: [32, 9, 4, 2, 8],
    colors: ["#5B7E96", "#B4A269", "#6C9EBF", "#D4A373", "#2C6E49"]
  };

  const regulatoryData = {
    labels: ["Functional Framework", "Draft Guidelines", "Policy Development", "No Framework"],
    values: [12, 8, 5, 3],
    colors: ["#2C6E49", "#D4A373", "#5B7E96", "#8A817C"]
  };

  const trendData = {
    labels: ["2020", "2021", "2022", "2023", "2024", "2025", "2026"],
    projects: [5, 9, 15, 24, 35, 42, 47],
    countries: [6, 8, 11, 15, 19, 22, 25],
    publications: [8, 14, 25, 42, 68, 95, 156],
    funding: [5.2, 8.5, 12.3, 18.7, 28.5, 38.2, 48.0]
  };

  const techData = {
    labels: ["CRISPR-Cas9", "TALENs", "SDN-1", "SDN-2", "Base Editing", "Prime Editing"],
    values: [38, 6, 12, 8, 4, 2],
    colors: ["#5B7E96", "#B4A269", "#6C9EBF", "#D4A373", "#2C6E49", "#8A817C"]
  };

  const fundingData = {
    labels: ["AUDA-NEPAD", "National Govts", "Gates Foundation", "World Bank", "Private Sector", "EU/Other"],
    values: [18, 12, 10, 5, 3, 2],
    colors: ["#5B7E96", "#2C6E49", "#B4A269", "#6C9EBF", "#D4A373", "#8A817C"]
  };

  const regionData = {
    labels: ["East Africa", "West Africa", "Southern Africa", "North Africa", "Central Africa"],
    values: [15, 12, 10, 5, 2],
    colors: ["#5B7E96", "#B4A269", "#6C9EBF", "#D4A373", "#2C6E49"]
  };

  const countryRankingData = [
    { rank: 1, country: "South Africa", projects: 12, cfts: 8, pubs: 34, researchers: 210, status: "Functional", readiness: 0.85, growth: "+15%" },
    { rank: 2, country: "Kenya", projects: 9, cfts: 6, pubs: 28, researchers: 156, status: "Functional", readiness: 0.78, growth: "+22%" },
    { rank: 3, country: "Nigeria", projects: 7, cfts: 4, pubs: 22, researchers: 120, status: "Draft Guidelines", readiness: 0.62, growth: "+18%" },
    { rank: 4, country: "Ghana", projects: 5, cfts: 4, pubs: 16, researchers: 85, status: "Draft Guidelines", readiness: 0.71, growth: "+25%" },
    { rank: 5, country: "Ethiopia", projects: 4, cfts: 2, pubs: 12, researchers: 65, status: "Policy Development", readiness: 0.55, growth: "+30%" },
    { rank: 6, country: "Uganda", projects: 3, cfts: 3, pubs: 10, researchers: 55, status: "Functional", readiness: 0.58, growth: "+12%" },
    { rank: 7, country: "Zimbabwe", projects: 3, cfts: 2, pubs: 8, researchers: 45, status: "Functional", readiness: 0.48, growth: "+20%" },
    { rank: 8, country: "Burkina Faso", projects: 2, cfts: 2, pubs: 6, researchers: 35, status: "Draft Guidelines", readiness: 0.45, growth: "+40%" },
    { rank: 9, country: "Malawi", projects: 2, cfts: 1, pubs: 5, researchers: 30, status: "Draft Guidelines", readiness: 0.42, growth: "+35%" },
    { rank: 10, country: "Rwanda", projects: 2, cfts: 1, pubs: 4, researchers: 28, status: "Policy Development", readiness: 0.44, growth: "+50%" },
    { rank: 11, country: "Tanzania", projects: 2, cfts: 1, pubs: 5, researchers: 32, status: "Draft Guidelines", readiness: 0.46, growth: "+28%" },
    { rank: 12, country: "Senegal", projects: 1, cfts: 1, pubs: 4, researchers: 25, status: "Policy Development", readiness: 0.43, growth: "+20%" }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setKpiData(kpiDataStatic);
      setCountryRanking(countryRankingData);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (!loading) {
      initializeCharts();
    }
    return () => {
      destroyCharts();
    };
  }, [loading, selectedYear, selectedRegion]);

  const destroyCharts = () => {
    Object.values(chartInstances.current).forEach(chart => {
      if (chart) chart.destroy();
    });
    chartInstances.current = {};
  };

  const initializeCharts = () => {
    destroyCharts();

    // Sector Chart (Bar)
    const sectorCtx = document.getElementById('sectorChart');
    if (sectorCtx) {
      chartInstances.current.sector = new Chart(sectorCtx, {
        type: 'bar',
        data: {
          labels: sectorData.labels,
          datasets: [{
            label: 'Number of Projects',
            data: sectorData.values,
            backgroundColor: sectorData.colors,
            borderRadius: 8,
            barPercentage: 0.7,
            categoryPercentage: 0.8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { position: 'top' },
            tooltip: { backgroundColor: '#1A2C3E', titleColor: '#fff', bodyColor: '#CFDFE6' }
          },
          scales: {
            y: { beginAtZero: true, grid: { color: '#E4E8EF' }, title: { display: true, text: 'Number of Projects' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // Regulatory Chart (Doughnut)
    const regCtx = document.getElementById('regulatoryChart');
    if (regCtx) {
      chartInstances.current.regulatory = new Chart(regCtx, {
        type: 'doughnut',
        data: {
          labels: regulatoryData.labels,
          datasets: [{
            data: regulatoryData.values,
            backgroundColor: regulatoryData.colors,
            borderWidth: 0,
            hoverOffset: 10
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { position: 'bottom' },
            tooltip: { backgroundColor: '#1A2C3E' }
          },
          cutout: '60%'
        }
      });
    }

    // Trend Chart (Line)
    const trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
      chartInstances.current.trend = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: trendData.labels,
          datasets: [
            { 
              label: 'Active Projects', 
              data: trendData.projects, 
              borderColor: '#5B7E96', 
              backgroundColor: 'rgba(91,126,150,0.1)', 
              fill: true, 
              tension: 0.3,
              borderWidth: 3,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: '#5B7E96'
            },
            { 
              label: 'Countries with Activity', 
              data: trendData.countries, 
              borderColor: '#B4A269', 
              backgroundColor: 'rgba(180,162,105,0.05)', 
              fill: true, 
              tension: 0.3,
              borderWidth: 3,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: '#B4A269'
            },
            { 
              label: 'Publications', 
              data: trendData.publications, 
              borderColor: '#2C6E49', 
              backgroundColor: 'rgba(44,110,73,0.05)', 
              fill: true, 
              tension: 0.3,
              borderWidth: 3,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointBackgroundColor: '#2C6E49'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            tooltip: { mode: 'index', intersect: false, backgroundColor: '#1A2C3E' },
            legend: { position: 'top' }
          },
          scales: {
            y: { beginAtZero: true, grid: { color: '#E4E8EF' }, title: { display: true, text: 'Count' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // Technology Chart (Horizontal Bar)
    const techCtx = document.getElementById('techChart');
    if (techCtx) {
      chartInstances.current.tech = new Chart(techCtx, {
        type: 'bar',
        data: {
          labels: techData.labels,
          datasets: [{
            label: 'Projects Using Technology',
            data: techData.values,
            backgroundColor: techData.colors,
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          indexAxis: 'y',
          plugins: {
            legend: { position: 'top' },
            tooltip: { backgroundColor: '#1A2C3E' }
          },
          scales: {
            x: { grid: { color: '#E4E8EF' }, title: { display: true, text: 'Number of Projects' } },
            y: { grid: { display: false } }
          }
        }
      });
    }

    // Funding Chart (Bar)
    const fundingCtx = document.getElementById('fundingChart');
    if (fundingCtx) {
      chartInstances.current.funding = new Chart(fundingCtx, {
        type: 'bar',
        data: {
          labels: fundingData.labels,
          datasets: [{
            label: 'Funding (USD Million)',
            data: fundingData.values,
            backgroundColor: fundingData.colors,
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { position: 'top' },
            tooltip: { callbacks: { label: (ctx) => `${ctx.raw} Million USD` }, backgroundColor: '#1A2C3E' }
          },
          scales: {
            y: { beginAtZero: true, grid: { color: '#E4E8EF' }, title: { display: true, text: 'Million USD' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // Region Chart (Pie)
    const regionCtx = document.getElementById('regionChart');
    if (regionCtx) {
      chartInstances.current.region = new Chart(regionCtx, {
        type: 'pie',
        data: {
          labels: regionData.labels,
          datasets: [{
            data: regionData.values,
            backgroundColor: regionData.colors,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { position: 'bottom' },
            tooltip: { backgroundColor: '#1A2C3E' }
          }
        }
      });
    }
  };

  const getReadinessScore = (score) => {
    const level = score >= 0.7 ? 'High' : score >= 0.55 ? 'Medium' : 'Low';
    const color = score >= 0.7 ? '#2C6E49' : score >= 0.55 ? '#F57C00' : '#C62828';
    return { level, color };
  };

  const getFilteredCountryData = () => {
    let data = [...countryRanking];
    if (selectedRegion !== 'all') {
      // Filter logic would go here based on region
      data = data.slice(0, 10);
    }
    return data;
  };

  const totalStats = {
    totalProjects: countryRanking.reduce((sum, c) => sum + c.projects, 0),
    totalPublications: countryRanking.reduce((sum, c) => sum + c.pubs, 0),
    totalResearchers: countryRanking.reduce((sum, c) => sum + c.researchers, 0),
    avgReadiness: (countryRanking.reduce((sum, c) => sum + c.readiness, 0) / countryRanking.length).toFixed(2)
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <header className="dashboard-header">
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
                <h2>Genome Editing Programme</h2>
                <p>AUDA-NEPAD · Performance Analytics</p>
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
      <div className="dashboard-hero">
        <div className="container">
          <div className="hero-badge">
            <i className="fas fa-chart-line"></i> DATA INSIGHTS
          </div>
          <h1>Analytics Dashboard</h1>
          <p>Real-time metrics and visualizations on genome editing adoption, research output, and continental progress.</p>
        </div>
      </div>

      <div className="container">
        {/* Filter Bar */}
        <div className="filter-bar-dashboard">
          <div className="filter-group">
            <label><i className="fas fa-calendar"></i> Year:</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
          <div className="filter-group">
            <label><i className="fas fa-globe-africa"></i> Region:</label>
            <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)}>
              <option value="all">All Africa</option>
              <option value="east">East Africa</option>
              <option value="west">West Africa</option>
              <option value="southern">Southern Africa</option>
              <option value="north">North Africa</option>
              <option value="central">Central Africa</option>
            </select>
          </div>
          <div className="date-range">
            <i className="fas fa-info-circle"></i>
            <span>Data updated: May 2026</span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="kpi-grid">
              {kpiData.map((kpi, idx) => (
                <div key={idx} className="kpi-card">
                  <div className="kpi-icon">
                    <i className={kpi.icon}></i>
                  </div>
                  <div className="kpi-value">{kpi.value}</div>
                  <div className="kpi-label">{kpi.label}</div>
                  <div className="kpi-change">
                    <i className={`fas fa-arrow-${kpi.trend === 'up' ? 'up' : 'down'}`}></i>
                    {kpi.change}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="summary-stats">
              <div className="summary-card">
                <div className="summary-icon"><i className="fas fa-chart-line"></i></div>
                <div className="summary-info">
                  <div className="summary-value">{totalStats.totalProjects}</div>
                  <div className="summary-label">Total Projects Across Africa</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon"><i className="fas fa-file-alt"></i></div>
                <div className="summary-info">
                  <div className="summary-value">{totalStats.totalPublications}+</div>
                  <div className="summary-label">Peer-reviewed Publications</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon"><i className="fas fa-user-graduate"></i></div>
                <div className="summary-info">
                  <div className="summary-value">{totalStats.totalResearchers}+</div>
                  <div className="summary-label">Researchers Trained</div>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon"><i className="fas fa-chart-simple"></i></div>
                <div className="summary-info">
                  <div className="summary-value">{Math.round(totalStats.avgReadiness * 100)}%</div>
                  <div className="summary-label">Average Readiness Score</div>
                </div>
              </div>
            </div>

            {/* Charts Row 1 */}
            <div className="chart-grid">
              <div className="chart-card">
                <h3><i className="fas fa-chart-bar"></i> Projects by Sector</h3>
                <div className="chart-container">
                  <canvas id="sectorChart"></canvas>
                </div>
              </div>
              <div className="chart-card">
                <h3><i className="fas fa-chart-pie"></i> Regulatory Status Distribution</h3>
                <div className="chart-container">
                  <canvas id="regulatoryChart"></canvas>
                </div>
              </div>
            </div>

            {/* Full Width Trend Chart */}
            <div className="full-width-chart">
              <h3><i className="fas fa-chart-line"></i> Genome Editing Adoption Trend (2020-2026)</h3>
              <div className="chart-container">
                <canvas id="trendChart"></canvas>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="chart-grid">
              <div className="chart-card">
                <h3><i className="fas fa-dna"></i> Projects by Technology</h3>
                <div className="chart-container">
                  <canvas id="techChart"></canvas>
                </div>
              </div>
              <div className="chart-card">
                <h3><i className="fas fa-chart-line"></i> Funding by Source (USD Million)</h3>
                <div className="chart-container">
                  <canvas id="fundingChart"></canvas>
                </div>
              </div>
            </div>

            {/* Regional Distribution */}
            <div className="chart-card full-width">
              <h3><i className="fas fa-map-marked-alt"></i> Regional Distribution of Projects</h3>
              <div className="chart-container" style={{ maxWidth: '500px', margin: '0 auto' }}>
                <canvas id="regionChart"></canvas>
              </div>
            </div>

            {/* Top Countries Table */}
            <div className="data-table-container">
              <h3><i className="fas fa-trophy"></i> Top Countries by Genome Editing Activity</h3>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Country</th>
                      <th>Active Projects</th>
                      <th>CFTs</th>
                      <th>Publications</th>
                      <th>Researchers</th>
                      <th>Regulatory Status</th>
                      <th>Readiness</th>
                      <th>Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredCountryData().map((country, idx) => {
                      const readiness = getReadinessScore(country.readiness);
                      return (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td><strong>{country.country}</strong></td>
                          <td>{country.projects}</td>
                          <td>{country.cfts}</td>
                          <td>{country.pubs}</td>
                          <td>{country.researchers}</td>
                          <td>
                            <span className="status-badge">{country.status}</span>
                          </td>
                          <td>
                            <div className="readiness-bar">
                              <div className="readiness-fill" style={{ width: `${country.readiness * 100}%`, background: readiness.color }}></div>
                              <span className="readiness-text">{Math.round(country.readiness * 100)}%</span>
                            </div>
                          </td>
                          <td className="growth-positive">{country.growth}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="container">
          <div className="footer-content">
            <p>© 2026 AUDA-NEPAD Genome Editing Programme — Data updated quarterly. Last update: May 2026.</p>
            <button onClick={onBackClick} className="footer-back-btn">
              <i className="fas fa-home"></i> Back to Home
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;