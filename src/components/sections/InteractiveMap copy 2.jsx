// components/sections/InteractiveMap.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useData } from '../../context/DataContext';
import apiService from '../../services/apiService';
import './InteractiveMap.css';

const InteractiveMap = () => {
  const { countries: contextCountries } = useData();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' });
  const [countryData, setCountryData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCountryData, setSelectedCountryData] = useState(null);
  const mapRef = useRef(null);

  // Helper function to extract agreements from international alignment
  const extractAgreements = (country) => {
    const agreements = [];
    
    if (country.international_alignment) {
      const alignments = country.international_alignment;
      if (alignments.includes('Cartagena')) {
        agreements.push('Cartagena Protocol on Biosafety');
      }
      if (alignments.includes('AU')) {
        agreements.push('AU Model Law');
      }
      if (alignments.includes('Codex')) {
        agreements.push('Codex Alimentarius');
      }
      if (alignments.includes('CBD')) {
        agreements.push('Convention on Biological Diversity (CBD)');
      }
      if (alignments.includes('UNFCCC')) {
        agreements.push('UN Framework Convention on Climate Change');
      }
      if (alignments.includes('Nagoya')) {
        agreements.push('Nagoya Protocol');
      }
    }
    
    // If biosafety status is functional but no agreements listed
    if (agreements.length === 0 && country.biosafety_status === 'functional') {
      agreements.push('National Biosafety Framework in place');
    }
    
    return agreements.length > 0 ? agreements : ['No specific agreements listed'];
  };

  // Fetch all country data from API
  const fetchCountryData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all required data in parallel
      const [
        countriesRes,
        projectsRes,
        regFrameworksRes,
        organismsRes,
        publicationsRes,
        expertsRes,
        institutionsRes,
        facilitiesRes
      ] = await Promise.all([
        apiService.getCountries({ limit: 100 }),
        apiService.getProjects({ limit: 100 }),
        apiService.getRegulatoryFrameworks({ limit: 50 }),
        apiService.getOrganisms({ limit: 100 }),
        apiService.getPublications({ limit: 100 }),
        apiService.getExperts({ limit: 100 }),
        apiService.getInstitutions({ limit: 100 }),
        apiService.getLaboratoryFacilities({ limit: 100 })
      ]);

      const countries = countriesRes.results || countriesRes || [];
      const projects = projectsRes.results || projectsRes || [];
      const regFrameworks = regFrameworksRes.results || regFrameworksRes || [];
      const organisms = organismsRes.results || organismsRes || [];
      const publications = publicationsRes.results || publicationsRes || [];
      const experts = expertsRes.results || expertsRes || [];
      const institutions = institutionsRes.results || institutionsRes || [];
      const facilities = facilitiesRes.results || facilitiesRes || [];

      // Build country data map
      const dataMap = {};
      
      countries.forEach(country => {
        const slug = country.slug || country.name.toLowerCase().replace(/\s+/g, '-');
        const countryId = country.id;
        
        // Filter data by country
        const countryProjects = projects.filter(p => 
          p.country === countryId || p.country?.id === countryId
        );
        
        const countryPublications = publications.filter(p => 
          p.country === countryId || p.country?.id === countryId
        );
        
        const countryExperts = experts.filter(e => 
          e.country === countryId || e.country?.id === countryId
        );
        
        const countryOrganisms = organisms.filter(o => 
          o.country === countryId || o.country?.id === countryId
        );
        
        const countryInstitutions = institutions.filter(i => 
          i.country === countryId || i.country?.id === countryId
        );
        
        const countryFacilities = facilities.filter(f => 
          f.country === countryId || f.country?.id === countryId
        );
        
        // Get regulatory framework
        const regFramework = regFrameworks.find(r => 
          r.country === countryId || r.country?.id === countryId
        );
        
        // Calculate readiness score and activity level
        const readinessScore = country.readiness_score || 0;
        let activity = 'low';
        if (readinessScore >= 0.7) activity = 'high';
        else if (readinessScore >= 0.4) activity = 'medium';
        
        // Build priority organisms list
        const priorityOrganismsList = countryOrganisms
          .map(o => o.common_name || o.name)
          .filter(Boolean)
          .join(', ') || 'Data not available';
        
        // Build agreements
        const agreements = extractAgreements(country);
        
        // Build trend/description
        let trend = country.notes || '';
        if (!trend && regFramework) {
          trend = regFramework.summary || '';
        }
        if (!trend) {
          trend = `${country.name} is developing its genome editing regulatory framework and research capacity.`;
        }
        
        // Count CFTs from projects
        const cfts = countryProjects.filter(p => p.status === 'cft').length;
        
        dataMap[slug] = {
          id: countryId,
          name: country.name,
          code: country.code,
          flag_emoji: country.flag_emoji || '🌍',
          region: country.region?.name || 'Africa',
          capital: country.capital || '',
          population: country.population || '',
          activity: activity,
          readinessScore: readinessScore,
          biosafetyStatus: country.biosafety_status || 'development',
          classificationApproach: country.classification_approach || 'none',
          internationalAlignment: country.international_alignment || '',
          gedGuidelines: country.ged_guidelines || '',
          
          // Metrics
          projects: country.active_projects || countryProjects.length,
          cfts: cfts,
          publications: country.publications_count || countryPublications.length,
          institutionalCapacity: country.institutions_count || countryInstitutions.length,
          priorityOrganisms: countryOrganisms.length,
          researchers: country.researchers_trained || 0,
          funding: country.funding_received || 0,
          
          // Lists
          agreements: agreements,
          priorityOrganismsList: priorityOrganismsList,
          trend: trend,
          
          // Raw data for reference
          projectsList: countryProjects,
          publicationsList: countryPublications,
          expertsList: countryExperts,
          organismsList: countryOrganisms,
          institutionsList: countryInstitutions,
          facilitiesList: countryFacilities,
          regFramework: regFramework,
          rawData: country
        };
      });
      
      setCountryData(dataMap);
      
      // Check URL hash for selected country
      if (window.location.hash) {
        const hashCountry = window.location.hash.substring(1);
        if (dataMap[hashCountry]) {
          setSelectedCountry(hashCountry);
          setSelectedCountryData(dataMap[hashCountry]);
        }
      }
      
    } catch (err) {
      console.error('Error fetching country data:', err);
      setError(err.message);
      // Fallback to static data
      setCountryData(getStaticCountryData());
    } finally {
      setLoading(false);
    }
  }, []);

  // Static fallback data (keep your existing data as backup)
  const getStaticCountryData = () => {
    return {
      ethiopia: {
        name: 'Ethiopia',
        activity: 'medium',
        projects: 3,
        institutionalCapacity: 13,
        priorityOrganisms: 7,
        agreements: [
          'Codex: (Signed-1968)-(Ratified-1968)',
          'UNFCCC: (Signed-1994)-(Ratified-1994)',
          'CBD: (Signed-1992)-(Ratified-1994)',
          'CPB: (Signed-2000)-(Ratified-2003)',
          'Nagoya Protocol: (Signed-2012)-(Ratified-2012)'
        ],
        priorityOrganismsList: 'Teff, Sorghum, Maize, Potato, Ensete, Ethiopian mustard, Coffee',
        trend: 'Genome editing in Ethiopia is moving from policy design to early implementation...',
        readinessScore: 0.45,
        biosafetyStatus: 'development'
      },
      egypt: {
        name: 'Egypt',
        activity: 'high',
        projects: 8,
        institutionalCapacity: 10,
        priorityOrganisms: 13,
        agreements: [
          'Codex: (Signed-1972)-(Ratified-1972)',
          'UNFCCC: (Signed-1994)-(Ratified-1994)',
          'CBD: (Signed-1995)-(Ratified-1996)',
          'CPB: (Signed-2000)-(Ratified-2011)',
          'Nagoya Protocol: (Signed-2012)-(Ratified-2013)'
        ],
        priorityOrganismsList: 'Wheat, Sorghum, Maize, Rice, Barley, Chickpea, Faba bean, Lentils, Potato, Petunia, Strawberry, Banana, Date palm',
        trend: 'Recent developments in GEd enable new food products to reach the market quickly...',
        readinessScore: 0.78,
        biosafetyStatus: 'functional'
      },
      // ... include all your other static country data here
    };
  };

  // Load data on mount
  useEffect(() => {
    fetchCountryData();
  }, [fetchCountryData]);

  const getActivityClass = (activity) => {
    switch(activity) {
      case 'high': return 'high';
      case 'medium': return 'medium';
      default: return 'low';
    }
  };

  const getReadinessLevel = (score) => {
    if (score >= 0.7) return 'Advanced';
    if (score >= 0.4) return 'Intermediate';
    return 'Foundational';
  };

  const getBiosafetyStatusLabel = (status) => {
    const labels = {
      'functional': 'Functional Framework',
      'draft': 'Draft Guidelines',
      'development': 'Policy Development',
      'none': 'No Specific Framework',
      'under_review': 'Under Review',
      'implemented': 'Implemented'
    };
    return labels[status] || status;
  };

  const handleCountryClick = async (countryId) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setSelectedCountry(countryId);
    
    // Update URL hash
    window.location.hash = countryId;
    
    // Get country data from map
    const country = countryData[countryId];
    if (country) {
      setSelectedCountryData(country);
      
      // Try to fetch fresh details for the selected country
      try {
        const freshCountry = await apiService.getCountry(country.id);
        if (freshCountry) {
          setSelectedCountryData(prev => ({
            ...prev,
            ...freshCountry,
            name: freshCountry.name || prev?.name,
            agreements: prev?.agreements || extractAgreements(freshCountry),
            trend: freshCountry.notes || prev?.trend
          }));
        }
      } catch (err) {
        console.error('Error fetching fresh country details:', err);
      }
    }
    
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  const handleCountryHover = useCallback((event, countryName) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      text: countryName
    });
  }, []);

  const handleCountryLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, text: '' });
  };

  // Check URL hash on mount
  useEffect(() => {
    if (window.location.hash && !loading) {
      const hashCountry = window.location.hash.substring(1);
      if (countryData[hashCountry]) {
        setSelectedCountry(hashCountry);
        setSelectedCountryData(countryData[hashCountry]);
      }
    }
  }, [countryData, loading]);

  // Handle escape key to close tooltip
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setTooltip({ visible: false, x: 0, y: 0, text: '' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="genome-map-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading map data...</p>
        </div>
      </div>
    );
  }

  const selectedData = selectedCountry ? countryData[selectedCountry] : null;

  return (
    <div className="genome-map-container">
      <header className="map-header">
        <h1 className="map-title">
          <span className="title-highlight">Genome Editing</span> in Africa
        </h1>
        <p className="map-subtitle">Advancing Genome Editing for Africa's Development.</p>
        {!error && (
          <p className="data-source-info">
            {Object.keys(countryData).length} countries • Data from AUDA-NEPAD
          </p>
        )}
      </header>

      <section className="interactive-section">
        <div className="map-grid-layout">
          {/* Left Column: Map */}
          <div className="map-column">
            <div className="map-container">
              <svg
                style={{ enableBackground: 'new 0 0 263.201 289.81' }}
                version="1.1"
                viewBox="0 0 263.201 289.81"
                className="africa-map"
                ref={mapRef}
              >
                <g>
                  {/* Egypt */}
                  <path
                    className={`country-region ${selectedCountry === 'egypt' ? 'active' : ''}`}
                    data-country="egypt"
                    data-activity={countryData.egypt?.activity || 'high'}
                    onClick={() => handleCountryClick('egypt')}
                    onMouseEnter={(e) => handleCountryHover(e, 'Egypt')}
                    onMouseLeave={handleCountryLeave}
                    tabIndex="0"
                    role="button"
                    aria-label="Select Egypt to view genome editing information"
                    d="M205.948,64.056c-1.78-0.454-3.929-0.202-5.813-0.202c-6.552,0-37.963,0.236-39.845,0.223h-0.055..."
                  />
                  
                  {/* Tunisia */}
                  <path
                    className={`country-region ${selectedCountry === 'tunisia' ? 'active' : ''}`}
                    data-country="tunisia"
                    data-activity={countryData.tunisia?.activity || 'low'}
                    onClick={() => handleCountryClick('tunisia')}
                    onMouseEnter={(e) => handleCountryHover(e, 'Tunisia')}
                    onMouseLeave={handleCountryLeave}
                    tabIndex="0"
                    role="button"
                    aria-label="Select Tunisia to view genome editing information"
                    d="M108.497,20.214c-0.092,0.466-0.604,1.201-0.993,1.489..."
                  />
                  
                  {/* Burkina Faso */}
                  <path
                    className={`country-region ${selectedCountry === 'burkina-faso' ? 'active' : ''}`}
                    data-country="burkina-faso"
                    data-activity={countryData['burkina-faso']?.activity || 'low'}
                    onClick={() => handleCountryClick('burkina-faso')}
                    onMouseEnter={(e) => handleCountryHover(e, 'Burkina Faso')}
                    onMouseLeave={handleCountryLeave}
                    tabIndex="0"
                    role="button"
                    aria-label="Select Burkina Faso to view genome editing information"
                    d="M75.808,102.279c-0.015,0.268-0.108,0.536-0.239,0.81..."
                  />
                  
                  {/* Cameroon */}
                  <path
                    className={`country-region ${selectedCountry === 'cameroon' ? 'active' : ''}`}
                    data-country="cameroon"
                    data-activity={countryData.cameroon?.activity || 'low'}
                    onClick={() => handleCountryClick('cameroon')}
                    onMouseEnter={(e) => handleCountryHover(e, 'Cameroon')}
                    onMouseLeave={handleCountryLeave}
                    tabIndex="0"
                    role="button"
                    aria-label="Select Cameroon to view genome editing information"
                    d="M128.123,140.509c-0.123,0.265-0.247,0.529-0.368,0.805..."
                  />
                  
                  {/* Ghana */}
                  <path
                    className={`country-region ${selectedCountry === 'ghana' ? 'active' : ''}`}
                    data-country="ghana"
                    data-activity={countryData.ghana?.activity || 'medium'}
                    onClick={() => handleCountryClick('ghana')}
                    onMouseEnter={(e) => handleCountryHover(e, 'Ghana')}
                    onMouseLeave={handleCountryLeave}
                    tabIndex="0"
                    role="button"
                    aria-label="Select Ghana to view genome editing information"
                    d="M70.391,127.19c-0.55,0.167-1.175,0.148-1.762,0.298..."
                  />
                  
                  {/* Kenya */}
                  <path
                    className={`country-region ${selectedCountry === 'kenya' ? 'active' : ''}`}
                    data-country="kenya"
                    data-activity={countryData.kenya?.activity || 'high'}
                    onClick={() => handleCountryClick('kenya')}
                    onMouseEnter={(e) => handleCountryHover(e, 'Kenya')}
                    onMouseLeave={handleCountryLeave}
                    tabIndex="0"
                    role="button"
                    aria-label="Select Kenya to view genome editing information"
                    d="M224.045,138.151c0.015,0.174,0.04,0.503-0.01,0.679..."
                  />
                  
                  {/* Malawi */}
                  <path
                    className={`country-region ${selectedCountry === 'malawi' ? 'active' : ''}`}
                    data-country="malawi"
                    data-activity={countryData.malawi?.activity || 'low'}
                    onClick={() => handleCountryClick('malawi')}
                    onMouseEnter={(e) => handleCountryHover(e, 'Malawi')}
                    onMouseLeave={handleCountryLeave}
                    tabIndex="0"
                    role="button"
                    aria-label="Select Malawi to view genome editing information"
                    d="M202.518,208.9c-0.285,0.254-0.585,0.224-0.596,0.694..."
                  />
                  
                  {/* Morocco */}
                  <path
                    className={`country-region ${selectedCountry === 'morocco' ? 'active' : ''}`}
                    data-country="morocco"
                    data-activity={countryData.morocco?.activity || 'medium'}
                    onClick={() => handleCountryClick('morocco')}
                    onMouseEnter={(e) => handleCountryHover(e, 'Morocco')}
                    onMouseLeave={handleCountryLeave}
                    tabIndex="0"
                    role="button"
                    aria-label="Select Morocco to view genome editing information"
                    d="M63.05,21.019c-1.161,0.65-0.05,1.619-1.827,1.875..."
                  />
                  
                  {/* Mozambique */}
                  <path
                    className={`country-region ${selectedCountry === 'mozambique' ? 'active' : ''}`}
                    data-country="mozambique"
                    data-activity={countryData.mozambique?.activity || 'medium'}
                    onClick={() => handleCountryClick('mozambique')}
                    onMouseEnter={(e) => handleCountryHover(e, 'Mozambique')}
                    onMouseLeave={handleCountryLeave}
                    tabIndex="0"
                    role="button"
                    aria-label="Select Mozambique to view genome editing information"
                    d="M221.206,207.466c-0.205,0.438-0.413,0.415-0.53,0.929..."
                  />
                  
                  {/* Nigeria */}
                  <path
                    className={`country-region ${selectedCountry === 'nigeria' ? 'active' : ''}`}
                    data-country="nigeria"
                    data-activity={countryData.nigeria?.activity || 'high'}
                    onClick={() => handleCountryClick('nigeria')}
                    onMouseEnter={(e) => handleCountryHover(e, 'Nigeria')}
                    onMouseLeave={handleCountryLeave}
                    tabIndex="0"
                    role="button"
                    aria-label="Select Nigeria to view genome editing information"
                    d="M119.429,106.621c-0.229,0.828-0.966,1.549-1.375,2.192..."
                  />
                  
                  {/* Rwanda */}
                  <path
                    className={`country-region ${selectedCountry === 'rwanda' ? 'active' : ''}`}
                    data-country="rwanda"
                    data-activity={countryData.rwanda?.activity || 'medium'}
                    onClick={() => handleCountryClick('rwanda')}
                    onMouseEnter={(e) => handleCountryHover(e, 'Rwanda')}
                    onMouseLeave={handleCountryLeave}
                    tabIndex="0"
                    role="button"
                    aria-label="Select Rwanda to view genome editing information"
                    d="M183.191,160.264v0.007c-0.155-0.159-0.273-0.396-0.319-0.577..."
                  />
                  
                  {/* Senegal */}
                  <path
                    className={`country-region ${selectedCountry === 'senegal' ? 'active' : ''}`}
                    data-country="senegal"
                    data-activity={countryData.senegal?.activity || 'medium'}
                    onClick={() => handleCountryClick('senegal')}
                    onMouseEnter={(e) => handleCountryHover(e, 'Senegal')}
                    onMouseLeave={handleCountryLeave}
                    tabIndex="0"
                    role="button"
                    aria-label="Select Senegal to view genome editing information"
                    d="M24.954,102.612c-0.693-0.367-0.74-0.677-1.747-0.677..."
                  />
                  
                  {/* South Africa */}
                  <path
                    className={`country-region ${selectedCountry === 'south-africa' ? 'active' : ''}`}
                    data-country="south-africa"
                    data-activity={countryData['south-africa']?.activity || 'high'}
                    onClick={() => handleCountryClick('south-africa')}
                    onMouseEnter={(e) => handleCountryHover(e, 'South Africa')}
                    onMouseLeave={handleCountryLeave}
                    tabIndex="0"
                    role="button"
                    aria-label="Select South Africa to view genome editing information"
                    d="M188.058,255.538v-0.003c-0.338-0.283-0.725-0.244-1.079-0.438..."
                  />
                  
                  {/* Zimbabwe */}
                  <path
                    className={`country-region ${selectedCountry === 'zimbabwe' ? 'active' : ''}`}
                    data-country="zimbabwe"
                    data-activity={countryData.zimbabwe?.activity || 'low'}
                    onClick={() => handleCountryClick('zimbabwe')}
                    onMouseEnter={(e) => handleCountryHover(e, 'Zimbabwe')}
                    onMouseLeave={handleCountryLeave}
                    tabIndex="0"
                    role="button"
                    aria-label="Select Zimbabwe to view genome editing information"
                    d="M190.813,221.975c0.01,0.116-0.497,0.716-0.546,0.842..."
                  />
                  
                  {/* Ethiopia */}
                  <path
                    className={`country-region ${selectedCountry === 'ethiopia' ? 'active' : ''}`}
                    data-country="ethiopia"
                    data-activity={countryData.ethiopia?.activity || 'medium'}
                    onClick={() => handleCountryClick('ethiopia')}
                    onMouseEnter={(e) => handleCountryHover(e, 'Ethiopia')}
                    onMouseLeave={handleCountryLeave}
                    tabIndex="0"
                    role="button"
                    aria-label="Select Ethiopia to view genome editing information"
                    d="M251.396,118.615c-0.282,0.539-0.688,1.127-1.147,1.598c-1.908,1.967-9.824,9.343-10.322,9.884&#13;          c-0.575,0.624-0.918,0.515-1.906,0.5c-0.824-0.009-1.617-0.113-2.399-0.019c-0.835,0.092-1.08,0.515-1.759,0.795&#13;          c-0.814,0.338-1.073,0.124-1.698,0.807c-0.442,0.476-0.942,1.112-1.683,1.394c-0.731,0.278-1.407,0.104-2.082,0.495&#13;          c-0.334,0.194-0.659,0.455-0.983,0.73c-0.161-0.031-0.326-0.055-0.503-0.035c-0.408,0.038-0.756,0.123-1.191,0.144&#13;          c-0.342,0.019-0.851,0.159-1.188,0.003c-0.323-0.147-0.387-0.487-0.606-0.728c-0.587-0.657-1.099-0.447-1.873-0.413&#13;          c-0.441,0.024-0.656,0.075-1.027,0.213c-0.325,0.125-0.743,0.103-1.056,0.283c-0.389,0.226-0.766,0.669-1.053,0.983&#13;          c-0.33,0.357-0.497,0.892-0.983,1.148c-0.558,0.301-2.914,0.459-3.274-0.288c-0.775-0.162-1.554-0.055-2.278-0.464&#13;          c-0.643-0.362-1.136-0.764-1.696-1.266c-0.51-0.454-0.906-1.094-1.425-1.499c-0.607-0.475-1.455-0.307-2.233-0.347&#13;          c-0.562-0.032-0.987-0.287-1.447-0.21c-0.548,0.089-1.029,0.253-1.577,0.012c-0.779-0.349-0.578-2.143-0.701-2.917&#13;          c-0.51-0.028-1.034,0.018-1.421-0.222c-0.046-0.027-0.046-0.217-0.118-0.276c-0.07-0.055-0.341-0.069-0.437-0.096&#13;          c-0.006-0.003-0.008-0.003-0.011-0.003c0-0.215-0.179-0.437-0.421-1.092c-0.507-1.385-0.525-4.279-2.52-3.83&#13;          c-1.185-1.113-2.189-2.839-3.162-4.295c-0.496,0.307-1.861,0.21-2.53,0.198c-0.094-1.013,0.805-1.595,1.196-2.472&#13;          c0.763,0.21,1.954,0.21,2.73-0.043c0.7-1.245,0.304-2.821,0.681-4.214c0.177-0.648,0.67-0.978,0.798-1.58&#13;          c0.082-0.387-0.314-0.646-0.276-0.926c0.044-0.322,0.361-0.473,0.443-0.759c0.422-1.483,1.222-1.674,1.944-2.817&#13;          c0.572-0.918,0.403-3.315,1.567-3.591c0.276-1.063,0.905-1.94,1.236-2.996c0.21,0.051,0.393,0,0.602,0.094&#13;          c0.874-0.528,1.69-2.223,1.892-3.152c0.154-0.713,0.118-1.525,0.158-2.219c0.018-0.199,0.117-0.372,0.183-0.578&#13;          c0.394,0.128,0.766,0.296,1.217,0.257c0.307-0.484,0.907-0.493,1.319-0.932c0.308-0.337,0.745-1.31,0.708-1.8&#13;          c0.99,0.081,1.016,1.126,2.36,1.036c1.151-0.078,1.479-0.477,2.649-0.404c1.872,0.121,3.459,1.107,5.117,1.89&#13;          c0.896,0.427,1.293,0.995,2.146,1.556c0.817,0.539,1.819,0.667,2.619,1.188c0.73,0.478,0.947,1.171,1.512,1.818&#13;          c0.605,0.691,0.89,1.375,1.456,1.988c0.405,0.438,0.978,0.572,1.381,0.947c-0.174,0.116-0.35,0.244-0.497,0.356&#13;          c-0.067,1.118-0.524,1.831-0.713,2.86c-0.1,0.544-0.116,0.943-0.3,1.409c-0.177,0.442-0.441,0.749-0.377,1.254&#13;          c1.102,0.058,1.516-0.149,2.438-0.505c0.761-0.295,1.119,0.046,1.793,0.116c-0.247,0.998-0.177,2.068,0.311,2.979&#13;          c0.24,0.444,0.822,0.691,1.069,1.196c0.229,0.469,0.224,0.964,0.323,1.482c0.271,1.386,1.073,0.901,2.155,1.514&#13;          c2.416,1.373,7.789,2.852,10.342,3.794C245.606,118.821,249.733,118.53,251.396,118.615"
                    />
                  
                  {/* Continue with all other countries */}
                </g>
              </svg>

              <div className="map-legend">
                <h4 className="legend-title">GEd Readiness</h4>
                <div className="legend-items">
                  <div className="legend-item">
                    <span className="legend-color high-activity"></span>
                    <span>L1: Foundational</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color medium-activity"></span>
                    <span>L2: Intermediate</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color low-activity"></span>
                    <span>L3: Advanced</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Content */}
          <div className="content-column">
            {!selectedCountry || !selectedData ? (
              <div className="initial-message">
                <div className="message-icon">
                  <i className="fas fa-hand-pointer"></i>
                </div>
                <h3>Click on any country</h3>
                <p>to explore genome editing progress</p>
              </div>
            ) : (
              <div className="country-details">
                <div className="country-content active">
                  <div className="content-header">
                    <h2 className="country-name">
                      {selectedData.flag_emoji && (
                        <span className="country-flag">{selectedData.flag_emoji}</span>
                      )}
                      {selectedData.name}
                    </h2>
                    <span className={`activity-badge ${getActivityClass(selectedData.activity)}`}>
                      {getReadinessLevel(selectedData.readinessScore || 0)} Readiness
                    </span>
                    {selectedData.readinessScore !== undefined && (
                      <span className="readiness-score">
                        Score: {Math.round((selectedData.readinessScore || 0) * 100)}%
                      </span>
                    )}
                  </div>

                  {selectedData.biosafetyStatus && (
                    <div className="biosafety-status">
                      <strong>Biosafety Status:</strong> {getBiosafetyStatusLabel(selectedData.biosafetyStatus)}
                      {selectedData.classificationApproach && selectedData.classificationApproach !== 'none' && (
                        <span> • Classification: {selectedData.classificationApproach}</span>
                      )}
                    </div>
                  )}

                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-value">{selectedData.projects || 0}</div>
                      <div className="stat-label">GEd Projects</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{selectedData.institutionalCapacity || 0}</div>
                      <div className="stat-label">Institutional Capacity</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{selectedData.priorityOrganisms || 0}</div>
                      <div className="stat-label">Priority Organisms</div>
                    </div>
                  </div>

                  <div className="info-sections">
                    <div className="info-section">
                      <h3>
                        <i className="fa-solid fa-handshake"></i>Agreements/Treaties/Regulatory Frame
                      </h3>
                      <ul className="research-list">
                        {selectedData.agreements && selectedData.agreements.length > 0 ? (
                          selectedData.agreements.map((agreement, idx) => (
                            <li key={idx}>{agreement}</li>
                          ))
                        ) : (
                          <li>No agreements data available</li>
                        )}
                      </ul>
                      {selectedData.internationalAlignment && (
                        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                          <strong>International Alignment:</strong> {selectedData.internationalAlignment}
                        </p>
                      )}
                    </div>

                    <div className="info-section">
                      <h3><i className="fa-solid fa-seedling"></i>Priority Organisms</h3>
                      <p>{selectedData.priorityOrganismsList || 'No data available'}</p>
                    </div>
                  </div>

                  <div className="publications-preview">
                    <h3><i className="fa-solid fa-arrow-trend-up"></i>Trends & Insights</h3>
                    <p>{selectedData.trend || 'Genome editing research is developing in this country.'}</p>
                    
                    <div className="info-section" style={{ marginTop: '1rem', background: 'transparent' }}>
                      <h3><i className="fa-solid fa-link"></i>More Country Details</h3>
                      <span className="activity-badge high">
                        <a href={`/${selectedCountry}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          More Details
                        </a>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tooltip */}
      {tooltip.visible && (
        <div 
          className="map-tooltip visible"
          style={{
            position: 'fixed',
            top: tooltip.y,
            left: tooltip.x,
            transform: 'translateX(-50%)'
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;