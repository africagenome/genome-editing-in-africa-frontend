import React, { useState, useEffect } from 'react';
import './InfrastructurePage.css';

const InfrastructurePage = ({ onBackClick }) => {
  const [facilities, setFacilities] = useState([]);
  const [equipmentCategories, setEquipmentCategories] = useState([]);
  const [trainingCenters, setTrainingCenters] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Facilities Data
  const facilitiesData = [
    { 
      id: 1, 
      name: "KALRO Biotechnology Laboratory", 
      country: "Kenya", 
      city: "Nairobi", 
      region: "East Africa",
      status: "Operational", 
      statusClass: "status-operational", 
      description: "National agricultural research laboratory equipped for CRISPR-Cas9 applications in maize, cassava, and sorghum improvement. Features BSL-2+ containment and tissue culture facilities.", 
      fullDescription: "The KALRO Biotechnology Laboratory is Kenya's premier agricultural biotechnology research facility. Established with support from AUDA-NEPAD and international partners, this state-of-the-art laboratory specializes in CRISPR-Cas9 genome editing for staple crops. The facility features BSL-2+ containment, tissue culture suites, and advanced molecular biology equipment. It serves as a regional training hub for East African scientists.",
      equipment: ["CRISPR-Cas9 Workstation", "qPCR System", "Gene Gun", "Microinjector", "Growth Chambers", "Next-Generation Sequencer"], 
      focus: ["Maize", "Cassava", "Drought Tolerance", "Pest Resistance"],
      established: 2018,
      capacity: "50 researchers",
      funding: "$3.2M",
      collaborations: ["CIMMYT", "IITA", "University of Nairobi"]
    },
    { 
      id: 2, 
      name: "IITA Bioscience Platform", 
      country: "Nigeria", 
      city: "Ibadan", 
      region: "West Africa",
      status: "Operational", 
      statusClass: "status-operational", 
      description: "Advanced molecular biology laboratory supporting genome editing research for cassava, yam, and cowpea. Core facility for West African research network.", 
      fullDescription: "The IITA Bioscience Platform is a cutting-edge research facility serving West Africa's agricultural biotechnology community. The laboratory specializes in developing CRISPR-edited crops with enhanced disease resistance and nutritional profiles. It houses a CRISPR library, high-throughput sequencing platform, and protoplast transfection systems.",
      equipment: ["CRISPR Library", "Sequencing Platform", "Protoplast Transfection System", "Confocal Microscope", "High-Performance Computing"], 
      focus: ["Cassava", "Yam", "Viral Resistance", "Biofortification"],
      established: 2015,
      capacity: "75 researchers",
      funding: "$5.1M",
      collaborations: ["CGIAR", "Cornell University", "NABDA"]
    },
    { 
      id: 3, 
      name: "ARC Biotechnology Platform", 
      country: "South Africa", 
      city: "Pretoria", 
      region: "Southern Africa",
      status: "Operational", 
      statusClass: "status-operational", 
      description: "National reference laboratory for genome editing in agriculture. Houses specialized equipment for SDN-1, SDN-2, and SDN-3 applications.", 
      fullDescription: "The Agricultural Research Council's Biotechnology Platform is South Africa's national reference laboratory for agricultural genome editing. The facility has pioneered the commercial release of gene-edited sorghum in Africa. It features specialized equipment for SDN-1, SDN-2, and SDN-3 applications, including robotic CRISPR-Cas9 systems and high-throughput phenotyping platforms.",
      equipment: ["RainDrop Digital PCR", "CRISPR-Cas9 Robotic System", "Phenotyping Platform", "High-throughput Sequencing", "Greenhouse Complex"], 
      focus: ["Sorghum", "Maize", "Commercial Release", "Drought Tolerance"],
      established: 2010,
      capacity: "100 researchers",
      funding: "$8.5M",
      collaborations: ["Seed Co", "DALRRD", "Stellenbosch University"]
    },
    { 
      id: 4, 
      name: "CSIR-SARI Genome Editing Lab", 
      country: "Ghana", 
      city: "Tamale", 
      region: "West Africa",
      status: "Operational", 
      statusClass: "status-operational", 
      description: "Specialized laboratory for cowpea and maize genome editing focusing on pest and disease resistance.", 
      fullDescription: "The CSIR-Savanna Agricultural Research Institute's Genome Editing Laboratory focuses on developing pest and disease-resistant varieties of cowpea and maize. The facility has successfully conducted confined field trials for pod borer-resistant cowpea and is expanding its research to other staple crops.",
      equipment: ["CRISPR-Cas9 System", "Electroporator", "Real-time PCR", "Plant Growth Facilities", "Insectary"], 
      focus: ["Cowpea", "Maize", "Pest Resistance", "Pod Borer"],
      established: 2019,
      capacity: "30 researchers",
      funding: "$2.1M",
      collaborations: ["AATF", "University of Ghana", "AGRA"]
    },
    { 
      id: 5, 
      name: "EIAR Molecular Biology Center", 
      country: "Ethiopia", 
      city: "Addis Ababa", 
      region: "East Africa",
      status: "Developing", 
      statusClass: "status-developing", 
      description: "Emerging center for TALENs and CRISPR research on teff and other indigenous crops. Equipment installation phase.", 
      fullDescription: "The Ethiopian Institute of Agricultural Research's Molecular Biology Center is an emerging facility focused on improving indigenous crops using TALENs and CRISPR technologies. Currently in the equipment installation phase, the center will specialize in teff improvement for lodging resistance and drought tolerance.",
      equipment: ["TALENs Toolkit", "Basic PCR", "Gel Documentation", "Growth Chamber", "Microscopy Suite"], 
      focus: ["Teff", "Drought Tolerance", "Indigenous Crops", "Lodging Resistance"],
      established: 2021,
      capacity: "20 researchers",
      funding: "$1.5M",
      collaborations: ["Addis Ababa University", "EIAR", "JIRCAS"]
    },
    { 
      id: 6, 
      name: "KEMRI-Wellcome Trust Research Programme", 
      country: "Kenya", 
      city: "Kilifi", 
      region: "East Africa",
      status: "Operational", 
      statusClass: "status-operational", 
      description: "Biomedical research facility conducting CRISPR-based gene therapy research for sickle cell disease and infectious diseases.", 
      fullDescription: "The KEMRI-Wellcome Trust Research Programme is a leading biomedical research facility in East Africa. The laboratory conducts cutting-edge CRISPR-based gene therapy research for sickle cell disease, HIV, and other infectious diseases. It features BSL-3 containment and single-cell sequencing capabilities.",
      equipment: ["CRISPR-Cas9 Gene Editing Platform", "Flow Cytometer", "Single-cell Sequencer", "BSL-3 Suite", "Cryopreservation"], 
      focus: ["Gene Therapy", "Sickle Cell", "HIV", "Infectious Diseases"],
      established: 1989,
      capacity: "150 researchers",
      funding: "$12.5M",
      collaborations: ["University of Oxford", "NIH", "Wellcome Trust"]
    },
    { 
      id: 7, 
      name: "RABI Genome Editing Core Facility", 
      country: "Nigeria", 
      city: "Kano", 
      region: "West Africa",
      status: "Planned", 
      statusClass: "status-planned", 
      description: "Planned regional center of excellence for genome editing research in West Africa. Construction phase.", 
      fullDescription: "The Regional Agricultural Biotechnology Institute's Genome Editing Core Facility is a planned center of excellence for West Africa. Once completed, it will serve as a regional hub for genome editing research, training, and technology transfer, with a focus on staple crops and capacity building.",
      equipment: ["CRISPR Workstation", "Sequencing Core", "Bioinformatics Server", "Training Lab", "Greenhouse"], 
      focus: ["Capacity Building", "Regional Hub", "Training", "Technology Transfer"],
      established: 2024,
      capacity: "40 researchers",
      funding: "$4.0M",
      collaborations: ["AUDA-NEPAD", "World Bank", "FAO"]
    }
  ];

  // Equipment Categories Data
  const equipmentData = [
    { 
      name: "CRISPR & Genome Editing Systems", 
      icon: "fas fa-dna",
      items: [
        { name: "CRISPR-Cas9 Workstations", count: 22 },
        { name: "TALENs Kits", count: 15 },
        { name: "Electroporators", count: 18 },
        { name: "Microinjectors", count: 12 },
        { name: "Gene Guns", count: 8 },
        { name: "CRISPR Library Systems", count: 10 }
      ] 
    },
    { 
      name: "Molecular Analysis & Detection", 
      icon: "fas fa-chart-line",
      items: [
        { name: "Real-time PCR Systems", count: 45 },
        { name: "Digital PCR", count: 12 },
        { name: "Sequencing Platforms", count: 20 },
        { name: "Gel Documentation", count: 38 },
        { name: "Spectrophotometers", count: 52 },
        { name: "NanoDrop Systems", count: 30 }
      ] 
    },
    { 
      name: "Microscopy & Imaging", 
      icon: "fas fa-microscope",
      items: [
        { name: "Confocal Microscopes", count: 10 },
        { name: "Fluorescence Microscopes", count: 25 },
        { name: "Electron Microscopes", count: 5 },
        { name: "High-content Imagers", count: 8 },
        { name: "Live-cell Imaging", count: 12 }
      ] 
    },
    { 
      name: "Sample Preparation & Culture", 
      icon: "fas fa-vial",
      items: [
        { name: "Biosafety Cabinets", count: 120 },
        { name: "CO2 Incubators", count: 95 },
        { name: "Centrifuges", count: 150 },
        { name: "Cryostorage Systems", count: 35 },
        { name: "Tissue Culture Hoods", count: 42 },
        { name: "Autoclaves", count: 28 }
      ] 
    },
    { 
      name: "Phenotyping & Growth Facilities", 
      icon: "fas fa-seedling",
      items: [
        { name: "Controlled Growth Chambers", count: 65 },
        { name: "Greenhouses", count: 28 },
        { name: "Phenotyping Platforms", count: 15 },
        { name: "Hydroponic Systems", count: 20 },
        { name: "Field Trial Stations", count: 45 }
      ] 
    },
    { 
      name: "Bioinformatics & Computing", 
      icon: "fas fa-server",
      items: [
        { name: "High-performance Clusters", count: 8 },
        { name: "Genome Assembly Servers", count: 12 },
        { name: "Data Storage Systems", count: 25 },
        { name: "Bioinformatics Workstations", count: 40 },
        { name: "Cloud Computing Platforms", count: 5 }
      ] 
    }
  ];

  // Training Centers Data
  const trainingData = [
    { 
      id: 1,
      name: "AUDA-NEPAD ABNE Training Hub", 
      country: "Kenya", 
      city: "Nairobi",
      region: "East Africa",
      focus: "Regulatory training, risk assessment, biosafety", 
      programs: ["GEd Regulators Course", "Risk Assessment Workshop", "Policy Development", "Stakeholder Engagement"],
      capacity: "500+ trainees annually",
      established: 2015,
      description: "The African Biosafety Network of Expertise Training Hub provides comprehensive regulatory training for biosafety professionals across Africa."
    },
    { 
      id: 2,
      name: "African Centre for Gene Technologies", 
      country: "South Africa", 
      city: "Pretoria",
      region: "Southern Africa",
      focus: "CRISPR techniques, bioinformatics, molecular biology", 
      programs: ["CRISPR Bootcamp", "Bioinformatics for GEd", "Advanced Molecular Biology", "Gene Editing Design"],
      capacity: "300+ trainees annually",
      established: 2012,
      description: "A leading center for advanced training in genome editing technologies and bioinformatics applications."
    },
    { 
      id: 3,
      name: "WACCI - University of Ghana", 
      country: "Ghana", 
      city: "Accra",
      region: "West Africa",
      focus: "Plant genome editing, crop improvement", 
      programs: ["Plant CRISPR Workshop", "Gene Editing for Breeders", "Molecular Markers", "Tissue Culture"],
      capacity: "200+ trainees annually",
      established: 2010,
      description: "West Africa's premier center for plant breeding and genome editing training."
    },
    { 
      id: 4,
      name: "Pan-African Bioinformatics Institute", 
      country: "Kenya", 
      city: "Nairobi",
      region: "East Africa",
      focus: "Computational genomics, gRNA design, data science", 
      programs: ["CRISPR Design & Analysis", "Genome Assembly", "Data Science for Biologists", "Machine Learning in Genomics"],
      capacity: "400+ trainees annually",
      established: 2018,
      description: "Specialized institute for bioinformatics training with focus on genome editing applications."
    },
    { 
      id: 5,
      name: "RABI Genome Editing Academy", 
      country: "Nigeria", 
      city: "Kano",
      region: "West Africa",
      focus: "Cassava improvement, molecular breeding", 
      programs: ["Cassava CRISPR Workshop", "Gene Editing Fundamentals", "Lab Techniques", "Field Trial Management"],
      capacity: "150+ trainees annually",
      established: 2020,
      description: "Specialized training center focused on applying genome editing to cassava improvement."
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setFacilities(facilitiesData);
      setEquipmentCategories(equipmentData);
      setTrainingCenters(trainingData);
      setLoading(false);
    }, 500);
  }, []);

  const getFilteredFacilities = () => {
    if (filter === 'all') return facilities;
    return facilities.filter(f => f.status.toLowerCase() === filter.toLowerCase());
  };

  const stats = {
    laboratories: facilities.length,
    bsl2: facilities.filter(f => f.status === "Operational").length,
    crisprLabs: facilities.filter(f => f.focus.some(focus => focus.includes("CRISPR"))).length,
    trainingCenters: trainingData.length
  };

  return (
    <div className="infrastructure-page">
      {/* Header */}
      <header className="infra-header">
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
                <p>AUDA-NEPAD · Infrastructure Hub</p>
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
      <div className="infra-hero">
        <div className="container">
          <div className="hero-badge">
            <i className="fas fa-microscope"></i> LABORATORY NETWORK
          </div>
          <h1>Infrastructure & Equipment</h1>
          <p>State-of-the-art facilities, core equipment, and capacity-building centers supporting genome editing research across Africa.</p>
        </div>
      </div>

      <div className="container">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{stats.laboratories}+</div>
            <div className="stat-label">Research Laboratories</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.bsl2}+</div>
            <div className="stat-label">BSL-2+ Facilities</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.crisprLabs}</div>
            <div className="stat-label">CRISPR Core Labs</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.trainingCenters}</div>
            <div className="stat-label">Training Centers</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar-infra">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Facilities
            </button>
            <button 
              className={`filter-tab ${filter === 'operational' ? 'active' : ''}`}
              onClick={() => setFilter('operational')}
            >
              <i className="fas fa-check-circle"></i> Operational
            </button>
            <button 
              className={`filter-tab ${filter === 'developing' ? 'active' : ''}`}
              onClick={() => setFilter('developing')}
            >
              <i className="fas fa-chart-line"></i> Developing
            </button>
            <button 
              className={`filter-tab ${filter === 'planned' ? 'active' : ''}`}
              onClick={() => setFilter('planned')}
            >
              <i className="fas fa-clock"></i> Planned
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading infrastructure data...</p>
          </div>
        ) : (
          <>
            {/* Core Facilities Section */}
            <div className="section-title">
              <h2><i className="fas fa-flask"></i> Core Research Facilities</h2>
              <div className="accent"></div>
            </div>
            <div className="cards-grid">
              {getFilteredFacilities().map(facility => (
                <div 
                  key={facility.id} 
                  className="facility-card"
                  onClick={() => setSelectedFacility(facility)}
                >
                  <div className="card-icon">
                    <i className="fas fa-flask"></i>
                  </div>
                  <h3>{facility.name}</h3>
                  <div className="facility-location">
                    <i className="fas fa-map-marker-alt"></i> {facility.city}, {facility.country}
                  </div>
                  <span className={`facility-status ${facility.statusClass}`}>
                    {facility.status}
                  </span>
                  <div className="facility-desc">
                    {facility.description.substring(0, 100)}...
                  </div>
                  <div className="equipment-list">
                    {facility.equipment.slice(0, 3).map((eq, idx) => (
                      <span key={idx} className="equipment-tag">{eq}</span>
                    ))}
                    {facility.equipment.length > 3 && (
                      <span className="equipment-tag">+{facility.equipment.length - 3} more</span>
                    )}
                  </div>
                  <div className="card-footer">
                    <span className="view-details">View Details <i className="fas fa-arrow-right"></i></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Equipment Section */}
            <div className="section-title">
              <h2><i className="fas fa-microchip"></i> Equipment Inventory by Category</h2>
              <div className="accent"></div>
            </div>
            <div className="equipment-grid">
              {equipmentCategories.map((category, idx) => (
                <div key={idx} className="equipment-category">
                  <h4><i className={category.icon}></i> {category.name}</h4>
                  <ul>
                    {category.items.map((item, itemIdx) => (
                      <li key={itemIdx}>
                        <span className="equipment-name">{item.name}</span>
                        <span className="equipment-count">{item.count} units</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Training Centers Section */}
            <div className="section-title">
              <h2><i className="fas fa-chalkboard-user"></i> Training & Capacity Building Centers</h2>
              <div className="accent"></div>
            </div>
            <div className="training-grid">
              {trainingCenters.map(center => (
                <div key={center.id} className="training-card">
                  <div className="training-icon">
                    <i className="fas fa-graduation-cap"></i>
                  </div>
                  <h4>{center.name}</h4>
                  <div className="facility-location">
                    <i className="fas fa-map-marker-alt"></i> {center.city}, {center.country}
                  </div>
                  <div className="training-focus">
                    <strong>Focus:</strong> {center.focus}
                  </div>
                  <div className="training-programs">
                    {center.programs.map((program, idx) => (
                      <span key={idx} className="program-tag">{program}</span>
                    ))}
                  </div>
                  <div className="training-stats">
                    <span><i className="fas fa-users"></i> {center.capacity}</span>
                    <span><i className="fas fa-calendar-alt"></i> Est. {center.established}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Facility Detail Modal */}
      {selectedFacility && (
        <div className="modal-overlay" onClick={() => setSelectedFacility(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedFacility.name}</h2>
              <button className="close-modal" onClick={() => setSelectedFacility(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-status">
                <span className={`facility-status ${selectedFacility.statusClass}`}>
                  {selectedFacility.status}
                </span>
              </div>
              
              <div className="modal-location">
                <i className="fas fa-map-marker-alt"></i> {selectedFacility.city}, {selectedFacility.country} ({selectedFacility.region})
              </div>

              <div className="modal-section">
                <h4><i className="fas fa-info-circle"></i> Overview</h4>
                <p>{selectedFacility.fullDescription || selectedFacility.description}</p>
              </div>

              <div className="modal-stats">
                <div className="modal-stat">
                  <div className="stat-value">{selectedFacility.established}</div>
                  <div className="stat-label">Established</div>
                </div>
                <div className="modal-stat">
                  <div className="stat-value">{selectedFacility.capacity}</div>
                  <div className="stat-label">Research Capacity</div>
                </div>
                <div className="modal-stat">
                  <div className="stat-value">{selectedFacility.funding}</div>
                  <div className="stat-label">Total Funding</div>
                </div>
              </div>

              <div className="modal-section">
                <h4><i className="fas fa-microscope"></i> Key Equipment</h4>
                <div className="equipment-list">
                  {selectedFacility.equipment.map((eq, idx) => (
                    <span key={idx} className="equipment-tag">{eq}</span>
                  ))}
                </div>
              </div>

              <div className="modal-section">
                <h4><i className="fas fa-bullseye"></i> Research Focus</h4>
                <div className="equipment-list">
                  {selectedFacility.focus.map((f, idx) => (
                    <span key={idx} className="focus-tag">{f}</span>
                  ))}
                </div>
              </div>

              <div className="modal-section">
                <h4><i className="fas fa-handshake"></i> Collaborations</h4>
                <div className="collaborations-list">
                  {selectedFacility.collaborations.map((collab, idx) => (
                    <span key={idx} className="collab-tag">{collab}</span>
                  ))}
                </div>
              </div>

              <div className="modal-contact">
                <i className="fas fa-info-circle"></i>
                <p>Access available through collaborative research agreements. Contact AUDA-NEPAD for partnership opportunities.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="infra-footer">
        <div className="container">
          <div className="footer-content">
            <p>© 2026 AUDA-NEPAD Genome Editing Programme — Building world-class infrastructure for African science.</p>
            <button onClick={onBackClick} className="footer-back-btn">
              <i className="fas fa-home"></i> Back to Home
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default InfrastructurePage;