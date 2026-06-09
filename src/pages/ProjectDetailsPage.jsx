import React, { useState, useEffect } from 'react';
import './ProjectDetailsPage.css';

const ProjectDetailsPage = ({ projectId, onBackClick }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProjects, setRelatedProjects] = useState([]);

  // Complete projects dataset
  const projectsData = {
    1: {
      id: 1,
      title: "Drought-Tolerant Maize using CRISPR-Cas9",
      country: "Kenya",
      region: "East Africa",
      crop: "Maize",
      tech: "CRISPR-Cas9",
      status: "CFT",
      description: "Confined field trials for drought-tolerant maize varieties developed using CRISPR-Cas9 technology. Promising 30% yield increase under water-limited conditions.",
      fullDescription: "This groundbreaking project aims to develop drought-tolerant maize varieties using advanced CRISPR-Cas9 gene editing technology. The research focuses on identifying and editing key genes responsible for water-use efficiency and drought stress tolerance. Initial greenhouse trials have shown promising results with up to 30% yield improvement under water-limited conditions. The project is now in confined field trial phase across multiple locations in Kenya.",
      tags: ["drought tolerance", "yield improvement", "food security", "climate resilience"],
      partners: ["KALRO", "University of Nairobi", "AUDA-NEPAD", "CIMMYT"],
      year: "2024-2026",
      leadInstitution: "Kenya Agricultural and Livestock Research Organization",
      funding: "$2.5M",
      impact: "Expected to benefit 500,000 smallholder farmers across East Africa",
      objectives: [
        "Develop maize varieties with 30% improved drought tolerance",
        "Reduce crop failure rates by 40% in drought-prone areas",
        "Train 1,000 farmers on new varieties",
        "Establish seed multiplication systems"
      ],
      milestones: [
        { year: "2024", achievement: "Gene identification and editing completed" },
        { year: "2025", achievement: "Greenhouse trials successful" },
        { year: "2026", achievement: "Confined field trials initiated" },
        { year: "2027", achievement: "Expected commercial release" }
      ],
      publications: [
        { title: "CRISPR-Cas9 mediated drought tolerance in maize", journal: "Plant Biotechnology Journal", year: "2024" },
        { title: "Field performance of edited maize varieties", journal: "Field Crops Research", year: "2025" }
      ],
      imageUrl: "https://images.unsplash.com/photo-1628191010213-c0a11f5c1d6a?w=800",
      gallery: [
        "https://images.unsplash.com/photo-1628191010213-c0a11f5c1d6a?w=800",
        "https://images.unsplash.com/photo-1574323345637-d227c5e7f3b7?w=800"
      ]
    },
    2: {
      id: 2,
      title: "Cassava Mosaic Virus Resistance",
      country: "Nigeria",
      region: "West Africa",
      crop: "Cassava",
      tech: "CRISPR-Cas9",
      status: "R&D",
      description: "Developing CRISPR-edited cassava with enhanced resistance to cassava mosaic disease and brown streak disease.",
      fullDescription: "Cassava is a staple food for over 800 million people globally, but viral diseases cause up to 80% yield losses. This project uses CRISPR-Cas9 to target viral genomes and develop resistant cassava varieties. The technology has shown 95% resistance in laboratory trials and is now moving to field testing.",
      tags: ["viral resistance", "food security", "smallholder", "sustainable agriculture"],
      partners: ["IITA", "NABDA", "AATF", "Cornell University"],
      year: "2023-2027",
      leadInstitution: "International Institute of Tropical Agriculture",
      funding: "$3.2M",
      impact: "Targeting 1M farmers across West Africa, reducing yield losses by 80%",
      objectives: [
        "Develop cassava varieties resistant to both mosaic and brown streak diseases",
        "Reduce pesticide use by 60%",
        "Increase cassava yields by 50%",
        "Create sustainable seed distribution system"
      ],
      milestones: [
        { year: "2023", achievement: "Gene editing strategy designed" },
        { year: "2024", achievement: "Laboratory trials successful" },
        { year: "2025", achievement: "Greenhouse trials initiated" },
        { year: "2026", achievement: "Confined field trials planned" }
      ],
      publications: [
        { title: "CRISPR-mediated viral resistance in cassava", journal: "Nature Biotechnology", year: "2024" }
      ],
      imageUrl: "https://images.unsplash.com/photo-1523348837708-15c4ad09b56e?w=800"
    },
    3: {
      id: 3,
      title: "Gene-Edited Sorghum Commercial Release",
      country: "South Africa",
      region: "Southern Africa",
      crop: "Sorghum",
      tech: "CRISPR-Cas9",
      status: "Commercial",
      description: "First commercial release of gene-edited sorghum with enhanced drought tolerance and pest resistance in Africa.",
      fullDescription: "Making history as Africa's first commercially released gene-edited crop, this sorghum variety offers enhanced drought tolerance and pest resistance. The product has undergone rigorous safety assessments and received regulatory approval for commercial cultivation.",
      tags: ["commercialization", "drought tolerance", "pest resistance", "breakthrough"],
      partners: ["ARC", "Seed Co", "DALRRD", "University of Pretoria"],
      year: "2025",
      leadInstitution: "Agricultural Research Council",
      funding: "$4.1M",
      impact: "First commercial GEd crop in Africa, paving the way for future releases",
      objectives: [
        "Achieve regulatory approval for commercial release",
        "Establish seed production and distribution networks",
        "Train farmers on cultivation practices",
        "Monitor field performance"
      ],
      milestones: [
        { year: "2022", achievement: "Regulatory framework established" },
        { year: "2023", achievement: "Field trials completed" },
        { year: "2024", achievement: "Safety assessments approved" },
        { year: "2025", achievement: "Commercial release achieved" }
      ],
      publications: [
        { title: "Commercialization of gene-edited crops in Africa", journal: "GM Crops & Food", year: "2025" }
      ],
      imageUrl: "https://images.unsplash.com/photo-1574323345637-d227c5e7f3b7?w=800"
    }
    // Add more projects as needed
  };

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      const projectData = projectsData[projectId];
      if (projectData) {
        setProject(projectData);
        // Find related projects (same crop or region)
        const related = Object.values(projectsData)
          .filter(p => p.id !== projectData.id && (p.crop === projectData.crop || p.region === projectData.region))
          .slice(0, 3);
        setRelatedProjects(related);
      }
      setLoading(false);
    }, 500);
  }, [projectId]);

  const getStatusClass = (status) => {
    const map = { "CFT": "status-cft", "R&D": "status-rd", "Commercial": "status-commercial" };
    return map[status] || "status-rd";
  };

  const getStatusLabel = (status) => {
    const map = { "CFT": "Confined Field Trial", "R&D": "Research & Development", "Commercial": "Commercial Release" };
    return map[status] || status;
  };

  if (loading) {
    return (
      <div className="project-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="project-details-error">
        <i className="fas fa-exclamation-triangle"></i>
        <h2>Project Not Found</h2>
        <p>The project you're looking for doesn't exist.</p>
        <button onClick={onBackClick} className="btn-primary">Back to Projects</button>
      </div>
    );
  }

  return (
    <div className="project-details-page">
      {/* Header */}
      <header className="details-header">
        <div className="container">
          <button onClick={onBackClick} className="back-button">
            <i className="fas fa-arrow-left"></i> Back to Projects
          </button>
          <div className="project-title-section">
            <h1>{project.title}</h1>
            <div className="project-badges">
              <span className={`project-status ${getStatusClass(project.status)}`}>
                {getStatusLabel(project.status)}
              </span>
              <span className="project-region">{project.region}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Image */}
      <div className="details-hero">
        <img src={project.imageUrl} alt={project.title} />
        <div className="hero-overlay"></div>
      </div>

      <div className="container">
        <div className="details-layout">
          {/* Main Content */}
          <div className="details-main">
            {/* Overview Section */}
            <section className="details-section">
              <h2><i className="fas fa-info-circle"></i> Project Overview</h2>
              <p>{project.fullDescription || project.description}</p>
            </section>

            {/* Objectives Section */}
            <section className="details-section">
              <h2><i className="fas fa-bullseye"></i> Key Objectives</h2>
              <ul className="objectives-list">
                {project.objectives.map((objective, idx) => (
                  <li key={idx}>
                    <i className="fas fa-check-circle"></i>
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Timeline/Milestones */}
            <section className="details-section">
              <h2><i className="fas fa-chart-line"></i> Project Milestones</h2>
              <div className="timeline">
                {project.milestones.map((milestone, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-year">{milestone.year}</div>
                    <div className="timeline-content">
                      <p>{milestone.achievement}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Publications */}
            {project.publications && project.publications.length > 0 && (
              <section className="details-section">
                <h2><i className="fas fa-file-alt"></i> Key Publications</h2>
                <div className="publications-list">
                  {project.publications.map((pub, idx) => (
                    <div key={idx} className="publication-item">
                      <div className="pub-icon">
                        <i className="fas fa-file-pdf"></i>
                      </div>
                      <div className="pub-details">
                        <h4>{pub.title}</h4>
                        <p>{pub.journal} • {pub.year}</p>
                      </div>
                      <button className="pub-link">
                        <i className="fas fa-external-link-alt"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Gallery */}
            {project.gallery && project.gallery.length > 0 && (
              <section className="details-section">
                <h2><i className="fas fa-images"></i> Project Gallery</h2>
                <div className="gallery-grid">
                  {project.gallery.map((img, idx) => (
                    <div key={idx} className="gallery-item">
                      <img src={img} alt={`Project ${idx + 1}`} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="details-sidebar">
            {/* Quick Info Card */}
            <div className="info-card">
              <h3><i className="fas fa-fast-forward"></i> Quick Info</h3>
              <div className="info-row">
                <span className="info-label">📍 Country:</span>
                <span className="info-value">{project.country}</span>
              </div>
              <div className="info-row">
                <span className="info-label">🌾 Crop/Focus:</span>
                <span className="info-value">{project.crop}</span>
              </div>
              <div className="info-row">
                <span className="info-label">🔬 Technology:</span>
                <span className="info-value">{project.tech}</span>
              </div>
              <div className="info-row">
                <span className="info-label">📅 Timeline:</span>
                <span className="info-value">{project.year}</span>
              </div>
              <div className="info-row">
                <span className="info-label">💰 Funding:</span>
                <span className="info-value">{project.funding}</span>
              </div>
            </div>

            {/* Impact Card */}
            <div className="impact-card">
              <h3><i className="fas fa-chart-simple"></i> Expected Impact</h3>
              <p>{project.impact}</p>
            </div>

            {/* Partners Card */}
            <div className="partners-card">
              <h3><i className="fas fa-handshake"></i> Partners</h3>
              <div className="partners-list">
                {project.partners.map((partner, idx) => (
                  <div key={idx} className="partner-item">
                    <i className="fas fa-building"></i>
                    <span>{partner}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lead Institution Card */}
            <div className="institution-card">
              <h3><i className="fas fa-university"></i> Lead Institution</h3>
              <p>{project.leadInstitution}</p>
            </div>

            {/* Tags */}
            <div className="tags-card">
              <h3><i className="fas fa-tags"></i> Focus Areas</h3>
              <div className="project-tags">
                {project.tags.map((tag, idx) => (
                  <span key={idx} className="tag">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Projects */}
        {relatedProjects.length > 0 && (
          <section className="related-projects">
            <h2><i className="fas fa-project-diagram"></i> Related Projects</h2>
            <div className="related-grid">
              {relatedProjects.map(related => (
                <div key={related.id} className="related-card" onClick={() => window.location.reload()}>
                  <h4>{related.title}</h4>
                  <p>{related.description.substring(0, 100)}...</p>
                  <div className="related-meta">
                    <span>{related.country}</span>
                    <span className={`status-badge ${getStatusClass(related.status)}`}>
                      {getStatusLabel(related.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="details-footer">
        <div className="container">
          <div className="footer-content">
            <p>© 2026 AUDA-NEPAD Genome Editing Programme — Advancing science for Africa's prosperity.</p>
            <button onClick={onBackClick} className="footer-back-btn">
              <i className="fas fa-arrow-left"></i> Back to Projects
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProjectDetailsPage;