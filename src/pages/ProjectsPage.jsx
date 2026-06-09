import React, { useState, useEffect, useCallback } from 'react';
import ProjectDetailsPage from './ProjectDetailsPage';
import './ProjectsPage.css';

const ProjectsPage = ({ onBackClick }) => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    tech: [],
    crops: [],
    status: [],
    region: [],
    search: ''
  });

  const itemsPerPage = 9;

  // Complete projects dataset
  const projectsData = [
    { 
      id: 1, 
      title: "Drought-Tolerant Maize using CRISPR-Cas9", 
      country: "Kenya", 
      region: "East Africa", 
      crop: "Maize", 
      tech: "CRISPR-Cas9", 
      status: "CFT", 
      description: "Confined field trials for drought-tolerant maize varieties developed using CRISPR-Cas9 technology. Promising 30% yield increase under water-limited conditions.", 
      tags: ["drought tolerance", "yield improvement", "food security"], 
      partners: ["KALRO", "University of Nairobi", "AUDA-NEPAD"], 
      year: "2024-2026",
      leadInstitution: "Kenya Agricultural and Livestock Research Organization",
      funding: "$2.5M",
      impact: "Expected to benefit 500,000 smallholder farmers",
      imageUrl: "https://images.unsplash.com/photo-1628191010213-c0a11f5c1d6a?w=400"
    },
    { 
      id: 2, 
      title: "Cassava Mosaic Virus Resistance", 
      country: "Nigeria", 
      region: "West Africa", 
      crop: "Cassava", 
      tech: "CRISPR-Cas9", 
      status: "R&D", 
      description: "Developing CRISPR-edited cassava with enhanced resistance to cassava mosaic disease and brown streak disease.", 
      tags: ["viral resistance", "food security", "smallholder"], 
      partners: ["IITA", "NABDA", "AATF"], 
      year: "2023-2027",
      leadInstitution: "International Institute of Tropical Agriculture",
      funding: "$3.2M",
      impact: "Targeting 1M farmers across West Africa",
      imageUrl: "https://images.unsplash.com/photo-1523348837708-15c4ad09b56e?w=400"
    },
    { 
      id: 3, 
      title: "Gene-Edited Sorghum Commercial Release", 
      country: "South Africa", 
      region: "Southern Africa", 
      crop: "Sorghum", 
      tech: "CRISPR-Cas9", 
      status: "Commercial", 
      description: "First commercial release of gene-edited sorghum with enhanced drought tolerance and pest resistance in Africa.", 
      tags: ["commercialization", "drought tolerance", "pest resistance"], 
      partners: ["ARC", "Seed Co", "DALRRD"], 
      year: "2025",
      leadInstitution: "Agricultural Research Council",
      funding: "$4.1M",
      impact: "First commercial GEd crop in Africa",
      imageUrl: "https://images.unsplash.com/photo-1574323345637-d227c5e7f3b7?w=400"
    },
    { 
      id: 4, 
      title: "Pod Borer-Resistant Cowpea", 
      country: "Ghana", 
      region: "West Africa", 
      crop: "Cowpea", 
      tech: "CRISPR-Cas9", 
      status: "CFT", 
      description: "Confined field trials for cowpea varieties resistant to Maruca pod borer using genome editing.", 
      tags: ["pest resistance", "legume", "yield protection"], 
      partners: ["CSIR-SARI", "University of Ghana", "AATF"], 
      year: "2024-2026",
      leadInstitution: "CSIR-Savanna Agricultural Research Institute",
      funding: "$1.8M",
      impact: "40% reduction in pesticide use",
      imageUrl: "https://images.unsplash.com/photo-1590963063227-cd9842e11d5c?w=400"
    },
    { 
      id: 5, 
      title: "Teff Lodging Resistance using TALENs", 
      country: "Ethiopia", 
      region: "East Africa", 
      crop: "Teff", 
      tech: "TALENs", 
      status: "R&D", 
      description: "Using TALENs technology to develop teff varieties with improved lodging resistance and higher yield potential.", 
      tags: ["lodging resistance", "indigenous crop", "yield"], 
      partners: ["EIAR", "Addis Ababa University"], 
      year: "2023-2026",
      leadInstitution: "Ethiopian Institute of Agricultural Research",
      funding: "$1.5M",
      impact: "Preserving Ethiopia's staple crop heritage",
      imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e8ac?w=400"
    },
    { 
      id: 6, 
      title: "Banana Bacterial Wilt Resistance", 
      country: "Uganda", 
      region: "East Africa", 
      crop: "Banana", 
      tech: "CRISPR-Cas9", 
      status: "CFT", 
      description: "CRISPR-edited banana varieties with resistance to Banana Xanthomonas wilt (BXW).", 
      tags: ["bacterial resistance", "staple crop", "food security"], 
      partners: ["NARO", "IITA", "University of Nairobi"], 
      year: "2024-2027",
      leadInstitution: "National Agricultural Research Organisation",
      funding: "$2.2M",
      impact: "Securing food for 10M Ugandans",
      imageUrl: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400"
    },
    { 
      id: 7, 
      title: "SDN-1 Maize for Fall Armyworm Resistance", 
      country: "Zimbabwe", 
      region: "Southern Africa", 
      crop: "Maize", 
      tech: "SDN-1", 
      status: "R&D", 
      description: "Developing SDN-1 edited maize with enhanced resistance to fall armyworm.", 
      tags: ["pest resistance", "armyworm", "yield protection"], 
      partners: ["Seed Co", "ARC"], 
      year: "2024-2026",
      leadInstitution: "Seed Co Limited",
      funding: "$1.9M",
      impact: "Protecting 70% of maize crops",
      imageUrl: "https://images.unsplash.com/photo-1628191010213-c0a11f5c1d6a?w=400"
    },
    { 
      id: 8, 
      title: "Salt-Tolerant Rice for Coastal Africa", 
      country: "Kenya", 
      region: "East Africa", 
      crop: "Rice", 
      tech: "CRISPR-Cas9", 
      status: "R&D", 
      description: "Developing salt-tolerant rice varieties for coastal regions.", 
      tags: ["salt tolerance", "climate resilience", "coastal"], 
      partners: ["KALRO", "IRRI"], 
      year: "2023-2026",
      leadInstitution: "International Rice Research Institute",
      funding: "$2.8M",
      impact: "Reclaiming 200,000 hectares of coastal land",
      imageUrl: "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400"
    },
    { 
      id: 9, 
      title: "Shelf-Life Extension for Tomato", 
      country: "Senegal", 
      region: "West Africa", 
      crop: "Tomato", 
      tech: "CRISPR-Cas9", 
      status: "R&D", 
      description: "Extending shelf life of tomato varieties using CRISPR editing.", 
      tags: ["post-harvest", "shelf life", "market access"], 
      partners: ["ISRA", "UCAD"], 
      year: "2024-2027",
      leadInstitution: "Institut Sénégalais de Recherches Agricoles",
      funding: "$1.2M",
      impact: "Reducing post-harvest losses by 50%",
      imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400"
    },
    { 
      id: 10, 
      title: "Sickle Cell Disease Gene Therapy", 
      country: "South Africa", 
      region: "Southern Africa", 
      crop: "Human Health", 
      tech: "CRISPR-Cas9", 
      status: "R&D", 
      description: "Developing CRISPR-based gene therapy for sickle cell disease.", 
      tags: ["gene therapy", "human health", "rare disease"], 
      partners: ["University of Cape Town", "NIH", "CRI"], 
      year: "2024-2028",
      leadInstitution: "University of Cape Town",
      funding: "$5.5M",
      impact: "Potential cure for 300,000 African newborns annually",
      imageUrl: "https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=400"
    }
  ];

  useEffect(() => {
    setProjects(projectsData);
    setFilteredProjects(projectsData);
  }, []);

  const applyFilters = useCallback(() => {
    let results = [...projects];

    // Search filter
    if (filters.search) {
      results = results.filter(p => 
        p.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.country.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Technology filter
    if (filters.tech.length) {
      results = results.filter(p => filters.tech.includes(p.tech));
    }

    // Crop filter
    if (filters.crops.length) {
      results = results.filter(p => filters.crops.includes(p.crop));
    }

    // Status filter
    if (filters.status.length) {
      results = results.filter(p => filters.status.includes(p.status));
    }

    // Region filter
    if (filters.region.length) {
      results = results.filter(p => filters.region.includes(p.region));
    }

    setFilteredProjects(results);
    setCurrentPage(1);
  }, [projects, filters]);

  const clearFilters = () => {
    setFilters({
      tech: [],
      crops: [],
      status: [],
      region: [],
      search: ''
    });
    setFilteredProjects(projects);
    setCurrentPage(1);
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

  const handleSearchChange = (e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const getStatusClass = (status) => {
    const map = { "CFT": "status-cft", "R&D": "status-rd", "Commercial": "status-commercial" };
    return map[status] || "status-rd";
  };

  const getStatusLabel = (status) => {
    const map = { "CFT": "Confined Field Trial", "R&D": "Research & Development", "Commercial": "Commercial Release" };
    return map[status] || status;
  };

  const handleProjectClick = (projectId) => {
    setSelectedProjectId(projectId);
    window.scrollTo(0, 0);
  };

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: projects.length,
    countries: [...new Set(projects.map(p => p.country))].length,
    cft: projects.filter(p => p.status === "CFT").length,
    commercial: projects.filter(p => p.status === "Commercial").length
  };

  // If a project is selected, show details page
  if (selectedProjectId) {
    return (
      <ProjectDetailsPage 
        projectId={selectedProjectId} 
        onBackClick={() => setSelectedProjectId(null)} 
      />
    );
  }

  return (
    <div className="projects-page-enhanced">
      {/* Header */}
      <header className="projects-header-enhanced">
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
                <p>AUDA-NEPAD · Research & Development Portfolio</p>
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
      <div className="projects-hero">
        <div className="container">
          <div className="hero-badge">
            <i className="fas fa-flask"></i> ACTIVE INITIATIVES
          </div>
          <h1>Genome Editing Projects</h1>
          <p>Discover ongoing research, confined field trials, and capacity-building initiatives across Africa.</p>
        </div>
      </div>

      <div className="container">
        {/* Stats Cards */}
        <div className="stats-grid-enhanced">
          <div className="stat-card-enhanced">
            <div className="stat-icon"><i className="fas fa-project-diagram"></i></div>
            <div className="stat-content">
              <div className="stat-number">{stats.total}+</div>
              <div className="stat-label">Active Projects</div>
            </div>
          </div>
          <div className="stat-card-enhanced">
            <div className="stat-icon"><i className="fas fa-globe-africa"></i></div>
            <div className="stat-content">
              <div className="stat-number">{stats.countries}</div>
              <div className="stat-label">African Countries</div>
            </div>
          </div>
          <div className="stat-card-enhanced">
            <div className="stat-icon"><i className="fas fa-flask"></i></div>
            <div className="stat-content">
              <div className="stat-number">{stats.cft}</div>
              <div className="stat-label">CFT Approvals</div>
            </div>
          </div>
          <div className="stat-card-enhanced">
            <div className="stat-icon"><i className="fas fa-rocket"></i></div>
            <div className="stat-content">
              <div className="stat-number">{stats.commercial}</div>
              <div className="stat-label">Commercial Releases</div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="search-filter-bar">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search projects by title, description, or country..."
              value={filters.search}
              onChange={handleSearchChange}
              onKeyUp={applyFilters}
            />
          </div>
          <button 
            className="filter-toggle" 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <i className="fas fa-filter"></i> Filters
            <i className={`fas fa-chevron-${isFilterOpen ? 'up' : 'down'}`}></i>
          </button>
        </div>

        {/* Main Layout */}
        <div className="projects-layout-enhanced">
          {/* Filters Sidebar */}
          <aside className={`filters-sidebar-enhanced ${isFilterOpen ? 'open' : ''}`}>
            <div className="filter-header">
              <h3><i className="fas fa-sliders-h"></i> Filter Projects</h3>
              <button className="clear-all" onClick={clearFilters}>
                <i className="fas fa-undo-alt"></i> Clear all
              </button>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">🔬 Technology</label>
              <div className="filter-options">
                {["CRISPR-Cas9", "TALENs", "SDN-1", "SDN-2"].map(tech => (
                  <label key={tech}>
                    <input 
                      type="checkbox" 
                      value={tech}
                      checked={filters.tech.includes(tech)}
                      onChange={() => handleFilterChange('tech', tech)}
                    /> 
                    <span>{tech}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">🌾 Crop / Focus</label>
              <div className="filter-options">
                {["Maize", "Cassava", "Sorghum", "Cowpea", "Banana", "Teff", "Rice", "Tomato", "Human Health"].map(crop => (
                  <label key={crop}>
                    <input 
                      type="checkbox" 
                      value={crop}
                      checked={filters.crops.includes(crop)}
                      onChange={() => handleFilterChange('crops', crop)}
                    /> 
                    <span>{crop}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">📊 Project Status</label>
              <div className="filter-options">
                {["CFT", "R&D", "Commercial"].map(status => (
                  <label key={status}>
                    <input 
                      type="checkbox" 
                      value={status}
                      checked={filters.status.includes(status)}
                      onChange={() => handleFilterChange('status', status)}
                    /> 
                    <span>{getStatusLabel(status)}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">📍 Region</label>
              <div className="filter-options">
                {["East Africa", "West Africa", "Southern Africa", "North Africa", "Central Africa"].map(region => (
                  <label key={region}>
                    <input 
                      type="checkbox" 
                      value={region}
                      checked={filters.region.includes(region)}
                      onChange={() => handleFilterChange('region', region)}
                    /> 
                    <span>{region}</span>
                  </label>
                ))}
              </div>
            </div>

            <button className="apply-filters-enhanced" onClick={applyFilters}>
              <i className="fas fa-search"></i> Apply Filters
            </button>
          </aside>

          {/* Results Area */}
          <main className="results-main-enhanced">
            <div className="results-header-enhanced">
              <div className="results-count">
                <i className="fas fa-project-diagram"></i> 
                <span>{filteredProjects.length}</span> projects found
              </div>
              <div className="results-sort">
                <span>Sort by:</span>
                <select>
                  <option>Latest</option>
                  <option>Oldest</option>
                  <option>Status</option>
                  <option>Country</option>
                </select>
              </div>
            </div>

            <div className="projects-grid">
              {paginatedProjects.map(project => (
                <div 
                  key={project.id} 
                  className="project-card-enhanced"
                  onClick={() => handleProjectClick(project.id)}
                >
                  <div className="card-image">
                    <img src={project.imageUrl} alt={project.title} />
                    <span className={`card-status ${getStatusClass(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>
                  <div className="card-content">
                    <h3 className="card-title">{project.title}</h3>
                    <div className="card-meta">
                      <span><i className="fas fa-map-marker-alt"></i> {project.country}</span>
                      <span><i className="fas fa-microscope"></i> {project.tech}</span>
                    </div>
                    <p className="card-description">{project.description.substring(0, 100)}...</p>
                    <div className="card-tags">
                      {project.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="tag">#{tag}</span>
                      ))}
                    </div>
                    <div className="card-footer">
                      <span className="card-year">{project.year}</span>
                      <button className="view-details-btn">
                        View Details <i className="fas fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="no-results-enhanced">
                <i className="fas fa-flask"></i>
                <h3>No projects found</h3>
                <p>Try adjusting your filters or search terms.</p>
                <button onClick={clearFilters} className="clear-filters-btn">
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-enhanced">
                <button 
                  className="page-btn"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <i className="fas fa-chevron-left"></i> Previous
                </button>
                <div className="page-numbers">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      className={`page-number ${currentPage === i + 1 ? 'active' : ''}`}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  className="page-btn"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="projects-footer-enhanced">
        <div className="container">
          <div className="footer-content">
            <p>© 2026 AUDA-NEPAD Genome Editing Programme — Advancing science for Africa's prosperity.</p>
            <button onClick={onBackClick} className="footer-back-btn">
              <i className="fas fa-home"></i> Back to Home
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProjectsPage;