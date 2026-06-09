import React, { useState, useEffect, useCallback } from 'react';
import './StakeholdersPage.css';

const StakeholdersPage = ({ onBackClick }) => {
  const [stakeholders, setStakeholders] = useState([]);
  const [filteredStakeholders, setFilteredStakeholders] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStakeholder, setSelectedStakeholder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Stakeholders Dataset
  const stakeholdersData = [
    // Regulatory Bodies
    { 
      id: 1, 
      name: "National Biosafety Authority (Kenya)", 
      category: "Regulatory", 
      country: "Kenya", 
      region: "East Africa", 
      description: "Kenya's statutory body responsible for biosafety regulation, including genome editing oversight and confined field trial approvals. The NBA works to ensure safe development and application of modern biotechnology.", 
      fullDescription: "The National Biosafety Authority (NBA) is Kenya's statutory body established under the Biosafety Act of 2009. It is responsible for regulating the safe transfer, handling, and use of genetically modified organisms (GMOs) and emerging biotechnologies including genome editing. The NBA has approved multiple confined field trials for gene-edited crops and is developing guidelines for genome-edited products.",
      tags: ["biosafety", "regulation", "CFT approval", "policy development"], 
      contact: "nba@biosafetykenya.go.ke", 
      website: "www.biosafetykenya.go.ke", 
      icon: "fa-gavel",
      founded: 2009,
      stakeholders: 45,
      projects: 12
    },
    { 
      id: 2, 
      name: "National Biosafety Management Agency (Nigeria)", 
      category: "Regulatory", 
      country: "Nigeria", 
      region: "West Africa", 
      description: "Nigeria's regulatory authority for biosafety, currently drafting genome editing-specific guidelines and overseeing biotechnology applications.", 
      fullDescription: "The National Biosafety Management Agency (NBMA) is Nigeria's apex regulatory authority for biosafety. The agency is responsible for providing regulatory framework to ensure safe application of modern biotechnology including genome editing. Currently, NBMA is in the process of drafting specific guidelines for genome-edited products and conducting stakeholder consultations.",
      tags: ["biosafety", "guidelines", "policy", "regulation"], 
      contact: "info@nbma.gov.ng", 
      website: "www.nbma.gov.ng", 
      icon: "fa-gavel",
      founded: 2015,
      stakeholders: 30,
      projects: 8
    },
    { 
      id: 3, 
      name: "Department of Agriculture (South Africa)", 
      category: "Regulatory", 
      country: "South Africa", 
      region: "Southern Africa", 
      description: "Lead regulatory authority for genome edited products, implementing product-based regulatory triggers for GEd crops.", 
      fullDescription: "The Department of Agriculture, Land Reform and Rural Development (DALRRD) is South Africa's lead regulatory authority for agricultural biotechnology. South Africa has implemented a product-based regulatory trigger for genome-edited crops, distinguishing them from transgenic GMOs. This approach has enabled the first commercial release of gene-edited sorghum in Africa.",
      tags: ["regulation", "commercial release", "product-based", "policy"], 
      contact: "dalrrd@agric.gov.za", 
      website: "www.dalrrd.gov.za", 
      icon: "fa-leaf",
      founded: 1910,
      stakeholders: 60,
      projects: 15
    },
    { 
      id: 4, 
      name: "National Biosafety Authority (Ghana)", 
      category: "Regulatory", 
      country: "Ghana", 
      region: "West Africa", 
      description: "Developing genome editing-specific policies and conducting stakeholder consultations for responsible innovation.", 
      fullDescription: "Ghana's National Biosafety Authority (NBA) is responsible for biosafety regulation under the Biosafety Act 2011. The authority is actively developing genome editing-specific policies and conducting stakeholder consultations to ensure responsible innovation. Ghana has approved confined field trials for gene-edited cowpea and is advancing its regulatory framework.",
      tags: ["policy", "development", "consultation", "biosafety"], 
      contact: "info@nba.gov.gh", 
      website: "www.nba.gov.gh", 
      icon: "fa-gavel",
      founded: 2011,
      stakeholders: 25,
      projects: 6
    },
    
    // Research Institutions
    { 
      id: 5, 
      name: "Kenya Agricultural & Livestock Research Organization", 
      category: "Research", 
      country: "Kenya", 
      region: "East Africa", 
      description: "Leading agricultural research institution conducting CRISPR field trials for maize and cassava improvement.", 
      fullDescription: "KALRO is Kenya's premier agricultural research organization mandated to conduct research in crops, livestock, and related natural resources. The organization is leading CRISPR field trials for drought-tolerant maize, salt-tolerant rice, and disease-resistant cassava. KALRO collaborates with international partners to advance genome editing technologies for smallholder farmers.",
      tags: ["CRISPR", "maize", "cassava", "field trials", "research"], 
      contact: "info@kalro.org", 
      website: "www.kalro.org", 
      icon: "fa-flask",
      founded: 2013,
      stakeholders: 120,
      projects: 25
    },
    { 
      id: 6, 
      name: "International Institute of Tropical Agriculture", 
      category: "Research", 
      country: "Nigeria", 
      region: "West Africa", 
      description: "Developing CRISPR-edited cassava resistant to mosaic and brown streak diseases, benefiting millions of farmers.", 
      fullDescription: "IITA is a non-profit research-for-development organization focused on tropical agriculture. The institute is using CRISPR-Cas9 technology to develop cassava varieties resistant to cassava mosaic disease (CMD) and cassava brown streak disease (CBSD). These innovations aim to secure food security for over 800 million people who depend on cassava as a staple crop.",
      tags: ["cassava", "viral resistance", "CRISPR", "food security"], 
      contact: "iita@cgiar.org", 
      website: "www.iita.org", 
      icon: "fa-seedling",
      founded: 1967,
      stakeholders: 200,
      projects: 40
    },
    { 
      id: 7, 
      name: "Agricultural Research Council (South Africa)", 
      category: "Research", 
      country: "South Africa", 
      region: "Southern Africa", 
      description: "Conducting research on gene-edited sorghum, maize, and livestock improvement for African agriculture.", 
      fullDescription: "The ARC is South Africa's premier agricultural research institution. The council conducts cutting-edge research on gene-edited sorghum (first commercial release in Africa), nitrogen-efficient maize, and livestock genetics. ARC works closely with industry partners to translate research into commercial products for farmers.",
      tags: ["sorghum", "livestock", "genome editing", "commercialization"], 
      contact: "info@arc.agric.za", 
      website: "www.arc.agric.za", 
      icon: "fa-flask",
      founded: 1992,
      stakeholders: 85,
      projects: 18
    },
    { 
      id: 8, 
      name: "University of Nairobi - Biotechnology Department", 
      category: "Research", 
      country: "Kenya", 
      region: "East Africa", 
      description: "Academic research on CRISPR applications for crop improvement, human health, and capacity building.", 
      fullDescription: "The Department of Biotechnology at the University of Nairobi is a leading academic center for biotechnology research and training in East Africa. The department conducts research on CRISPR applications for crop improvement, gene therapy for sickle cell disease, and provides training for the next generation of genome editing scientists.",
      tags: ["academic", "CRISPR", "training", "gene therapy"], 
      contact: "dept-biotech@uonbi.ac.ke", 
      website: "www.uonbi.ac.ke", 
      icon: "fa-university",
      founded: 1970,
      stakeholders: 45,
      projects: 12
    },
    
    // International Partners
    { 
      id: 9, 
      name: "AUDA-NEPAD African Biosafety Network (ABNE)", 
      category: "International", 
      country: "Pan-African", 
      region: "Africa", 
      description: "Provides technical support to AU member states on biosafety and genome editing regulation and capacity building.", 
      fullDescription: "The African Biosafety Network of Expertise (ABNE) is an AUDA-NEPAD initiative that provides technical support to African Union member states on biosafety and genome editing regulation. ABNE helps countries develop science-based regulatory frameworks, build institutional capacity, and engage stakeholders in informed decision-making.",
      tags: ["technical support", "capacity building", "AU", "regulation"], 
      contact: "abne@nepad.org", 
      website: "www.nepad.org/abne", 
      icon: "fa-globe-africa",
      founded: 2010,
      stakeholders: 54,
      projects: 30
    },
    { 
      id: 10, 
      name: "African Agricultural Technology Foundation", 
      category: "International", 
      country: "Pan-African", 
      region: "Africa", 
      description: "Facilitates public-private partnerships for access to agricultural technologies including genome editing.", 
      fullDescription: "AATF is a not-for-profit organization that facilitates public-private partnerships for access to agricultural technologies. The foundation works to identify, access, develop, and deliver appropriate agricultural technologies including genome editing to smallholder farmers in Sub-Saharan Africa.",
      tags: ["PPP", "technology access", "agriculture", "partnership"], 
      contact: "aatf@aatf-africa.org", 
      website: "www.aatf-africa.org", 
      icon: "fa-handshake",
      founded: 2003,
      stakeholders: 100,
      projects: 25
    },
    { 
      id: 11, 
      name: "ISAAA AfriCenter", 
      category: "International", 
      country: "Kenya", 
      region: "East Africa", 
      description: "Knowledge sharing and capacity building on agricultural biotechnology and genome editing.", 
      fullDescription: "ISAAA AfriCenter is a knowledge-sharing hub that promotes understanding and adoption of agricultural biotechnology including genome editing. The center provides training, information resources, and stakeholder engagement to support evidence-based decision-making on emerging technologies.",
      tags: ["knowledge sharing", "training", "outreach", "awareness"], 
      contact: "africenter@isaaa.org", 
      website: "www.isaaa.org/africenter", 
      icon: "fa-book",
      founded: 2002,
      stakeholders: 35,
      projects: 15
    },
    
    // Civil Society
    { 
      id: 12, 
      name: "African Centre for Biodiversity (ACB)", 
      category: "CSO", 
      country: "South Africa", 
      region: "Southern Africa", 
      description: "Civil society organization engaging on biosafety and genome editing governance issues.", 
      fullDescription: "ACB is a civil society organization that advocates for food sovereignty, agroecology, and biosafety. The centre engages in policy analysis, advocacy, and stakeholder engagement on genome editing governance, ensuring that civil society voices are heard in regulatory discussions.",
      tags: ["advocacy", "biosafety", "civil society", "governance"], 
      contact: "info@acbio.org.za", 
      website: "www.acbio.org.za", 
      icon: "fa-balance-scale",
      founded: 2000,
      stakeholders: 20,
      projects: 8
    },
    
    // Private Sector
    { 
      id: 13, 
      name: "Seed Co Group", 
      category: "Private", 
      country: "Zimbabwe", 
      region: "Southern Africa", 
      description: "Seed company investing in gene-edited crop varieties for African farmers.", 
      fullDescription: "Seed Co Group is one of Africa's largest seed companies, investing in research and development of gene-edited crop varieties. The company is commercializing drought-tolerant and pest-resistant maize and sorghum varieties developed through genome editing.",
      tags: ["seed", "commercialization", "agriculture", "investment"], 
      contact: "info@seedcogroup.com", 
      website: "www.seedcogroup.com", 
      icon: "fa-building",
      founded: 1990,
      stakeholders: 50,
      projects: 10
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setStakeholders(stakeholdersData);
      setFilteredStakeholders(stakeholdersData);
      setLoading(false);
    }, 500);
  }, []);

  const filterStakeholders = useCallback(() => {
    let filtered = [...stakeholders];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term) ||
        s.country.toLowerCase().includes(term) ||
        s.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }
    
    setFilteredStakeholders(filtered);
  }, [stakeholders, selectedCategory, searchTerm]);

  useEffect(() => {
    filterStakeholders();
  }, [filterStakeholders]);

  const getCategoryClass = (category) => {
    const map = { 
      "Regulatory": "cat-regulatory", 
      "Research": "cat-research", 
      "International": "cat-international", 
      "CSO": "cat-cso", 
      "Private": "cat-private" 
    };
    return map[category] || "cat-regulatory";
  };

  const getCategoryIcon = (category) => {
    const map = {
      "Regulatory": "fa-gavel",
      "Research": "fa-flask",
      "International": "fa-globe-africa",
      "CSO": "fa-users",
      "Private": "fa-building"
    };
    return map[category] || "fa-handshake";
  };

  const stats = {
    total: stakeholders.length,
    countries: [...new Set(stakeholders.map(s => s.country))].length,
    international: stakeholders.filter(s => s.category === "International").length,
    regions: [...new Set(stakeholders.map(s => s.region))].length
  };

  return (
    <div className="stakeholders-page">
      {/* Header */}
      <header className="stakeholders-header">
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
                <p>AUDA-NEPAD · Partnerships & Networks</p>
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
      <div className="stakeholders-hero">
        <div className="container">
          <div className="hero-badge">
            <i className="fas fa-handshake"></i> COLLABORATION NETWORK
          </div>
          <h1>Stakeholders & Partners</h1>
          <p>Meet the institutions, organizations, and experts driving genome editing innovation and governance across Africa.</p>
        </div>
      </div>

      <div className="container">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.total}+</div>
            <div className="stat-label">Partner Institutions</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.countries}</div>
            <div className="stat-label">African Countries</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.international}</div>
            <div className="stat-label">International Partners</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.regions}</div>
            <div className="stat-label">Regional Networks</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Stakeholders
            </button>
            <button 
              className={`filter-tab ${selectedCategory === 'Regulatory' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('Regulatory')}
            >
              <i className="fas fa-gavel"></i> Regulatory Bodies
            </button>
            <button 
              className={`filter-tab ${selectedCategory === 'Research' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('Research')}
            >
              <i className="fas fa-flask"></i> Research Institutions
            </button>
            <button 
              className={`filter-tab ${selectedCategory === 'International' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('International')}
            >
              <i className="fas fa-globe"></i> International Partners
            </button>
            <button 
              className={`filter-tab ${selectedCategory === 'CSO' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('CSO')}
            >
              <i className="fas fa-users"></i> Civil Society
            </button>
            <button 
              className={`filter-tab ${selectedCategory === 'Private' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('Private')}
            >
              <i className="fas fa-building"></i> Private Sector
            </button>
          </div>
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search stakeholders..." 
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

        {/* Loading State */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading stakeholders...</p>
          </div>
        ) : (
          <>
            {/* Stakeholders Grid */}
            <div className="stakeholders-grid">
              {filteredStakeholders.map(stakeholder => (
                <div 
                  key={stakeholder.id} 
                  className="stakeholder-card"
                  onClick={() => setSelectedStakeholder(stakeholder)}
                >
                  <div className="stakeholder-header">
                    <div className="stakeholder-icon">
                      <i className={`fas ${stakeholder.icon || getCategoryIcon(stakeholder.category)}`}></i>
                    </div>
                    <div className="stakeholder-info">
                      <h3>{stakeholder.name}</h3>
                      <span className={`stakeholder-category ${getCategoryClass(stakeholder.category)}`}>
                        {stakeholder.category}
                      </span>
                    </div>
                  </div>
                  <div className="stakeholder-desc">
                    {stakeholder.description.substring(0, 120)}...
                  </div>
                  <div className="stakeholder-tags">
                    {stakeholder.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="tag">#{tag}</span>
                    ))}
                  </div>
                  <div className="stakeholder-contact">
                    <span><i className="fas fa-map-marker-alt"></i> {stakeholder.country}</span>
                    <span><i className="fas fa-envelope"></i> {stakeholder.contact}</span>
                  </div>
                  <div className="stakeholder-footer">
                    <span className="view-details">View Details <i className="fas fa-arrow-right"></i></span>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredStakeholders.length === 0 && (
              <div className="no-results">
                <i className="fas fa-users"></i>
                <h3>No stakeholders found</h3>
                <p>Try adjusting your search or filter criteria.</p>
                <button className="clear-filters-btn" onClick={() => {
                  setSelectedCategory('all');
                  setSearchTerm('');
                }}>
                  Clear all filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Stakeholder Detail Modal */}
      {selectedStakeholder && (
        <div className="modal-overlay" onClick={() => setSelectedStakeholder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedStakeholder.name}</h2>
              <button className="close-modal" onClick={() => setSelectedStakeholder(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-stakeholder-header">
                <div className="modal-icon">
                  <i className={`fas ${selectedStakeholder.icon || getCategoryIcon(selectedStakeholder.category)}`}></i>
                </div>
                <div className="modal-info">
                  <span className={`stakeholder-category ${getCategoryClass(selectedStakeholder.category)}`}>
                    {selectedStakeholder.category}
                  </span>
                  <p><i className="fas fa-map-marker-alt"></i> {selectedStakeholder.country} ({selectedStakeholder.region})</p>
                  <p><i className="fas fa-calendar-alt"></i> Founded: {selectedStakeholder.founded}</p>
                </div>
              </div>

              <div className="modal-section">
                <h4><i className="fas fa-info-circle"></i> Overview</h4>
                <p>{selectedStakeholder.fullDescription || selectedStakeholder.description}</p>
              </div>

              <div className="modal-section">
                <h4><i className="fas fa-tags"></i> Areas of Expertise</h4>
                <div className="stakeholder-tags">
                  {selectedStakeholder.tags.map((tag, idx) => (
                    <span key={idx} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>

              <div className="modal-stats">
                <div className="modal-stat">
                  <div className="stat-number">{selectedStakeholder.stakeholders}</div>
                  <div className="stat-label">Stakeholders Engaged</div>
                </div>
                <div className="modal-stat">
                  <div className="stat-number">{selectedStakeholder.projects}</div>
                  <div className="stat-label">Active Projects</div>
                </div>
              </div>

              <div className="modal-contact">
                <h4><i className="fas fa-address-card"></i> Contact Information</h4>
                <p><i className="fas fa-envelope"></i> <strong>Email:</strong> <a href={`mailto:${selectedStakeholder.contact}`}>{selectedStakeholder.contact}</a></p>
                <p><i className="fas fa-globe"></i> <strong>Website:</strong> <a href={`https://${selectedStakeholder.website}`} target="_blank" rel="noopener noreferrer">{selectedStakeholder.website}</a></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="stakeholders-footer">
        <div className="container">
          <div className="footer-content">
            <p>© 2026 AUDA-NEPAD Genome Editing Programme — Building partnerships for responsible innovation in Africa.</p>
            <button onClick={onBackClick} className="footer-back-btn">
              <i className="fas fa-home"></i> Back to Home
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StakeholdersPage;