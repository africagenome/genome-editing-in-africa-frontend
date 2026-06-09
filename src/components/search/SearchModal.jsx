import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { mockDatabase } from '../../data/mockData';

const SearchModal = ({ isOpen, onClose }) => {
  const [searchParams, setSearchParams] = useState({
    country: '',
    organism: '',
    custom: ''
  });
  const [searchResults, setSearchResults] = useState(null);

  const handleParamChange = (field, value) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
  };

  const executeSearch = () => {
    const filtered = mockDatabase.filter(entry => 
      (searchParams.country === "" || entry.country === searchParams.country) &&
      (searchParams.organism === "" || entry.organism === searchParams.organism) &&
      (searchParams.custom === "" || 
        entry.trait.toLowerCase().includes(searchParams.custom.toLowerCase()) || 
        entry.project.toLowerCase().includes(searchParams.custom.toLowerCase()))
    );
    
    const resultsHtml = filtered.length 
      ? filtered.map(r => `🔬 ${r.project} (${r.country}, ${r.organism})`).join('<br>')
      : "No matching projects found.";
    
    setSearchResults(resultsHtml);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 style={{ marginBottom: '8px' }}>
        <i className="fas fa-database"></i> Genome Editing Database
      </h3>
      <p style={{ marginBottom: '24px', color: '#666' }}>
        Filter by country, organism, or keyword
      </p>
      
      <div className="form-group">
        <label>🌍 Country</label>
        <select 
          value={searchParams.country} 
          onChange={(e) => handleParamChange('country', e.target.value)}
        >
          <option value="">All African countries</option>
          <option>South Africa</option><option>Kenya</option><option>Nigeria</option>
          <option>Ghana</option><option>Egypt</option><option>Rwanda</option>
          <option>Senegal</option><option>Zimbabwe</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>🧬 Organism / Target</label>
        <select 
          value={searchParams.organism} 
          onChange={(e) => handleParamChange('organism', e.target.value)}
        >
          <option value="">Any organism</option>
          <option>Maize (Zea mays)</option>
          <option>Cowpea</option>
          <option>Cassava</option>
          <option>Sorghum</option>
          <option>Human beta-globin (sickle cell)</option>
          <option>Malaria mosquito</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>🔍 Additional parameter (gene, institution, trait)</label>
        <input 
          type="text" 
          value={searchParams.custom}
          onChange={(e) => handleParamChange('custom', e.target.value)}
          placeholder="e.g., drought tolerance, CRISPR-Cas9, KEMRI" 
        />
      </div>
      
      <Button variant="primary" onClick={executeSearch} style={{ width: '100%', justifyContent: 'center' }}>
        <i className="fas fa-search"></i> Search Database
      </Button>
      
      {searchResults && (
        <div className="search-results-preview" style={{ display: 'block' }}>
          <strong>Results:</strong> <span dangerouslySetInnerHTML={{ __html: searchResults }} />
        </div>
      )}
    </Modal>
  );
};

export default SearchModal;