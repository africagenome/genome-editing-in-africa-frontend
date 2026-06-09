import React from 'react';

const ActionStripe = ({ onProjectsClick, onCountriesClick, onStakeholdersClick, onInfrastructureClick }) => {
  return (
    <div className="action-stripe">
      <div className="container">
        <h2 style={{ fontSize: '2rem' }}>Join Africa's genomic revolution</h2>
        <p style={{ marginTop: '12px', opacity: 0.9 }}>
          Funding calls, partnership opportunities, and technical working groups open to all AU member states.
        </p>
        <div className="action-buttons">
          <button onClick={onProjectsClick} className="btn-light" style={{ cursor: 'pointer' }}>
            <i className="fas fa-project-diagram"></i> View Projects
          </button>
          <button onClick={onCountriesClick} className="btn-light" style={{ cursor: 'pointer' }}>
            <i className="fas fa-globe-africa"></i> Explore Countries
          </button>
          <button onClick={onStakeholdersClick} className="btn-light" style={{ cursor: 'pointer' }}>
            <i className="fas fa-handshake"></i> Stakeholders
          </button>
          <button onClick={onInfrastructureClick} className="btn-light" style={{ cursor: 'pointer' }}>
            <i className="fas fa-microscope"></i> Infrastructure
          </button>
          
         
        </div>
      </div>
    </div>
  );
};

export default ActionStripe;