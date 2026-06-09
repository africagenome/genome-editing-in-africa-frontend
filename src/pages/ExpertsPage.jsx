import React, { useState, useEffect, useCallback } from 'react';
import './ExpertsPage.css';

const ExpertsPage = ({ onBackClick }) => {
  const [experts, setExperts] = useState([]);
  const [filteredExperts, setFilteredExperts] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    expertise: [],
    region: [],
    sector: []
  });

  // Experts Dataset
  const expertsData = [
    { 
      id: 1, 
      name: "Dr. Jane Mwangi", 
      title: "Senior Molecular Biologist", 
      institution: "Kenya Agricultural & Livestock Research Organization (KALRO)", 
      country: "Kenya", 
      region: "East Africa", 
      sector: "Research", 
      expertise: ["CRISPR-Cas9", "Crop Improvement", "Plant Biotechnology"], 
      bio: "Leading CRISPR research for drought-tolerant maize and cassava improvement. Over 15 years experience in plant biotechnology and molecular breeding. Pioneered the first confined field trials for gene-edited maize in East Africa.",
      fullBio: "Dr. Jane Mwangi is a Senior Molecular Biologist at KALRO with over 15 years of experience in plant biotechnology. She leads a team of researchers focused on developing drought-tolerant and pest-resistant crop varieties using CRISPR-Cas9 technology. Her work has resulted in several confined field trials for gene-edited maize and cassava. She has trained over 50 young scientists in genome editing techniques and serves on the National Biosafety Authority's technical advisory committee.",
      email: "j.mwangi@kalro.org", 
      phone: "+254 722 123456", 
      linkedin: "#", 
      twitter: "@drjanemwangi",
      publications: 28,
      projects: 5,
      education: "PhD Molecular Biology - University of Nairobi",
      awards: ["AUDA-NEPAD Women in Science Award 2023", "KALRO Outstanding Researcher 2022"]
    },
    { 
      id: 2, 
      name: "Prof. Oluwaseun Adeyemo", 
      title: "Director of Biosafety", 
      institution: "National Biosafety Management Agency (NBMA)", 
      country: "Nigeria", 
      region: "West Africa", 
      sector: "Regulatory", 
      expertise: ["Regulatory", "Policy", "Risk Assessment"], 
      bio: "National biosafety regulator leading development of genome editing guidelines for Nigeria. Expert in risk assessment and biosafety policy development.",
      fullBio: "Professor Oluwaseun Adeyemo is the Director of Biosafety at Nigeria's NBMA, where he leads the development of genome editing guidelines and regulatory frameworks. With over 20 years of experience in biosafety policy, he has been instrumental in shaping Nigeria's approach to emerging biotechnologies. He chairs the West African Biosafety Network and has advised numerous African governments on genome editing regulation.",
      email: "o.adeyemo@nbma.gov.ng", 
      phone: "+234 803 123456", 
      linkedin: "#", 
      twitter: "@profadeyemo",
      publications: 15,
      projects: 8,
      education: "PhD Biosafety - University of Ibadan",
      awards: ["African Biosafety Leadership Award 2024", "NBMA Excellence Award 2023"]
    },
    { 
      id: 3, 
      name: "Dr. Thabo Nkosi", 
      title: "Research Chair", 
      institution: "University of Cape Town", 
      country: "South Africa", 
      region: "Southern Africa", 
      sector: "Research", 
      expertise: ["CRISPR-Cas9", "Gene Therapy", "Human Health"], 
      bio: "Leading gene therapy research for sickle cell disease using CRISPR-Cas9. Clinical trial experience and translational research focus.",
      fullBio: "Dr. Thabo Nkosi holds the Research Chair in Gene Therapy at the University of Cape Town. His pioneering work on CRISPR-based therapies for sickle cell disease has gained international recognition. He is leading Africa's first clinical trial for gene-edited cell therapy and has established a state-of-the-art gene editing facility at UCT's Institute of Infectious Disease and Molecular Medicine.",
      email: "thabo.nkosi@uct.ac.za", 
      phone: "+27 21 123 4567", 
      linkedin: "#", 
      twitter: "@drthabonkosi",
      publications: 42,
      projects: 7,
      education: "PhD Gene Therapy - University of Oxford",
      awards: ["NSTF Researcher of the Year 2024", "CRI Innovation Award 2023"]
    },
    { 
      id: 4, 
      name: "Dr. Fatoumata Diallo", 
      title: "Policy Advisor", 
      institution: "AUDA-NEPAD", 
      country: "Senegal", 
      region: "West Africa", 
      sector: "Policy", 
      expertise: ["Policy", "Regulatory", "Harmonization"], 
      bio: "Leading continental harmonization efforts for genome editing regulation. Drafted AU Model Law amendments for emerging biotechnologies.",
      fullBio: "Dr. Fatoumata Diallo serves as Policy Advisor at AUDA-NEPAD, where she coordinates the African Union's efforts to harmonize genome editing policies across member states. She played a key role in drafting amendments to the AU Model Law to accommodate emerging biotechnologies. Her work focuses on creating enabling environments for responsible innovation while ensuring safety and public trust.",
      email: "f.diallo@nepad.org", 
      phone: "+221 77 123 4567", 
      linkedin: "#", 
      twitter: "@fdiallo_au",
      publications: 12,
      projects: 15,
      education: "PhD Public Policy - Sciences Po Paris",
      awards: ["AU Meritorious Service Award 2024", "Women in Leadership Award 2023"]
    },
    { 
      id: 5, 
      name: "Prof. Yaw Asare", 
      title: "Plant Biotechnologist", 
      institution: "CSIR-Savanna Agricultural Research Institute", 
      country: "Ghana", 
      region: "West Africa", 
      sector: "Research", 
      expertise: ["CRISPR-Cas9", "Crop Improvement", "Cowpea"], 
      bio: "Developing pod borer-resistant cowpea using genome editing. Lead investigator for confined field trials in West Africa.",
      fullBio: "Professor Yaw Asare is a leading plant biotechnologist at CSIR-SARI, specializing in genome editing for legume improvement. He has successfully developed pod borer-resistant cowpea varieties using CRISPR-Cas9 technology, which are now in confined field trials. His research has the potential to significantly reduce pesticide use and improve food security for millions of smallholder farmers.",
      email: "y.asare@csir.org.gh", 
      phone: "+233 24 123 4567", 
      linkedin: "#", 
      twitter: "@profyawasare",
      publications: 22,
      projects: 6,
      education: "PhD Plant Biotechnology - Wageningen University",
      awards: ["CSIR Best Researcher 2023", "AGRA Food Security Award 2024"]
    },
    { 
      id: 6, 
      name: "Dr. Alemitu Bekele", 
      title: "Molecular Biologist", 
      institution: "Ethiopian Institute of Agricultural Research", 
      country: "Ethiopia", 
      region: "East Africa", 
      sector: "Research", 
      expertise: ["TALENs", "Crop Improvement", "Teff"], 
      bio: "Using TALENs technology for teff improvement with focus on lodging resistance and yield enhancement.",
      fullBio: "Dr. Alemitu Bekele is a molecular biologist at EIAR specializing in alternative genome editing technologies. She leads Ethiopia's national effort to improve teff, a staple crop, using TALENs technology. Her research focuses on developing lodging-resistant varieties that can increase yields by up to 30%. She has established Ethiopia's first dedicated genome editing laboratory.",
      email: "alemitu.b@eiar.gov.et", 
      phone: "+251 91 123 4567", 
      linkedin: "#", 
      twitter: "@alemitu_b",
      publications: 18,
      projects: 4,
      education: "PhD Molecular Biology - Addis Ababa University",
      awards: ["L'Oreal-UNESCO For Women in Science 2024", "EIAR Rising Star Award 2023"]
    },
    { 
      id: 7, 
      name: "Dr. Michael Okello", 
      title: "Bioinformatics Lead", 
      institution: "African Centre for Genome Editing", 
      country: "Uganda", 
      region: "East Africa", 
      sector: "Research", 
      expertise: ["Bioinformatics", "CRISPR-Cas9", "Computational Biology"], 
      bio: "Specialist in gRNA design, off-target prediction, and computational genomics for genome editing applications.",
      fullBio: "Dr. Michael Okello leads the bioinformatics division at the African Centre for Genome Editing. He has developed novel computational tools for guide RNA design and off-target prediction specifically optimized for African crops. His work enables researchers across the continent to design effective genome editing experiments with high precision and minimal off-target effects.",
      email: "m.okello@acge.ug", 
      phone: "+256 772 123456", 
      linkedin: "#", 
      twitter: "@mokello_bioinfo",
      publications: 14,
      projects: 9,
      education: "PhD Bioinformatics - University of Cambridge",
      awards: ["African Bioinformatics Award 2024", "ACGE Excellence Award 2023"]
    },
    { 
      id: 8, 
      name: "Ms. Tendai Moyo", 
      title: "Regulatory Officer", 
      institution: "National Biosafety Authority Zimbabwe", 
      country: "Zimbabwe", 
      region: "Southern Africa", 
      sector: "Regulatory", 
      expertise: ["Regulatory", "Risk Assessment"], 
      bio: "Biosafety regulator responsible for genome editing application reviews and confined field trial approvals.",
      fullBio: "Ms. Tendai Moyo is a senior regulatory officer at Zimbabwe's National Biosafety Authority. She is responsible for reviewing genome editing applications and overseeing confined field trials. She has played a key role in developing Zimbabwe's approach to regulating genome-edited products and has trained regulatory officials from several African countries.",
      email: "t.moyo@nba.gov.zw", 
      phone: "+263 712 123456", 
      linkedin: "#", 
      twitter: "@tendaimoyo",
      publications: 6,
      projects: 12,
      education: "MSc Biosafety - University of Zimbabwe",
      awards: ["NBA Outstanding Officer 2024", "Biosafety Leadership Award 2023"]
    },
    { 
      id: 9, 
      name: "Dr. Ibrahim Sow", 
      title: "Gene Therapy Researcher", 
      institution: "Institut Pasteur de Dakar", 
      country: "Senegal", 
      region: "West Africa", 
      sector: "Research", 
      expertise: ["Gene Therapy", "CRISPR-Cas9", "Infectious Diseases"], 
      bio: "Research on CRISPR-based approaches for malaria vector control and infectious disease resistance.",
      fullBio: "Dr. Ibrahim Sow leads the gene therapy research group at Institut Pasteur de Dakar. His innovative work on using CRISPR-Cas9 for malaria vector control has attracted international attention. He is also investigating gene editing approaches for developing resistance to emerging infectious diseases in West Africa.",
      email: "i.sow@pasteur.sn", 
      phone: "+221 33 123 4567", 
      linkedin: "#", 
      twitter: "@ibrahimsow",
      publications: 25,
      projects: 6,
      education: "PhD Molecular Biology - University of Paris",
      awards: ["Pasteur Institute Innovation Award 2024", "African Research Excellence Award 2023"]
    },
    { 
      id: 10, 
      name: "Prof. Naledi Modise", 
      title: "Head of Biotechnology", 
      institution: "Agricultural Research Council", 
      country: "South Africa", 
      region: "Southern Africa", 
      sector: "Research", 
      expertise: ["CRISPR-Cas9", "Crop Improvement", "Commercialization"], 
      bio: "Leading research on gene-edited sorghum for drought tolerance. First commercial release of gene-edited crop in Africa.",
      fullBio: "Professor Naledi Modise heads the Biotechnology division at the Agricultural Research Council of South Africa. She led the team that achieved the first commercial release of a gene-edited crop in Africa - drought-tolerant sorghum. Her work has paved the way for commercialization of genome-edited crops across the continent and she advises several African governments on regulatory frameworks.",
      email: "naledi@arc.agric.za", 
      phone: "+27 12 123 4567", 
      linkedin: "#", 
      twitter: "@profnaledi",
      publications: 35,
      projects: 10,
      education: "PhD Plant Biotechnology - Stellenbosch University",
      awards: ["ARC Lifetime Achievement Award 2024", "Women in Agriculture Award 2023"]
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setExperts(expertsData);
      setFilteredExperts(expertsData);
      setLoading(false);
    }, 500);
  }, []);

  const applyFilters = useCallback(() => {
    let results = [...experts];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(e => 
        e.name.toLowerCase().includes(term) ||
        e.title.toLowerCase().includes(term) ||
        e.institution.toLowerCase().includes(term) ||
        e.bio.toLowerCase().includes(term) ||
        e.expertise.some(exp => exp.toLowerCase().includes(term))
      );
    }

    // Filter by expertise
    if (filters.expertise.length) {
      results = results.filter(e => 
        e.expertise.some(exp => filters.expertise.includes(exp))
      );
    }

    // Filter by region
    if (filters.region.length) {
      results = results.filter(e => filters.region.includes(e.region));
    }

    // Filter by sector
    if (filters.sector.length) {
      results = results.filter(e => filters.sector.includes(e.sector));
    }

    setFilteredExperts(results);
  }, [experts, searchTerm, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleFilterChange = (category, value) => {
    setFilters(prev => {
      const current = prev[category];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const clearFilters = () => {
    setFilters({
      expertise: [],
      region: [],
      sector: []
    });
    setSearchTerm('');
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  const filterOptions = {
    expertise: ["CRISPR-Cas9", "TALENs", "Regulatory", "Policy", "Crop Improvement", "Gene Therapy", "Bioinformatics", "Risk Assessment"],
    region: ["East Africa", "West Africa", "Southern Africa", "North Africa", "Central Africa"],
    sector: ["Research", "Regulatory", "Policy", "Private", "Academia"]
  };

  const stats = {
    total: experts.length,
    countries: [...new Set(experts.map(e => e.country))].length,
    institutions: [...new Set(experts.map(e => e.institution))].length,
    regulatory: experts.filter(e => e.sector === "Regulatory").length
  };

  return (
    <div className="experts-page">
      {/* Header */}
      <header className="experts-header">
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
                <p>AUDA-NEPAD · Expert Network</p>
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
      <div className="experts-hero">
        <div className="container">
          <div className="hero-badge">
            <i className="fas fa-users"></i> NETWORK DIRECTORY
          </div>
          <h1>Expert Directory & Network</h1>
          <p>Connect with leading genome editing researchers, regulators, and policymakers across Africa.</p>
        </div>
      </div>

      <div className="container">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Registered Experts</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.countries}</div>
            <div className="stat-label">Countries Represented</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.institutions}</div>
            <div className="stat-label">Research Institutions</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.regulatory}</div>
            <div className="stat-label">Regulatory Experts</div>
          </div>
        </div>

        {/* Main Layout */}
        <div className="directory-layout">
          {/* Sidebar Filters */}
          <aside className="filters-sidebar">
            <div className="filter-header">
              <h3><i className="fas fa-filter"></i> Filter Experts</h3>
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear all
              </button>
            </div>

            <div className="filter-group">
              <label className="filter-label">🔬 Area of Expertise</label>
              <div className="filter-options">
                {filterOptions.expertise.map(exp => (
                  <label key={exp}>
                    <input 
                      type="checkbox" 
                      value={exp}
                      checked={filters.expertise.includes(exp)}
                      onChange={() => handleFilterChange('expertise', exp)}
                    />
                    <span>{exp}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label className="filter-label">📍 Region</label>
              <div className="filter-options">
                {filterOptions.region.map(region => (
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

            <div className="filter-group">
              <label className="filter-label">🏛️ Sector</label>
              <div className="filter-options">
                {filterOptions.sector.map(sector => (
                  <label key={sector}>
                    <input 
                      type="checkbox" 
                      value={sector}
                      checked={filters.sector.includes(sector)}
                      onChange={() => handleFilterChange('sector', sector)}
                    />
                    <span>{sector}</span>
                  </label>
                ))}
              </div>
            </div>

            <button className="apply-filters" onClick={applyFilters}>
              <i className="fas fa-search"></i> Apply Filters
            </button>
          </aside>

          {/* Results Area */}
          <main className="results-main">
            <div className="results-header">
              <div className="results-count">
                <i className="fas fa-user-friends"></i> 
                <span>{filteredExperts.length}</span> experts found
              </div>
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input 
                  type="text" 
                  placeholder="Search by name, institution, expertise..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="clear-search" onClick={() => setSearchTerm('')}>
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading experts...</p>
              </div>
            ) : (
              <>
                <div className="expert-grid">
                  {filteredExperts.map(expert => (
                    <div 
                      key={expert.id} 
                      className="expert-card"
                      onClick={() => setSelectedExpert(expert)}
                    >
                      <div className="expert-header">
                        <div className="expert-avatar">
                          {getInitials(expert.name)}
                        </div>
                        <div className="expert-info">
                          <h3>{expert.name}</h3>
                          <div className="expert-title">{expert.title}</div>
                          <div className="expert-location">
                            <i className="fas fa-map-marker-alt"></i> {expert.country} ({expert.region})
                          </div>
                        </div>
                      </div>
                      <div className="expert-expertise">
                        {expert.expertise.slice(0, 3).map((exp, idx) => (
                          <span key={idx} className="expertise-tag">{exp}</span>
                        ))}
                        {expert.expertise.length > 3 && (
                          <span className="expertise-tag">+{expert.expertise.length - 3}</span>
                        )}
                      </div>
                      <div className="expert-bio">
                        {expert.bio.substring(0, 120)}...
                      </div>
                      <div className="expert-contact">
                        <button className="contact-btn">
                          <i className="fas fa-user-circle"></i> View Profile
                        </button>
                        <button 
                          className="contact-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `mailto:${expert.email}`;
                          }}
                        >
                          <i className="fas fa-envelope"></i> Contact
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredExperts.length === 0 && (
                  <div className="no-results">
                    <i className="fas fa-users"></i>
                    <h3>No experts found</h3>
                    <p>Try adjusting your filters or search terms.</p>
                    <button onClick={clearFilters} className="clear-filters-btn">
                      Clear all filters
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Expert Detail Modal */}
      {selectedExpert && (
        <div className="modal-overlay" onClick={() => setSelectedExpert(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedExpert.name}</h2>
              <button className="close-modal" onClick={() => setSelectedExpert(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-expert-header">
                <div className="modal-avatar">
                  {getInitials(selectedExpert.name)}
                </div>
                <div className="modal-expert-info">
                  <h3>{selectedExpert.title}</h3>
                  <p><i className="fas fa-building"></i> {selectedExpert.institution}</p>
                  <p><i className="fas fa-map-marker-alt"></i> {selectedExpert.country} ({selectedExpert.region})</p>
                  <span className="sector-badge">{selectedExpert.sector}</span>
                </div>
              </div>

              <div className="modal-section">
                <h4><i className="fas fa-user-circle"></i> Biography</h4>
                <p>{selectedExpert.fullBio || selectedExpert.bio}</p>
              </div>

              <div className="modal-section">
                <h4><i className="fas fa-tags"></i> Areas of Expertise</h4>
                <div className="expert-expertise">
                  {selectedExpert.expertise.map((exp, idx) => (
                    <span key={idx} className="expertise-tag">{exp}</span>
                  ))}
                </div>
              </div>

              <div className="modal-stats">
                <div className="modal-stat">
                  <div className="stat-value">{selectedExpert.publications}</div>
                  <div className="stat-label">Publications</div>
                </div>
                <div className="modal-stat">
                  <div className="stat-value">{selectedExpert.projects}</div>
                  <div className="stat-label">Active Projects</div>
                </div>
              </div>

              <div className="modal-section">
                <h4><i className="fas fa-graduation-cap"></i> Education</h4>
                <p>{selectedExpert.education}</p>
              </div>

              {selectedExpert.awards && (
                <div className="modal-section">
                  <h4><i className="fas fa-trophy"></i> Awards & Recognition</h4>
                  <ul className="awards-list">
                    {selectedExpert.awards.map((award, idx) => (
                      <li key={idx}><i className="fas fa-award"></i> {award}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="modal-contact-section">
                <h4><i className="fas fa-address-card"></i> Contact Information</h4>
                <p><i className="fas fa-envelope"></i> <a href={`mailto:${selectedExpert.email}`}>{selectedExpert.email}</a></p>
                <p><i className="fas fa-phone"></i> {selectedExpert.phone}</p>
                <div className="social-links">
                  {selectedExpert.linkedin && (
                    <a href={selectedExpert.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                      <i className="fab fa-linkedin"></i> LinkedIn
                    </a>
                  )}
                  {selectedExpert.twitter && (
                    <a href={`https://twitter.com/${selectedExpert.twitter}`} target="_blank" rel="noopener noreferrer" className="social-link">
                      <i className="fab fa-twitter"></i> Twitter
                    </a>
                  )}
                  <button 
                    className="contact-btn-primary"
                    onClick={() => window.location.href = `mailto:${selectedExpert.email}?subject=AUDA-NEPAD Genome Editing Network Inquiry`}
                  >
                    <i className="fas fa-envelope"></i> Send Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="experts-footer">
        <div className="container">
          <div className="footer-content">
            <p>© 2026 AUDA-NEPAD Genome Editing Programme — Connect, collaborate, advance African science.</p>
            <button onClick={onBackClick} className="footer-back-btn">
              <i className="fas fa-home"></i> Back to Home
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ExpertsPage;