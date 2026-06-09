import React, { useState, useEffect, useRef, useCallback } from 'react';
import Chart from 'chart.js/auto';
import './CountriesPage.css';

const CountriesPage = ({ onBackClick }) => {
  const [selectedCountry, setSelectedCountry] = useState('Kenya');
  const [countryData, setCountryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const trendChartRef = useRef(null);
  const focusChartRef = useRef(null);
  const readinessChartRef = useRef(null);
  const chartInstances = useRef({ trend: null, focus: null, readiness: null });

  // Comprehensive Country Data
  const countryProfiles = {
    "Kenya": {
      name: "Kenya",
      flag: "🇰🇪",
      capital: "Nairobi",
      population: "54.9M",
      metrics: { 
        projects: 9, 
        cfts: 6, 
        publications: 28, 
        institutions: 12, 
        researchers: 156, 
        readiness: 0.78,
        funding: "$8.5M",
        collaborations: 24
      },
      trends: { 
        years: ["2021", "2022", "2023", "2024", "2025", "2026"], 
        projects: [1, 2, 4, 6, 8, 9], 
        pubs: [3, 6, 12, 18, 24, 28],
        funding: [1.2, 2.1, 3.5, 5.2, 7.1, 8.5]
      },
      focus: { 
        labels: ["Crop Improvement", "Regulatory", "Capacity Building", "Gene Therapy"], 
        values: [65, 15, 12, 8] 
      },
      institutions: [
        { name: "KALRO (Kenya Agricultural & Livestock Research Organization)", type: "Research", focus: "Crop Improvement" },
        { name: "National Biosafety Authority (NBA)", type: "Regulatory", focus: "Biosafety" },
        { name: "University of Nairobi - Biotechnology Dept", type: "Academic", focus: "Research & Training" },
        { name: "KEMRI - Wellcome Trust", type: "Health Research", focus: "Gene Therapy" },
        { name: "ISAAA AfriCenter", type: "Capacity Building", focus: "Knowledge Sharing" },
        { name: "International Livestock Research Institute (ILRI)", type: "Research", focus: "Animal Genetics" }
      ],
      projects: [
        { name: "Drought-Tolerant Maize", status: "CFT", year: "2024-2026", lead: "KALRO" },
        { name: "Salt-Tolerant Rice", status: "R&D", year: "2023-2026", lead: "KALRO/IRRI" },
        { name: "CRISPR Cassava", status: "CFT", year: "2025-2027", lead: "KALRO/IITA" }
      ],
      timeline: [
        { year: "2019", text: "Biosafety Act amended to include emerging technologies", type: "policy" },
        { year: "2022", text: "First confined field trial for gene-edited maize approved", type: "milestone" },
        { year: "2024", text: "National Genome Editing Guidelines adopted", type: "policy" },
        { year: "2025", text: "CRISPR cassava CFT initiated", type: "project" },
        { year: "2026", text: "Regional training hub established at KALRO", type: "milestone" }
      ],
      regulatory: { 
        biosafety: "Functional Framework", 
        gedGuidelines: "Adopted", 
        classification: "Product-based",
        lastUpdate: "2024",
        status: "Active"
      },
      publications: [
        { title: "CRISPR-Cas9 mediated drought tolerance in maize", journal: "Plant Biotechnology Journal", year: "2024", citations: 45 },
        { title: "Genome editing landscape in East Africa", journal: "Frontiers in Plant Science", year: "2025", citations: 28 },
        { title: "Regulatory framework for gene editing in Kenya", journal: "GM Crops & Food", year: "2024", citations: 32 }
      ]
    },
    "South Africa": {
      name: "South Africa",
      flag: "🇿🇦",
      capital: "Pretoria",
      population: "60.6M",
      metrics: { 
        projects: 12, 
        cfts: 8, 
        publications: 34, 
        institutions: 15, 
        researchers: 210, 
        readiness: 0.85,
        funding: "$12.3M",
        collaborations: 32
      },
      trends: { 
        years: ["2021", "2022", "2023", "2024", "2025", "2026"], 
        projects: [3, 5, 7, 9, 11, 12], 
        pubs: [5, 9, 15, 22, 29, 34],
        funding: [2.5, 4.2, 6.1, 8.3, 10.5, 12.3]
      },
      focus: { 
        labels: ["Crop Improvement", "Gene Therapy", "Regulatory", "Industrial"], 
        values: [55, 25, 12, 8] 
      },
      institutions: [
        { name: "Agricultural Research Council (ARC)", type: "Research", focus: "Crop Improvement" },
        { name: "University of Cape Town - Genetics Dept", type: "Academic", focus: "Gene Therapy" },
        { name: "Stellenbosch University - Plant Breeding", type: "Academic", focus: "Plant Genetics" },
        { name: "DALRRD (Department of Agriculture)", type: "Regulatory", focus: "Policy" },
        { name: "Seed Co South Africa", type: "Private Sector", focus: "Commercialization" },
        { name: "Council for Scientific and Industrial Research (CSIR)", type: "Research", focus: "Biotechnology" }
      ],
      projects: [
        { name: "Gene-Edited Sorghum", status: "Commercial", year: "2025", lead: "ARC/Seed Co" },
        { name: "Sickle Cell Gene Therapy", status: "R&D", year: "2024-2028", lead: "UCT" },
        { name: "Nitrogen-Efficient Maize", status: "R&D", year: "2024-2027", lead: "Stellenbosch University" }
      ],
      timeline: [
        { year: "2020", text: "Product-based regulatory framework proposed", type: "policy" },
        { year: "2022", text: "First gene-edited sorghum field trial approved", type: "milestone" },
        { year: "2024", text: "Commercial release guidelines finalized", type: "policy" },
        { year: "2025", text: "First commercial release of gene-edited sorghum", type: "project" },
        { year: "2026", text: "Gene therapy research center launched", type: "milestone" }
      ],
      regulatory: { 
        biosafety: "Functional Framework", 
        gedGuidelines: "Adopted", 
        classification: "Product-based",
        lastUpdate: "2024",
        status: "Active"
      },
      publications: [
        { title: "First commercial gene-edited crop in Africa", journal: "Nature Biotechnology", year: "2025", citations: 67 },
        { title: "CRISPR for sickle cell disease", journal: "Blood", year: "2024", citations: 52 },
        { title: "Regulatory innovation in South Africa", journal: "GM Crops & Food", year: "2024", citations: 38 }
      ]
    },
    "Nigeria": {
      name: "Nigeria",
      flag: "🇳🇬",
      capital: "Abuja",
      population: "218.6M",
      metrics: { 
        projects: 7, 
        cfts: 4, 
        publications: 22, 
        institutions: 10, 
        researchers: 120, 
        readiness: 0.62,
        funding: "$5.8M",
        collaborations: 18
      },
      trends: { 
        years: ["2021", "2022", "2023", "2024", "2025", "2026"], 
        projects: [1, 2, 3, 5, 6, 7], 
        pubs: [2, 4, 8, 13, 18, 22],
        funding: [0.8, 1.5, 2.4, 3.6, 4.8, 5.8]
      },
      focus: { 
        labels: ["Crop Improvement", "Regulatory", "Capacity Building", "Health"], 
        values: [70, 15, 10, 5] 
      },
      institutions: [
        { name: "National Biosafety Management Agency (NBMA)", type: "Regulatory", focus: "Biosafety" },
        { name: "IITA (International Institute of Tropical Agriculture)", type: "Research", focus: "Cassava" },
        { name: "NABDA (National Biotechnology Development Agency)", type: "Research", focus: "Biotech" },
        { name: "University of Ibadan", type: "Academic", focus: "Plant Breeding" },
        { name: "AATF (African Agricultural Technology Foundation)", type: "Partnership", focus: "Technology Transfer" }
      ],
      projects: [
        { name: "Cassava Mosaic Virus Resistance", status: "CFT", year: "2024-2027", lead: "IITA/NABDA" },
        { name: "Cowpea Pod Borer Resistance", status: "R&D", year: "2023-2026", lead: "NABDA" },
        { name: "Maize Drought Tolerance", status: "R&D", year: "2024-2027", lead: "IITA" }
      ],
      timeline: [
        { year: "2021", text: "National Biotechnology Policy revised", type: "policy" },
        { year: "2023", text: "Genome editing guidelines drafting commenced", type: "policy" },
        { year: "2024", text: "First CRISPR cassava CFT approved", type: "milestone" },
        { year: "2025", text: "Draft guidelines open for consultation", type: "policy" },
        { year: "2026", text: "Stakeholder validation workshop held", type: "milestone" }
      ],
      regulatory: { 
        biosafety: "Functional Framework", 
        gedGuidelines: "Draft Guidelines", 
        classification: "Process-based",
        lastUpdate: "2025",
        status: "In Development"
      },
      publications: [
        { title: "CRISPR for cassava improvement in Nigeria", journal: "Plant Science", year: "2024", citations: 34 },
        { title: "Regulatory pathways for gene editing", journal: "Frontiers in Bioengineering", year: "2025", citations: 22 }
      ]
    },
    "Ghana": {
      name: "Ghana",
      flag: "🇬🇭",
      capital: "Accra",
      population: "33.1M",
      metrics: { 
        projects: 5, 
        cfts: 4, 
        publications: 16, 
        institutions: 8, 
        researchers: 85, 
        readiness: 0.71,
        funding: "$4.2M",
        collaborations: 14
      },
      trends: { 
        years: ["2021", "2022", "2023", "2024", "2025", "2026"], 
        projects: [0, 1, 2, 3, 4, 5], 
        pubs: [1, 3, 6, 10, 13, 16],
        funding: [0.3, 0.8, 1.5, 2.4, 3.3, 4.2]
      },
      focus: { 
        labels: ["Crop Improvement", "Regulatory", "Capacity Building"], 
        values: [75, 15, 10] 
      },
      institutions: [
        { name: "National Biosafety Authority (NBA)", type: "Regulatory", focus: "Biosafety" },
        { name: "CSIR-SARI (Savanna Agricultural Research Institute)", type: "Research", focus: "Cowpea" },
        { name: "University of Ghana - WACCI", type: "Academic", focus: "Plant Breeding" },
        { name: "AGRA (Alliance for Green Revolution)", type: "Partner", focus: "Policy" }
      ],
      projects: [
        { name: "Pod Borer-Resistant Cowpea", status: "CFT", year: "2024-2026", lead: "CSIR-SARI" },
        { name: "Drought-Tolerant Maize", status: "R&D", year: "2023-2026", lead: "CSIR-CRI" }
      ],
      timeline: [
        { year: "2022", text: "Biosafety Act review initiated", type: "policy" },
        { year: "2023", text: "Genome editing policy development commenced", type: "policy" },
        { year: "2024", text: "First cowpea CFT approved", type: "milestone" },
        { year: "2025", text: "Draft guidelines under stakeholder review", type: "policy" }
      ],
      regulatory: { 
        biosafety: "Functional Framework", 
        gedGuidelines: "Draft Guidelines", 
        classification: "Product-based",
        lastUpdate: "2025",
        status: "In Development"
      },
      publications: [
        { title: "Gene editing for cowpea improvement", journal: "Legume Science", year: "2024", citations: 18 },
        { title: "Biosafety governance in West Africa", journal: "GM Crops & Food", year: "2025", citations: 12 }
      ]
    },
    "Ethiopia": {
      name: "Ethiopia",
      flag: "🇪🇹",
      capital: "Addis Ababa",
      population: "126.5M",
      metrics: { 
        projects: 3, 
        cfts: 1, 
        publications: 8, 
        institutions: 6, 
        researchers: 45, 
        readiness: 0.55,
        funding: "$2.3M",
        collaborations: 8
      },
      trends: { 
        years: ["2021", "2022", "2023", "2024", "2025", "2026"], 
        projects: [0, 0, 1, 2, 2, 3], 
        pubs: [0, 1, 2, 4, 6, 8],
        funding: [0, 0.2, 0.6, 1.1, 1.7, 2.3]
      },
      focus: { 
        labels: ["Crop Improvement", "Capacity Building", "Regulatory"], 
        values: [80, 15, 5] 
      },
      institutions: [
        { name: "Ethiopian Institute of Agricultural Research (EIAR)", type: "Research", focus: "Teff" },
        { name: "Addis Ababa University - Biotechnology Dept", type: "Academic", focus: "Plant Genetics" },
        { name: "Environment Protection Authority (EPA)", type: "Regulatory", focus: "Biosafety" }
      ],
      projects: [
        { name: "Teff Lodging Resistance using TALENs", status: "R&D", year: "2023-2026", lead: "EIAR" },
        { name: "Drought-Tolerant Sorghum", status: "R&D", year: "2024-2027", lead: "EIAR" }
      ],
      timeline: [
        { year: "2023", text: "Genome editing research initiated", type: "project" },
        { year: "2024", text: "National guideline development started", type: "policy" },
        { year: "2025", text: "First gene-edited crop field trial planned", type: "milestone" }
      ],
      regulatory: { 
        biosafety: "Developing", 
        gedGuidelines: "In Development", 
        classification: "Not specified",
        lastUpdate: "2025",
        status: "Emerging"
      },
      publications: [
        { title: "TALENs for teff improvement", journal: "Journal of Plant Biotechnology", year: "2025", citations: 8 }
      ]
    }
  };

  // Add more countries with default data
  const additionalCountries = [
    "Uganda", "Tanzania", "Rwanda", "Zimbabwe", "Mozambique", "Zambia", 
    "Malawi", "Burkina Faso", "Mali", "Senegal", "Côte d'Ivoire", "Cameroon"
  ];

  additionalCountries.forEach(country => {
    if (!countryProfiles[country]) {
      countryProfiles[country] = {
        name: country,
        flag: "🌍",
        capital: "Various",
        population: "N/A",
        metrics: { 
          projects: Math.floor(Math.random() * 5) + 1, 
          cfts: Math.floor(Math.random() * 3), 
          publications: Math.floor(Math.random() * 10) + 1, 
          institutions: Math.floor(Math.random() * 6) + 2, 
          researchers: Math.floor(Math.random() * 50) + 10, 
          readiness: 0.3 + Math.random() * 0.4,
          funding: `$${(Math.random() * 3 + 0.5).toFixed(1)}M`,
          collaborations: Math.floor(Math.random() * 10) + 2
        },
        trends: { 
          years: ["2021", "2022", "2023", "2024", "2025", "2026"], 
          projects: [0, 0, 1, 1, 2, Math.floor(Math.random() * 3) + 1], 
          pubs: [0, 1, 2, 3, 4, Math.floor(Math.random() * 8) + 1],
          funding: [0.1, 0.2, 0.4, 0.6, 0.9, (Math.random() * 3 + 0.5).toFixed(1)]
        },
        focus: { 
          labels: ["Crop Improvement", "Capacity Building"], 
          values: [75, 25] 
        },
        institutions: [
          { name: `${country} Agricultural Research Institute`, type: "Research", focus: "Crop Improvement" },
          { name: `${country} Biosafety Authority`, type: "Regulatory", focus: "Biosafety" },
          { name: `${country} University - Biotechnology Dept`, type: "Academic", focus: "Research" }
        ],
        projects: [
          { name: `${country} Crop Improvement Initiative`, status: "R&D", year: "2024-2027", lead: "National Institute" }
        ],
        timeline: [
          { year: "2024", text: "Genome editing policy development initiated", type: "policy" },
          { year: "2025", text: "Stakeholder capacity building underway", type: "milestone" }
        ],
        regulatory: { 
          biosafety: "Developing", 
          gedGuidelines: "None", 
          classification: "Not specified",
          lastUpdate: "2024",
          status: "Emerging"
        },
        publications: []
      };
    }
  });

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setCountryData(countryProfiles[selectedCountry]);
      setLoading(false);
    }, 300);
  }, [selectedCountry]);

  useEffect(() => {
    if (countryData && !loading) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        initializeCharts();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [countryData, loading]);

  const destroyCharts = () => {
    if (chartInstances.current.trend) {
      chartInstances.current.trend.destroy();
      chartInstances.current.trend = null;
    }
    if (chartInstances.current.focus) {
      chartInstances.current.focus.destroy();
      chartInstances.current.focus = null;
    }
    if (chartInstances.current.readiness) {
      chartInstances.current.readiness.destroy();
      chartInstances.current.readiness = null;
    }
  };

  const initializeCharts = () => {
    if (!countryData) return;

    destroyCharts();

    // Trend Chart
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

    // Focus Chart
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

    // Readiness Gauge Chart
    const readinessCtx = document.getElementById('readinessChart');
    if (readinessCtx) {
      chartInstances.current.readiness = new Chart(readinessCtx, {
        type: 'doughnut',
        data: {
          labels: ['Readiness Score', 'Remaining'],
          datasets: [{ 
            data: [countryData.metrics.readiness * 100, 100 - (countryData.metrics.readiness * 100)], 
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

  const getReadinessLevel = (score) => {
    if (score >= 0.7) return { level: 'Advanced', color: '#2C6E49', bg: '#E0F0EA' };
    if (score >= 0.55) return { level: 'Intermediate', color: '#F57C00', bg: '#FFF3E0' };
    return { level: 'Foundational', color: '#C62828', bg: '#FFEBEE' };
  };

  const getStatusClass = (status) => {
    const map = { "CFT": "status-cft", "R&D": "status-rd", "Commercial": "status-commercial" };
    return map[status] || "status-rd";
  };

  const getTimelineTypeClass = (type) => {
    const map = { "policy": "timeline-policy", "milestone": "timeline-milestone", "project": "timeline-project" };
    return map[type] || "timeline-milestone";
  };

  const filteredCountries = Object.keys(countryProfiles).filter(country =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const readiness = countryData ? getReadinessLevel(countryData.metrics.readiness) : { level: '', color: '', bg: '' };

  return (
    <div className="countries-page">
      {/* Header */}
      <header className="countries-header">
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
                <p>AUDA-NEPAD · Country Profiles</p>
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
      <div className="countries-hero">
        <div className="container">
          <div className="hero-badge">
            <i className="fas fa-flag-checkered"></i> COUNTRY INTELLIGENCE
          </div>
          <h1>Country Profile Dashboard</h1>
          <p>Comprehensive genome editing landscape data for African nations.</p>
        </div>
      </div>

      <div className="container">
        {/* Country Selector */}
        <div className="country-selector-enhanced">
          <div className="selector-header">
            <i className="fas fa-map-marker-alt"></i>
            <span>Select Country:</span>
          </div>
          <div className="search-wrapper">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search country..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="country-select-enhanced" 
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            {filteredCountries.map(country => (
              <option key={country} value={country}>
                {countryProfiles[country]?.flag || '🌍'} {country}
              </option>
            ))}
          </select>
          <button className="export-btn" onClick={() => alert(`Exporting ${selectedCountry} Genome Editing Profile Report`)}>
            <i className="fas fa-download"></i> Export Report
          </button>
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
                <div className="kpi-icon"><i className="fas fa-flask"></i></div>
                <div className="kpi-content">
                  <div className="kpi-value">{countryData.metrics.cfts}</div>
                  <div className="kpi-label">Confined Field Trials</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon"><i className="fas fa-file-alt"></i></div>
                <div className="kpi-content">
                  <div className="kpi-value">{countryData.metrics.publications}</div>
                  <div className="kpi-label">Publications</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon"><i className="fas fa-university"></i></div>
                <div className="kpi-content">
                  <div className="kpi-value">{countryData.metrics.institutions}</div>
                  <div className="kpi-label">Institutions</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon"><i className="fas fa-user-graduate"></i></div>
                <div className="kpi-content">
                  <div className="kpi-value">{countryData.metrics.researchers}</div>
                  <div className="kpi-label">Researchers</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon"><i className="fas fa-dollar-sign"></i></div>
                <div className="kpi-content">
                  <div className="kpi-value">{countryData.metrics.funding}</div>
                  <div className="kpi-label">Total Funding</div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="charts-row">
              <div className="chart-card">
                <h3><i className="fas fa-chart-line"></i> Project & Publication Trends</h3>
                <div className="chart-container">
                  <canvas id="trendChart"></canvas>
                </div>
              </div>
              <div className="chart-card">
                <h3><i className="fas fa-chart-pie"></i> Research Focus Areas</h3>
                <div className="chart-container">
                  <canvas id="focusChart"></canvas>
                </div>
              </div>
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
            <div className="info-card">
              <h3><i className="fas fa-microscope"></i> Key Projects</h3>
              <div className="projects-list">
                {countryData.projects.map((project, idx) => (
                  <div key={idx} className="project-item">
                    <div className="project-info">
                      <div className="project-name">{project.name}</div>
                      <div className="project-details">
                        <span><i className="fas fa-calendar"></i> {project.year}</span>
                        <span><i className="fas fa-building"></i> {project.lead}</span>
                      </div>
                    </div>
                    <span className={`project-status ${getStatusClass(project.status)}`}>{project.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Institutions */}
            <div className="info-card">
              <h3><i className="fas fa-building"></i> Key Institutions</h3>
              <div className="institutions-grid">
                {countryData.institutions.map((inst, idx) => (
                  <div key={idx} className="institution-card-small">
                    <div className="inst-icon"><i className="fas fa-university"></i></div>
                    <div className="inst-info">
                      <div className="inst-name">{inst.name}</div>
                      <div className="inst-meta">
                        <span className="inst-type">{inst.type}</span>
                        <span className="inst-focus">{inst.focus}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

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

            {/* Publications */}
            {countryData.publications && countryData.publications.length > 0 && (
              <div className="info-card">
                <h3><i className="fas fa-file-alt"></i> Key Publications</h3>
                <div className="publications-list">
                  {countryData.publications.map((pub, idx) => (
                    <div key={idx} className="publication-item">
                      <div className="pub-icon"><i className="fas fa-file-pdf"></i></div>
                      <div className="pub-info">
                        <div className="pub-title">{pub.title}</div>
                        <div className="pub-meta">
                          <span>{pub.journal}</span>
                          <span>{pub.year}</span>
                          <span><i className="fas fa-quote-right"></i> {pub.citations} citations</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="countries-footer">
        <div className="container">
          <div className="footer-content">
            <p>© 2026 AUDA-NEPAD Genome Editing Programme — Data updated quarterly.</p>
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