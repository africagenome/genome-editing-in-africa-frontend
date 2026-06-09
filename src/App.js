import React, { useState } from 'react';
import TopBar from './components/layout/TopBar';
import Footer from './components/layout/Footer';
import ActionStripe from './components/layout/ActionStripe';
import Hero from './components/sections/Hero';
import StrategicPillars from './components/sections/StrategicPillars';
import Charts from './components/sections/Charts';
import InteractiveMap from './components/sections/InteractiveMap';
import SearchModal from './components/search/SearchModal';
import ProjectsPage from './pages/ProjectsPage';
import CountriesPage from './pages/CountriesPage';
import AdvancedSearchPage from './pages/AdvancedSearchPage';
import SearchResultsPage from './pages/SearchResultsPage';
import StakeholdersPage from './pages/StakeholdersPage';
import InfrastructurePage from './pages/InfrastructurePage';
import DashboardPage from './pages/DashboardPage';
import ExpertsPage from './pages/ExpertsPage';
import './styles/global.css';
import './styles/components.css';
import './styles/responsive.css';
import './styles/animations.css';

const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [searchFilters, setSearchFilters] = useState(null);

  const handleLanguageChange = (e) => {
    alert(`🌍 Language demo: ${e.target.value} translation ready`);
  };

  const navigateToProjects = () => {
    setCurrentPage('projects');
    window.scrollTo(0, 0);
  };

  const navigateToCountries = () => {
    setCurrentPage('countries');
    window.scrollTo(0, 0);
  };

  const navigateToAdvancedSearch = () => {
    setCurrentPage('advanced-search');
    window.scrollTo(0, 0);
  };

  const navigateToStakeholders = () => {
    setCurrentPage('stakeholders');
    window.scrollTo(0, 0);
  };

  const navigateToInfrastructure = () => {
    setCurrentPage('infrastructure');
    window.scrollTo(0, 0);
  };

  const navigateToDashboard = () => {
    setCurrentPage('dashboard');
    window.scrollTo(0, 0);
  };

  const navigateToExperts = () => {
    setCurrentPage('experts');
    window.scrollTo(0, 0);
  };

  const handleSearchResults = (filters) => {
    setSearchFilters(filters);
    setCurrentPage('search-results');
    window.scrollTo(0, 0);
  };

  const navigateToHome = () => {
    setCurrentPage('home');
    window.scrollTo(0, 0);
  };

  if (currentPage === 'projects') {
    return <ProjectsPage onBackClick={navigateToHome} />;
  }

  if (currentPage === 'countries') {
    return <CountriesPage onBackClick={navigateToHome} />;
  }

  if (currentPage === 'advanced-search') {
    return <AdvancedSearchPage onBackClick={navigateToHome} onSearchResults={handleSearchResults} />;
  }

  if (currentPage === 'search-results' && searchFilters) {
    return <SearchResultsPage filters={searchFilters} onBackToSearch={navigateToAdvancedSearch} onBackToHome={navigateToHome} />;
  }

  if (currentPage === 'stakeholders') {
    return <StakeholdersPage onBackClick={navigateToHome} />;
  }

  if (currentPage === 'infrastructure') {
    return <InfrastructurePage onBackClick={navigateToHome} />;
  }

  if (currentPage === 'dashboard') {
    return <DashboardPage onBackClick={navigateToHome} />;
  }

  if (currentPage === 'experts') {
    return <ExpertsPage onBackClick={navigateToHome} />;
  }

  return (
    <div className="app">
      <TopBar 
        onLanguageChange={handleLanguageChange} 
        onOpenModal={() => setIsModalOpen(true)} 
        onProjectsClick={navigateToProjects}
        onCountriesClick={navigateToCountries}
        onSearchClick={navigateToAdvancedSearch}
        onStakeholdersClick={navigateToStakeholders}
        onInfrastructureClick={navigateToInfrastructure}
        onDashboardClick={navigateToDashboard}
        onExpertsClick={navigateToExperts}
      />
      
      <Hero onOpenModal={navigateToAdvancedSearch} />
      
      {/* <div className="container">
        <StrategicPillars /> 
      </div> */}      

      <InteractiveMap />
{/* 
      <div className="container">
        <Charts />
      </div> */}

      <SearchModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      <ActionStripe 
        onProjectsClick={navigateToProjects}
        onCountriesClick={navigateToCountries}
        onStakeholdersClick={navigateToStakeholders}
        onInfrastructureClick={navigateToInfrastructure}
      />
      <Footer />
    </div>
  );
};

export default App;