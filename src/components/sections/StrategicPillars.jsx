import React from 'react';
import Card from '../ui/Card';

const StrategicPillars = () => {
  const pillars = [
    {
      icon: "fas fa-seedling",
      title: "Climate-smart Crops",
      description: "Drought-tolerant maize, disease-resistant cassava, and biofortified sorghum developed by African scientists."
    },
    {
      icon: "fas fa-dna",
      title: "Gene Therapies",
      description: "Sickle cell disease, HIV functional cure, and rare genetic disorders — Pan-African clinical trials."
    },
    {
      icon: "fas fa-balance-scale",
      title: "Harmonized Regulation",
      description: "Creating the first continent-wide gene editing governance framework, inclusive of indigenous knowledge."
    },
    {
      icon: "fas fa-chalkboard-user",
      title: "Next-Gen Scientists",
      description: "Training 2,000+ young African experts in CRISPR, bioinformatics, and bioethics by 2028."
    }
  ];

  return (
    <>
      <div className="section-title">
        <h2>Strategic Research Pillars</h2>
        <div className="title-accent"></div>
        <p style={{ marginTop: '16px' }}>
          African-led genomic breakthroughs for health, agriculture, and environmental resilience
        </p>
      </div>
      <div className="cards-grid">
        {pillars.map((pillar, index) => (
          <Card key={index} {...pillar} />
        ))}
      </div>
    </>
  );
};

export default StrategicPillars;