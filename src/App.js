// App.js

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
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
import Projects from './pages/Projects'; 
import RegulatoryFrameworks from './pages/RegulatoryFrameworks';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

import './styles/global.css';
import './styles/components.css';
import './styles/responsive.css';
import './styles/animations.css';

// Wrapper component for routing
const AppRoutes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchFilters, setSearchFilters] = useState(null);

  const handleLanguageChange = (e) => {
    alert(`🌍 Language: ${e.target.value} coming soon`);
  };

  const navigateToProjects = () => {
    navigate('/projects');
    window.scrollTo(0, 0);
  };

  const navigateToCountries = () => {
    navigate('/countries');
    window.scrollTo(0, 0);
  };

  const navigateToAdvancedSearch = () => {
    navigate('/search');
    window.scrollTo(0, 0);
  };

  const navigateToStakeholders = () => {
    navigate('/stakeholders');
    window.scrollTo(0, 0);
  };

  const navigateToInfrastructure = () => {
    navigate('/infrastructure');
    window.scrollTo(0, 0);
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
    window.scrollTo(0, 0);
  };

  const navigateToExperts = () => {
    navigate('/experts');
    window.scrollTo(0, 0);
  };

  const navigateToRegulatory = () => {
    navigate('/regulatory-frameworks');
    window.scrollTo(0, 0);
  };

  const navigateToHome = () => {
    navigate('/');
    window.scrollTo(0, 0);
  };

  const navigateToAbout = () => {
    navigate('/about');
    window.scrollTo(0, 0);
  };

  const navigateToContact = () => {
    navigate('/contact');
    window.scrollTo(0, 0);
  };

  const handleSearchResults = (filters) => {
    setSearchFilters(filters);
    navigate('/search-results', { state: { filters } });
    window.scrollTo(0, 0);
  };

  // Check if we're on a page that should show the home layout
  const isHomePage = location.pathname === '/';
  const isProjectsPage = location.pathname === '/projects' || location.pathname.startsWith('/projects/');
  const isCountriesPage = location.pathname === '/countries';
  const isSearchPage = location.pathname === '/search';
  const isSearchResultsPage = location.pathname === '/search-results';
  const isStakeholdersPage = location.pathname === '/stakeholders';
  const isInfrastructurePage = location.pathname === '/infrastructure';
  const isDashboardPage = location.pathname === '/dashboard';
  const isExpertsPage = location.pathname === '/experts';
  const isRegulatoryPage = location.pathname === '/regulatory-frameworks';
  const isAboutPage = location.pathname === '/about';
  const isContactPage = location.pathname === '/contact';

  // Page components with navigation props
  const pageProps = {
    onBackClick: navigateToHome,
    onProjectsClick: navigateToProjects,
    onCountriesClick: navigateToCountries,
    onSearchClick: navigateToAdvancedSearch,
    onStakeholdersClick: navigateToStakeholders,
    onInfrastructureClick: navigateToInfrastructure,
    onDashboardClick: navigateToDashboard,
    onExpertsClick: navigateToExperts,
    onRegulatoryClick: navigateToRegulatory,
    onAboutClick: navigateToAbout,
    onContactClick: navigateToContact,
  };

  return (
    <>
      {/* TopBar - visible on all pages */}
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
        onRegulatoryClick={navigateToRegulatory}
        onAboutClick={navigateToAbout}
        onContactClick={navigateToContact}
        currentPage={location.pathname}
      />

      <Routes>
        {/* Home Page */}
        <Route path="/" element={
          <>
            <Hero onOpenModal={navigateToAdvancedSearch} />
            {/* <div className="container">
              <StrategicPillars /> 
            </div> */}
            <InteractiveMap />
            {/* <div className="container">
              <Charts />
            </div> */}
            <ActionStripe 
              onProjectsClick={navigateToProjects}
              onCountriesClick={navigateToCountries}
              onStakeholdersClick={navigateToStakeholders}
              onInfrastructureClick={navigateToInfrastructure}
            />
          </>
        } />

        {/* Projects Page - API Powered */}
        <Route path="/projects" element={<Projects {...pageProps} />} />
        <Route path="/projects/:id" element={<Projects {...pageProps} />} />

        {/* Countries Page */}
        <Route path="/countries" element={<CountriesPage {...pageProps} />} />

        {/* Search Pages */}
        <Route path="/search" element={
          <AdvancedSearchPage 
            {...pageProps} 
            onSearchResults={handleSearchResults} 
          />
        } />
        <Route path="/search-results" element={
          <SearchResultsPage 
            {...pageProps} 
            filters={searchFilters} 
            onBackToSearch={navigateToAdvancedSearch}
          />
        } />

        {/* Stakeholders Page */}
        <Route path="/stakeholders" element={<StakeholdersPage {...pageProps} />} />

        {/* Infrastructure Page */}
        <Route path="/infrastructure" element={<InfrastructurePage {...pageProps} />} />

        {/* Dashboard Page */}
        <Route path="/dashboard" element={<DashboardPage {...pageProps} />} />

        {/* Experts Page */}
        <Route path="/experts" element={<ExpertsPage {...pageProps} />} />
        
        {/* Regulatory Frameworks Page */}
        <Route path="/regulatory-frameworks" element={<RegulatoryFrameworks onBackClick={navigateToHome} />} />

        {/* About Page */}
        <Route path="/about" element={<AboutPage onBackClick={navigateToHome} />} />

        {/* Contact Page */}
        <Route path="/contact" element={<ContactPage onBackClick={navigateToHome} />} />
      </Routes>

      {/* Global Search Modal */}
      <SearchModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {/* Footer - visible on all pages except maybe some */}
      {!isProjectsPage && !isCountriesPage && !isSearchPage && 
       !isSearchResultsPage && !isStakeholdersPage && !isInfrastructurePage && 
       !isDashboardPage && !isExpertsPage && !isRegulatoryPage && 
       !isAboutPage && !isContactPage && (
        <Footer />
      )}
      
      {/* Footer for other pages with different styling */}
      {(isProjectsPage || isCountriesPage || isSearchPage || 
        isSearchResultsPage || isStakeholdersPage || isInfrastructurePage || 
        isDashboardPage || isExpertsPage || isRegulatoryPage || 
        isAboutPage || isContactPage) && (
        <Footer variant="light" />
      )}
    </>
  );
};

// Main App component with DataProvider and Router
const App = () => {
  return (
    <DataProvider>
      <Router>
        <div className="app">
          <AppRoutes />
        </div>
      </Router>
    </DataProvider>
  );
};

export default App;