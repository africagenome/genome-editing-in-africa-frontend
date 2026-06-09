import React, { useState, useEffect, useCallback } from 'react';
import './SearchResultsPage.css';

const SearchResultsPage = ({ filters, onBackToSearch, onBackToHome }) => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarFilters, setSidebarFilters] = useState({
    biosafety: [],
    tech: [],
    sector: [],
    crop: [],
    trait: [],
    status: [],
    region: []
  });

  const itemsPerPage = 6;

  // Complete dataset
  const searchData = [
    { 
      id: 1, 
      title: "Kenya: Functional Biosafety Framework & CRISPR Maize Trials", 
      country: "Kenya", 
      region: "East Africa", 
      biosafety: "Functional Framework", 
      tech: ["CRISPR-Cas9"], 
      sector: "Agriculture (Crops & Livestock)", 
      crop: ["Maize"], 
      trait: ["Drought Tolerance"], 
      status: "Proof of Concept / Confined Field Trial", 
      excerpt: "Kenya's NBA has approved confined field trials for drought-tolerant maize using CRISPR-Cas9 technology.",
      fullDescription: "The National Biosafety Authority (NBA) of Kenya has approved confined field trials for drought-tolerant maize varieties developed using CRISPR-Cas9 gene editing. This project aims to address food security challenges in arid and semi-arid regions of Kenya. The trials are being conducted at KALRO research stations across the country.",
      leadInstitution: "Kenya Agricultural and Livestock Research Organization (KALRO)",
      partners: ["University of Nairobi", "CIMMYT", "AUDA-NEPAD"],
      funding: "$2.5M",
      timeline: "2024-2026",
      publications: 3,
      researchers: 12
    },
    { 
      id: 2, 
      title: "Nigeria: Draft Guidelines & Cassava Improvement", 
      country: "Nigeria", 
      region: "West Africa", 
      biosafety: "Draft Guidelines (Genome Editing Specific)", 
      tech: ["CRISPR-Cas9", "SDN-1"], 
      sector: "Agriculture (Crops & Livestock)", 
      crop: ["Cassava"], 
      trait: ["Viral Resistance"], 
      status: "Research & Development Only", 
      excerpt: "Nigeria is drafting GEd guidelines. Researchers use CRISPR for cassava mosaic resistance.",
      fullDescription: "Nigeria's National Biosafety Management Agency (NBMA) is developing specific guidelines for genome editing. Meanwhile, researchers at IITA are using CRISPR-Cas9 to develop cassava varieties resistant to cassava mosaic disease and brown streak disease.",
      leadInstitution: "International Institute of Tropical Agriculture (IITA)",
      partners: ["NABDA", "AATF", "Cornell University"],
      funding: "$3.2M",
      timeline: "2023-2027",
      publications: 5,
      researchers: 18
    },
    { 
      id: 3, 
      title: "South Africa: Commercial Release of Gene-Edited Sorghum", 
      country: "South Africa", 
      region: "Southern Africa", 
      biosafety: "Functional Framework", 
      tech: ["CRISPR-Cas9", "SDN-2"], 
      sector: "Agriculture (Crops & Livestock)", 
      crop: ["Sorghum"], 
      trait: ["Drought Tolerance", "Pest Resistance"], 
      status: "Commercial Release", 
      excerpt: "South Africa leads with commercial release of gene-edited sorghum.",
      fullDescription: "South Africa has achieved a milestone with the first commercial release of gene-edited sorghum in Africa. The varieties offer enhanced drought tolerance and pest resistance, marking a significant step for agricultural biotechnology on the continent.",
      leadInstitution: "Agricultural Research Council (ARC)",
      partners: ["Seed Co", "DALRRD", "University of Pretoria"],
      funding: "$4.1M",
      timeline: "2025",
      publications: 8,
      researchers: 25
    },
    { 
      id: 4, 
      title: "Ghana: Policy Development & Cowpea CFTs", 
      country: "Ghana", 
      region: "West Africa", 
      biosafety: "Policy Development", 
      tech: ["CRISPR-Cas9"], 
      sector: "Agriculture (Crops & Livestock)", 
      crop: ["Cowpea", "Maize"], 
      trait: ["Pest Resistance"], 
      status: "Proof of Concept / Confined Field Trial", 
      excerpt: "Ghana develops GEd policies while conducting CFTs for pod borer-resistant cowpea.",
      fullDescription: "Ghana is actively developing genome editing policies while conducting confined field trials for pod borer-resistant cowpea at CSIR-SARI. The trials are showing promising results with significant reduction in pest damage.",
      leadInstitution: "CSIR-Savanna Agricultural Research Institute",
      partners: ["University of Ghana", "AATF", "AGRA"],
      funding: "$1.8M",
      timeline: "2024-2026",
      publications: 4,
      researchers: 10
    },
    { 
      id: 5, 
      title: "Ethiopia: No Specific Framework, Teff Research", 
      country: "Ethiopia", 
      region: "East Africa", 
      biosafety: "No Specific Framework", 
      tech: ["TALENs"], 
      sector: "Agriculture (Crops & Livestock)", 
      crop: ["Teff"], 
      trait: ["Drought Tolerance"], 
      status: "Research & Development Only", 
      excerpt: "Ethiopia lacks specific GEd regulations but uses TALENs for teff improvement.",
      fullDescription: "While Ethiopia has no specific genome editing framework, researchers at EIAR are using TALENs technology to improve teff lodging resistance and drought tolerance, preserving the country's staple crop heritage.",
      leadInstitution: "Ethiopian Institute of Agricultural Research (EIAR)",
      partners: ["Addis Ababa University"],
      funding: "$1.5M",
      timeline: "2023-2026",
      publications: 2,
      researchers: 8
    },
    { 
      id: 6, 
      title: "Burkina Faso: Draft Guidelines & Cotton CFTs", 
      country: "Burkina Faso", 
      region: "West Africa", 
      biosafety: "Draft Guidelines (Genome Editing Specific)", 
      tech: ["CRISPR-Cas9"], 
      sector: "Agriculture (Crops & Livestock)", 
      crop: ["Cotton"], 
      trait: ["Pest Resistance"], 
      status: "Proof of Concept / Confined Field Trial", 
      excerpt: "Burkina Faso conducts CFTs for insect-resistant gene-edited cotton.",
      fullDescription: "Burkina Faso is developing genome editing guidelines and conducting confined field trials for insect-resistant gene-edited cotton, building on their experience with Bt cotton.",
      leadInstitution: "Institut de l'Environnement et de Recherches Agricoles (INERA)",
      partners: ["Monsanto Burkina", "CORAF"],
      funding: "$2.2M",
      timeline: "2024-2027",
      publications: 3,
      researchers: 15
    },
    { 
      id: 7, 
      title: "Uganda: Banana Bacterial Wilt Resistance", 
      country: "Uganda", 
      region: "East Africa", 
      biosafety: "Policy Development", 
      tech: ["CRISPR-Cas9"], 
      sector: "Agriculture (Crops & Livestock)", 
      crop: ["Banana"], 
      trait: ["Viral Resistance"], 
      status: "Proof of Concept / Confined Field Trial", 
      excerpt: "CRISPR-edited banana varieties with resistance to Banana Xanthomonas wilt.",
      fullDescription: "Ugandan researchers are using CRISPR-Cas9 to develop banana varieties resistant to Banana Xanthomonas wilt (BXW), a devastating disease affecting East African farmers.",
      leadInstitution: "National Agricultural Research Organisation (NARO)",
      partners: ["IITA", "University of Nairobi"],
      funding: "$2.2M",
      timeline: "2024-2027",
      publications: 4,
      researchers: 14
    },
    { 
      id: 8, 
      title: "Tanzania: Cassava Brown Streak Disease Resistance", 
      country: "Tanzania", 
      region: "East Africa", 
      biosafety: "Draft Guidelines (Genome Editing Specific)", 
      tech: ["CRISPR-Cas9"], 
      sector: "Agriculture (Crops & Livestock)", 
      crop: ["Cassava"], 
      trait: ["Viral Resistance"], 
      status: "Research & Development Only", 
      excerpt: "Developing CRISPR-edited cassava resistant to brown streak disease.",
      fullDescription: "Tanzanian scientists are using CRISPR-Cas9 to develop cassava varieties resistant to cassava brown streak disease, a major threat to food security in the region.",
      leadInstitution: "Mikocheni Agricultural Research Institute (MARI)",
      partners: ["IITA", "KALRO"],
      funding: "$2.8M",
      timeline: "2023-2026",
      publications: 3,
      researchers: 11
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let results = [...searchData];
      
      // Apply filters from advanced search
      if (filters) {
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          results = results.filter(r => 
            r.title.toLowerCase().includes(query) ||
            r.country.toLowerCase().includes(query) ||
            r.excerpt.toLowerCase().includes(query) ||
            r.leadInstitution?.toLowerCase().includes(query)
          );
        }
        if (filters.biosafety?.length) {
          results = results.filter(r => filters.biosafety.includes(r.biosafety));
        }
        if (filters.tech?.length) {
          results = results.filter(r => r.tech.some(t => filters.tech.includes(t)));
        }
        if (filters.sector?.length) {
          results = results.filter(r => filters.sector.includes(r.sector));
        }
        if (filters.crop?.length) {
          results = results.filter(r => r.crop.some(c => filters.crop.includes(c)));
        }
        if (filters.trait?.length) {
          results = results.filter(r => r.trait.some(t => filters.trait.includes(t)));
        }
        if (filters.status?.length) {
          results = results.filter(r => filters.status.includes(r.status));
        }
        if (filters.region?.length) {
          results = results.filter(r => filters.region.includes(r.region));
        }
        if (filters.country) {
          results = results.filter(r => r.country === filters.country);
        }
      }
      
      setResults(results);
      setFilteredResults(results);
      setLoading(false);
    }, 500);
  }, [filters]);

  const applySidebarFilters = useCallback(() => {
    let results = [...searchData];
    
    if (sidebarFilters.biosafety.length) {
      results = results.filter(r => sidebarFilters.biosafety.includes(r.biosafety));
    }
    if (sidebarFilters.tech.length) {
      results = results.filter(r => r.tech.some(t => sidebarFilters.tech.includes(t)));
    }
    if (sidebarFilters.sector.length) {
      results = results.filter(r => sidebarFilters.sector.includes(r.sector));
    }
    if (sidebarFilters.crop.length) {
      results = results.filter(r => r.crop.some(c => sidebarFilters.crop.includes(c)));
    }
    if (sidebarFilters.trait.length) {
      results = results.filter(r => r.trait.some(t => sidebarFilters.trait.includes(t)));
    }
    if (sidebarFilters.status.length) {
      results = results.filter(r => sidebarFilters.status.includes(r.status));
    }
    if (sidebarFilters.region.length) {
      results = results.filter(r => sidebarFilters.region.includes(r.region));
    }
    
    setFilteredResults(results);
    setCurrentPage(1);
  }, [sidebarFilters]);

  const handleSidebarFilterChange = (category, value) => {
    setSidebarFilters(prev => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const clearSidebarFilters = () => {
    setSidebarFilters({
      biosafety: [],
      tech: [],
      sector: [],
      crop: [],
      trait: [],
      status: [],
      region: []
    });
  };

  const getSortedResults = () => {
    let sorted = [...filteredResults];
    if (sortBy === 'title') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'country') {
      sorted.sort((a, b) => a.country.localeCompare(b.country));
    } else if (sortBy === 'status') {
      sorted.sort((a, b) => a.status.localeCompare(b.status));
    }
    return sorted;
  };

  const getStatusClass = (status) => {
    if (status.includes('Commercial')) return 'status-commercial';
    if (status.includes('CFT') || status.includes('Proof')) return 'status-cft';
    return 'status-rd';
  };

  const paginatedResults = getSortedResults().slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  // Filter options for sidebar
  const filterOptions = {
    biosafety: ["Functional Framework", "Draft Guidelines (Genome Editing Specific)", "No Specific Framework", "Policy Development"],
    tech: ["CRISPR-Cas9", "TALENs", "SDN-1", "SDN-2"],
    sector: ["Agriculture (Crops & Livestock)", "Public Health (Disease Vector Control)", "Human Gene Therapy"],
    crop: ["Maize", "Cassava", "Sorghum", "Cowpea", "Teff", "Cotton", "Banana", "Rice"],
    trait: ["Drought Tolerance", "Viral Resistance", "Pest Resistance", "Salt Tolerance", "Yield Improvement"],
    status: ["Proof of Concept / Confined Field Trial", "Commercial Release", "Research & Development Only"],
    region: ["East Africa", "West Africa", "Southern Africa", "North Africa", "Central Africa"]
  };

  return (
    <div className="search-results-page">
      {/* Header */}
      <header className="results-header">
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
                <p>AUDA-NEPAD · Search Results</p>
              </div>
            </div>
            <div className="nav-links">
              <button onClick={onBackToSearch} className="nav-btn">
                <i className="fas fa-search"></i> Advanced Search
              </button>
              <button onClick={onBackToHome} className="back-link">
                <i className="fas fa-home"></i> Back to Home
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="results-layout">
          {/* Sidebar Filters */}
          <aside className="filters-sidebar">
            <div className="filter-header">
              <h3><i className="fas fa-sliders-h"></i> Refine Results</h3>
              <button className="clear-filters" onClick={clearSidebarFilters}>
                Clear all
              </button>
            </div>

            <div className="filter-group">
              <label className="filter-label">Regulatory Status</label>
              <div className="filter-options">
                {filterOptions.biosafety.map(option => (
                  <label key={option}>
                    <input 
                      type="checkbox" 
                      checked={sidebarFilters.biosafety.includes(option)}
                      onChange={() => handleSidebarFilterChange('biosafety', option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Technology</label>
              <div className="filter-options">
                {filterOptions.tech.map(option => (
                  <label key={option}>
                    <input 
                      type="checkbox" 
                      checked={sidebarFilters.tech.includes(option)}
                      onChange={() => handleSidebarFilterChange('tech', option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Sector</label>
              <div className="filter-options">
                {filterOptions.sector.map(option => (
                  <label key={option}>
                    <input 
                      type="checkbox" 
                      checked={sidebarFilters.sector.includes(option)}
                      onChange={() => handleSidebarFilterChange('sector', option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Crop</label>
              <div className="filter-options">
                {filterOptions.crop.map(option => (
                  <label key={option}>
                    <input 
                      type="checkbox" 
                      checked={sidebarFilters.crop.includes(option)}
                      onChange={() => handleSidebarFilterChange('crop', option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Status</label>
              <div className="filter-options">
                {filterOptions.status.map(option => (
                  <label key={option}>
                    <input 
                      type="checkbox" 
                      checked={sidebarFilters.status.includes(option)}
                      onChange={() => handleSidebarFilterChange('status', option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">Region</label>
              <div className="filter-options">
                {filterOptions.region.map(option => (
                  <label key={option}>
                    <input 
                      type="checkbox" 
                      checked={sidebarFilters.region.includes(option)}
                      onChange={() => handleSidebarFilterChange('region', option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <button className="apply-filters" onClick={applySidebarFilters}>
              <i className="fas fa-search"></i> Apply Filters
            </button>
          </aside>

          {/* Results Main */}
          <main className="results-main">
            <div className="results-header-bar">
              <div className="results-count">
                <i className="fas fa-database"></i>
                <span>{filteredResults.length}</span> genome editing entries found
              </div>
              <div className="results-sort">
                <label>Sort by:</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="relevance">Relevance</option>
                  <option value="title">Title A-Z</option>
                  <option value="country">Country</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Searching database...</p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <h3>No results found</h3>
                <p>Try adjusting your search criteria or clearing filters.</p>
                <button onClick={clearSidebarFilters} className="clear-filters-btn">
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="results-grid">
                  {paginatedResults.map(result => (
                    <div 
                      key={result.id} 
                      className="result-card"
                      onClick={() => setSelectedProject(result)}
                    >
                      <div className="result-title">{result.title}</div>
                      <div className="result-badges">
                        <span className="badge badge-country">
                          <i className="fas fa-map-marker-alt"></i> {result.country} ({result.region})
                        </span>
                        <span className="badge badge-status">
                          <i className="fas fa-gavel"></i> {result.biosafety}
                        </span>
                        <span className="badge badge-tech">
                          <i className="fas fa-microscope"></i> {result.tech.join(', ')}
                        </span>
                        <span className={`badge ${getStatusClass(result.status)}`}>
                          <i className="fas fa-chart-line"></i> {result.status}
                        </span>
                      </div>
                      <div className="result-excerpt">{result.excerpt}</div>
                      <div className="result-details">
                        <span><i className="fas fa-seedling"></i> Crops: {result.crop.join(', ')}</span>
                        <span><i className="fas fa-dna"></i> Traits: {result.trait.join(', ')}</span>
                      </div>
                      <div className="result-footer">
                        <span><i className="fas fa-building"></i> {result.leadInstitution}</span>
                        <button className="view-details-btn">
                          View Details <i className="fas fa-arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="pagination">
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
              </>
            )}
          </main>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedProject && (
        <div className="detail-modal" onClick={() => setSelectedProject(null)}>
          <div className="detail-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProject.title}</h2>
              <button className="close-modal" onClick={() => setSelectedProject(null)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="detail-badges">
                <span className="badge badge-country">{selectedProject.country} ({selectedProject.region})</span>
                <span className={`badge ${getStatusClass(selectedProject.status)}`}>{selectedProject.status}</span>
              </div>
              
              <div className="detail-section">
                <h3>Overview</h3>
                <p>{selectedProject.fullDescription || selectedProject.excerpt}</p>
              </div>

              <div className="detail-grid">
                <div className="detail-card">
                  <div className="detail-label">Lead Institution</div>
                  <div className="detail-value">{selectedProject.leadInstitution}</div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Timeline</div>
                  <div className="detail-value">{selectedProject.timeline}</div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Funding</div>
                  <div className="detail-value">{selectedProject.funding}</div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Publications</div>
                  <div className="detail-value">{selectedProject.publications} papers</div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Technical Details</h3>
                <div className="info-row">
                  <span className="info-label">Technology:</span>
                  <span>{selectedProject.tech.join(', ')}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Crops:</span>
                  <span>{selectedProject.crop.join(', ')}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Traits:</span>
                  <span>{selectedProject.trait.join(', ')}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Regulatory Status:</span>
                  <span>{selectedProject.biosafety}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Partners</h3>
                <div className="partners-list">
                  {selectedProject.partners.map((partner, idx) => (
                    <span key={idx} className="partner-tag">{partner}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="results-footer">
        <div className="container">
          <div className="footer-content">
            <p>© 2026 AUDA-NEPAD Genome Editing Programme — Data from African regulatory & research landscape analyses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SearchResultsPage;