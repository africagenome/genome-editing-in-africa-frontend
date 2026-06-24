// context/DataContext.jsx

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [countries, setCountries] = useState([]);
  const [countryData, setCountryData] = useState({});
  const [regions, setRegions] = useState([]);
  const [projects, setProjects] = useState([]);
  const [publications, setPublications] = useState([]);
  const [experts, setExperts] = useState([]);
  const [organisms, setOrganisms] = useState([]);
  const [organismCategories, setOrganismCategories] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [fundingOpportunities, setFundingOpportunities] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [glossary, setGlossary] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [consultations, setConsultations] = useState([]);
  
  const [selectedCountryId, setSelectedCountryId] = useState(null);
  const [selectedCountryDetail, setSelectedCountryDetail] = useState(null);

  // Extract agreements from country data
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
    
    if (agreements.length === 0 && country.biosafety_status === 'functional') {
      agreements.push('National Biosafety Framework in place');
    }
    
    return agreements.length > 0 ? agreements : ['No specific agreements listed'];
  };

  // Static fallback data
  const getStaticCountryData = () => {
    return {
      ethiopia: {
        name: 'Ethiopia',
        activity: 'medium',
        activeProjects: 3,
        institutionsCount: 13,
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
        activeProjects: 8,
        institutionsCount: 10,
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
      tunisia: {
        name: 'Tunisia',
        activity: 'low',
        activeProjects: 0,
        institutionsCount: 8,
        priorityOrganisms: 8,
        agreements: [
          'Codex: (Signed-1983)-(Ratified-1983)',
          'UNFCCC: (Signed-1992)-(Ratified-1993)',
          'CBD: (Signed-1992)-(Ratified-1993)',
          'CPB: (Signed-2000)-(Ratified-2003)',
          'Nagoya Protocol: (Signed-2011)-(Ratified-2021)'
        ],
        priorityOrganismsList: 'Durum Wheat, Barley, Faba bean, Olive, Date Palm, Carob, Tomato, Pepper',
        trend: 'Growing participation of Tunisian researchers in international collaborations...',
        readinessScore: 0.25,
        biosafetyStatus: 'development'
      },
      'burkina-faso': {
        name: 'Burkina Faso',
        activity: 'low',
        activeProjects: 2,
        institutionsCount: 2,
        priorityOrganisms: 6,
        agreements: [
          'Codex: (Signed-1966)-(Ratified-1966)',
          'UNFCCC: (Signed-1992)-(Ratified-1993)',
          'CBD: (Signed-1993)-(Ratified-2001)',
          'CPB: (Signed-2000)-(Ratified-2003)',
          'Nagoya Protocol: (Signed-2011)-(Ratified-2014)'
        ],
        priorityOrganismsList: 'Rice, Cowpea, Groundnuts, Cassava, Sweet potato, Tomato',
        trend: 'Burkina Faso has a robust regulatory framework and a committed scientific community...',
        readinessScore: 0.3,
        biosafetyStatus: 'development'
      },
      cameroon: {
        name: 'Cameroon',
        activity: 'low',
        activeProjects: 13,
        institutionsCount: 12,
        priorityOrganisms: 11,
        agreements: [
          'Codex: (Signed-1969)-(Ratified-1969)',
          'UNFCCC: (Signed-1992)-(Ratified-1994)',
          'CBD: (Signed-1992)-(Ratified-1994)',
          'CPB: (Signed-2001)-(Ratified-2003)',
          'Nagoya Protocol: (Signed-2013)-(Ratified-2020)'
        ],
        priorityOrganismsList: 'Sorghum, Maize, Wheat, Cowpea, Bambara groundnut, Cassava, Cocoyam, Plantain, Banana, Cocoa, Coffee',
        trend: 'Genome editing is advancing rapidly and offers significant opportunities...',
        readinessScore: 0.35,
        biosafetyStatus: 'development'
      },
      ghana: {
        name: 'Ghana',
        activity: 'medium',
        activeProjects: 4,
        institutionsCount: 12,
        priorityOrganisms: 11,
        agreements: [
          'Codex: (Signed-1966)-(Ratified-1966)',
          'UNFCCC: (Signed-1992)-(Ratified-1995)',
          'CBD: (Signed-1992)-(Ratified-1994)',
          'CPB: (Signed-2003)-(Ratified-2003)',
          'Nagoya Protocol: (Signed-2012)-(Ratified-2019)'
        ],
        priorityOrganismsList: 'Sorghum, Maize, Rice, Cowpea, Bambara groundnut, Tomato, Sweet Potato, Cocoa, Onions, Plantain, Banana',
        trend: 'The expansion of commercial farming (particularly of cashew, maize, and horticultural crops)...',
        readinessScore: 0.5,
        biosafetyStatus: 'draft'
      },
      kenya: {
        name: 'Kenya',
        activity: 'high',
        activeProjects: 13,
        institutionsCount: 17,
        priorityOrganisms: 9,
        agreements: [
          'Codex: (Signed-1969)-(Ratified-1969)',
          'UNFCCC: (Signed-1992)-(Ratified-1994)',
          'CBD: (Signed-1992)-(Ratified-1993)',
          'CPB: (Signed-2000)-(Ratified-2003)',
          'Nagoya Protocol: (Signed-2010)-(Ratified-2014)'
        ],
        priorityOrganismsList: 'Sorghum, Maize, Pearl millet, Groundnut, Tomato, Cassava, Yam, Potato, Banana',
        trend: 'Kenya is increasingly adopting biotech, particularly GEd to address food security...',
        readinessScore: 0.75,
        biosafetyStatus: 'functional'
      },
      malawi: {
        name: 'Malawi',
        activity: 'low',
        activeProjects: 0,
        institutionsCount: 8,
        priorityOrganisms: 3,
        agreements: [
          'Codex: (Signed-1971)-(Ratified-1971)',
          'UNFCCC: (Signed-1992)-(Ratified-1994)',
          'CBD: (Signed-1992)-(Ratified-1994)',
          'CPB: (Signed-2000)-(Ratified-2009)',
          'Nagoya Protocol: (Signed-2012)-(Ratified-2014)'
        ],
        priorityOrganismsList: 'Soybean, Groundnuts, Tomato',
        trend: 'Malawi domesticated the Cartagena Protocol on Biosafety before its ratification in 2009...',
        readinessScore: 0.2,
        biosafetyStatus: 'development'
      },
      morocco: {
        name: 'Morocco',
        activity: 'medium',
        activeProjects: 8,
        institutionsCount: 5,
        priorityOrganisms: 4,
        agreements: [
          'Codex: (Signed-2002)-(Ratified-2002)',
          'UNFCCC: (Signed-1992)-(Ratified-1995)',
          'CBD: (Signed-1995)-(Ratified-1995)',
          'CPB: (Signed-2000)-(Ratified-2011)',
          'Nagoya Protocol: (Signed-2011)-(Ratified-2022)'
        ],
        priorityOrganismsList: 'Durum Wheat, Barley, Potato, Tomato',
        trend: 'Genome editing research in Morocco is expanding, with UM6P positioning itself as a North African hub...',
        readinessScore: 0.55,
        biosafetyStatus: 'draft'
      },
      mozambique: {
        name: 'Mozambique',
        activity: 'medium',
        activeProjects: 2,
        institutionsCount: 10,
        priorityOrganisms: 8,
        agreements: [
          'Codex: (Signed-1981)-(Ratified-1981)',
          'UNFCCC: (Signed-1994)-(Ratified-1995)',
          'CBD: (Signed-1992)-(Ratified-1994)',
          'CPB: (Signed-2003)-(Ratified-2003)',
          'Nagoya Protocol: (Signed-2011)-(Ratified-2014)'
        ],
        priorityOrganismsList: 'Sorghum, Maize, Millet, Rice, Wheat, Cowpea, Cassava, Banana',
        trend: 'Agricultural biotechnology, particularly genome editing, is emerging as a transformative force...',
        readinessScore: 0.4,
        biosafetyStatus: 'development'
      },
      nigeria: {
        name: 'Nigeria',
        activity: 'high',
        activeProjects: 7,
        institutionsCount: 20,
        priorityOrganisms: 12,
        agreements: [
          'Codex: (Signed-1963)-(Ratified-1963)',
          'UNFCCC: (Signed-1992)-(Ratified-1994)',
          'CBD: (Signed-1992)-(Ratified-1994)',
          'CPB: (Signed-2000)-(Ratified-2003)',
          'Nagoya Protocol: (Signed-2012)-(Ratified-2012)'
        ],
        priorityOrganismsList: 'Sorghum, Maize, Millet, Cowpea, Bambara groundnut, Soybean, Tomato, Cassava, Yams, Irish Potato, Cocoa, Ginger',
        trend: 'In Nigeria, rapid advancement of genome editing technologies is revolutionizing modern science...',
        readinessScore: 0.7,
        biosafetyStatus: 'functional'
      },
      rwanda: {
        name: 'Rwanda',
        activity: 'medium',
        activeProjects: 3,
        institutionsCount: 7,
        priorityOrganisms: 7,
        agreements: [
          'Codex: (Signed-2018)-(Ratified-2018)',
          'CBD: (Signed-1992)-(Ratified-1995)',
          'CPB: (Signed-2000)-(Ratified-2004)',
          'Nagoya Protocol: (Signed-2010)-(Ratified-2014)'
        ],
        priorityOrganismsList: 'Sorghum, Maize, Rice, Beans, Cassava, Irish Potato, Banana',
        trend: 'Agricultural biotechnology, particularly genome editing, is increasingly recognized as a transformative tool...',
        readinessScore: 0.45,
        biosafetyStatus: 'development'
      },
      senegal: {
        name: 'Senegal',
        activity: 'medium',
        activeProjects: 0,
        institutionsCount: 16,
        priorityOrganisms: 5,
        agreements: [
          'Codex: (Signed-1966)-(Ratified-1966)',
          'UNFCCC: (Signed-1992)-(Ratified-1994)',
          'CBD: (Signed-1994)-(Ratified-1995)',
          'CPB: (Signed-2000)-(Ratified-2004)',
          'Nagoya Protocol: (Signed-2012)-(Ratified-2016)'
        ],
        priorityOrganismsList: 'Rice, Cowpea, Peanuts, Tomatoes, Pepper',
        trend: "Senegal's Biosafety Law took effect on 14th June 2022, repealing the 2009 Biosecurity Law...",
        readinessScore: 0.5,
        biosafetyStatus: 'draft'
      },
      'south-africa': {
        name: 'South Africa',
        activity: 'high',
        activeProjects: 8,
        institutionsCount: 12,
        priorityOrganisms: 12,
        agreements: [
          'Codex: (Signed-1994)-(Ratified-1994)',
          'UNFCCC: (Signed-1993)-(Ratified-2003)',
          'CBD: (Signed-1993)-(Ratified-1995)',
          'CPB: (Signed-2000)-(Ratified-2003)',
          'Nagoya Protocol: (Signed-2011)-(Ratified-2013)'
        ],
        priorityOrganismsList: 'Sorghum, Maize, Bread wheat, Fodder Grasses, Marama bean, Cowpea, Bambara groundnut, Potato, Cassava, Banana, Sugarcane, Wine Grapes',
        trend: 'Genome editing is advancing rapidly and offers significant opportunities...',
        readinessScore: 0.8,
        biosafetyStatus: 'functional'
      },
      zimbabwe: {
        name: 'Zimbabwe',
        activity: 'low',
        activeProjects: 6,
        institutionsCount: 17,
        priorityOrganisms: 6,
        agreements: [
          'Codex: (Signed-1985)-(Ratified-1985)',
          'UNFCCC: (Signed-1992)-(Ratified-1992)',
          'CBD: (Signed-1992)-(Ratified-1995)',
          'CPB: (Signed-2001)-(Ratified-2005)',
          'Nagoya Protocol: (Signed-2017)-(Ratified-2017)'
        ],
        priorityOrganismsList: 'Sorghum, Maize, Millet, Cowpea, Cassava, Tobacco',
        trend: 'Genome editing presents a powerful opportunity to enhance agricultural productivity...',
        readinessScore: 0.3,
        biosafetyStatus: 'development'
      }
    };
  };

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        countriesRes,
        regionsRes,
        projectsRes,
        publicationsRes,
        expertsRes,
        organismsRes,
        categoriesRes,
        institutionsRes,
        newsRes,
        eventsRes,
        fundingRes,
        faqsRes,
        glossaryRes,
        protocolsRes,
        consultationsRes
      ] = await Promise.all([
        apiService.getCountries(),
        apiService.getRegions(),
        apiService.getProjects({ limit: 100 }),
        apiService.getPublications({ limit: 100 }),
        apiService.getExperts({ limit: 100 }),
        apiService.getOrganisms({ limit: 100 }),
        apiService.getOrganismCategories(),
        apiService.getInstitutions(),
        apiService.getNews({ limit: 50 }),
        apiService.getEvents({ upcoming: true }),
        apiService.getFunding({ status: 'open' }),
        apiService.getFAQs(),
        apiService.getGlossary(),
        apiService.getProtocols(),
        apiService.getConsultations()
      ]);

      const countriesList = countriesRes.results || countriesRes;
      setCountries(countriesList);
      setRegions(regionsRes.results || regionsRes);
      
      const projectList = projectsRes.results || projectsRes;
      setProjects(projectList);
      
      const publicationsList = publicationsRes.results || publicationsRes;
      setPublications(publicationsList);
      
      const expertsList = expertsRes.results || expertsRes;
      setExperts(expertsList);
      
      const organismsList = organismsRes.results || organismsRes;
      setOrganisms(organismsList);
      
      setOrganismCategories(categoriesRes.results || categoriesRes);
      setInstitutions(institutionsRes.results || institutionsRes);
      
      // Build dashboard stats from fetched data
      setDashboardStats({
        total_countries: countriesList.length,
        total_projects: projectList.length,
        total_experts: expertsList.length,
        total_publications: publicationsList.length,
        total_protocols: (protocolsRes.results || protocolsRes).length,
        total_organisms: organismsList.length,
        total_events: (eventsRes.results || eventsRes).length,
        active_projects: projectList.filter(p => 
          p.status !== 'completed' && p.status !== 'suspended'
        ).length,
      });
      
      setNews(newsRes.results || newsRes);
      setEvents(eventsRes.results || eventsRes);
      setFundingOpportunities(fundingRes.results || fundingRes);
      setFaqs(faqsRes.results || faqsRes);
      setGlossary(glossaryRes.results || glossaryRes);
      setProtocols(protocolsRes.results || protocolsRes);
      setConsultations(consultationsRes.results || consultationsRes);

      // Build country data map
      const countryMap = {};
      countriesList.forEach(country => {
        const slug = country.slug || country.name.toLowerCase().replace(/\s+/g, '-');
        
        const countryProjects = projectList.filter(p => 
          p.country === country.id || p.country?.id === country.id
        );
        
        const countryPublications = publicationsList.filter(p => 
          p.country === country.id || p.country?.id === country.id
        );
        
        const countryExperts = expertsList.filter(e => 
          e.country === country.id || e.country?.id === country.id
        );
        
        const countryOrganisms = organismsList.filter(o => 
          o.country === country.id || o.country?.id === country.id
        );

        const readinessScore = country.readiness_score || 0;
        let activity = 'low';
        if (readinessScore >= 0.7) activity = 'high';
        else if (readinessScore >= 0.4) activity = 'medium';

        countryMap[slug] = {
          id: country.id,
          slug: slug,
          name: country.name,
          code: country.code,
          region: country.region,
          regionName: country.region_name,
          capital: country.capital || '',
          population: country.population || '',
          flag_emoji: country.flag_emoji || '',
          activity: activity,
          readinessScore: readinessScore,
          biosafetyStatus: country.biosafety_status || 'development',
          classificationApproach: country.classification_approach || 'none',
          internationalAlignment: country.international_alignment || '',
          gedGuidelines: country.ged_guidelines || '',
          activeProjects: country.active_projects || countryProjects.length,
          confinedFieldTrials: country.confined_field_trials || 0,
          publicationsCount: country.publications_count || countryPublications.length,
          researchersTrained: country.researchers_trained || 0,
          institutionsCount: country.institutions_count || country.institutions?.length || 0,
          fundingReceived: country.funding_received || 0,
          website: country.website || '',
          notes: country.notes || '',
          projects: countryProjects,
          publications: countryPublications,
          experts: countryExperts,
          organisms: countryOrganisms,
          priorityOrganismsList: countryOrganisms.map(o => o.common_name || o.name).join(', ') || 'No data available',
          agreements: extractAgreements(country),
          trend: country.notes || 'Genome editing research is developing in this country.',
          rawData: country
        };
      });

      setCountryData(countryMap);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      setCountryData(getStaticCountryData());
    } finally {
      setLoading(false);
    }
  }, []);

  // Select a country
  const selectCountry = useCallback(async (slug) => {
    setSelectedCountryId(slug);
    
    if (countryData[slug]) {
      setSelectedCountryDetail(countryData[slug].rawData || null);
    }
  }, [countryData]);

  // Load data on mount
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // This is the value object that was causing the syntax error
  const value = {
    loading,
    error,
    countries,
    countryData,
    regions,
    projects,
    publications,
    experts,
    organisms,
    organismCategories,
    institutions,
    dashboardStats,
    news,
    events,
    fundingOpportunities,
    faqs,
    glossary,
    protocols,
    consultations,
    selectedCountryId,
    selectedCountryDetail,
    selectCountry,
    refreshData: fetchAllData,
    getCountryBySlug: (slug) => countryData[slug],
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};