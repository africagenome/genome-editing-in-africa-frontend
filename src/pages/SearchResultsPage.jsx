// pages/SearchResultsPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import './SearchResultsPage.css';

const SearchResultsPage = ({ onBackToHome, onBackToSearch }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [totalCount, setTotalCount] = useState(0);
  const [activeTab, setActiveTab] = useState('all');

  // Parse URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    const type = params.get('type') || 'all';
    setSearchQuery(query);
    setSearchType(type);
    setActiveTab(type);

    if (query) {
      performSearch(query, type);
    } else {
      setLoading(false);
    }
  }, [location.search]);

  const performSearch = useCallback(async (query, type) => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const allResults = [];
      let total = 0;

      const searchPromises = [];

      if (type === 'all' || type === 'projects') {
        searchPromises.push(
          apiService.getProjects({ search: query, limit: 20 })
            .then(data => {
              const items = data.results || data || [];
              total += items.length;
              return items.map(item => ({ ...item, type: 'project' }));
            })
        );
      }

      if (type === 'all' || type === 'countries') {
        searchPromises.push(
          apiService.getCountries({ search: query, limit: 20 })
            .then(data => {
              const items = data.results || data || [];
              total += items.length;
              return items.map(item => ({ ...item, type: 'country' }));
            })
        );
      }

      if (type === 'all' || type === 'experts') {
        searchPromises.push(
          apiService.getExperts({ search: query, limit: 20 })
            .then(data => {
              const items = data.results || data || [];
              total += items.length;
              return items.map(item => ({ ...item, type: 'expert' }));
            })
        );
      }

      if (type === 'all' || type === 'publications') {
        searchPromises.push(
          apiService.getPublications({ search: query, limit: 20 })
            .then(data => {
              const items = data.results || data || [];
              total += items.length;
              return items.map(item => ({ ...item, type: 'publication' }));
            })
        );
      }

      if (type === 'all' || type === 'institutions') {
        searchPromises.push(
          apiService.getInstitutions({ search: query, limit: 20 })
            .then(data => {
              const items = data.results || data || [];
              total += items.length;
              return items.map(item => ({ ...item, type: 'institution' }));
            })
        );
      }

      const results = await Promise.all(searchPromises);
      const flattened = results.flat();

      // Sort by relevance (simple: exact matches first)
      const sorted = flattened.sort((a, b) => {
        const aMatch = (a.title || a.name || '').toLowerCase().includes(query.toLowerCase());
        const bMatch = (b.title || b.name || '').toLowerCase().includes(query.toLowerCase());
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });

      setResults(sorted);
      setTotalCount(sorted.length);

    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleResultClick = (result) => {
    if (result.type === 'project') {
      navigate(`/projects/${result.id}`);
    } else if (result.type === 'country') {
      navigate(`/countries?country=${result.id}`);
    } else if (result.type === 'expert') {
      navigate(`/experts?expert=${result.id}`);
    } else if (result.type === 'publication') {
      navigate(`/publications/${result.id}`);
    } else if (result.type === 'institution') {
      navigate(`/stakeholders?institution=${result.id}`);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      project: 'fa-project-diagram',
      country: 'fa-globe-africa',
      expert: 'fa-user',
      publication: 'fa-file-alt',
      institution: 'fa-university'
    };
    return icons[type] || 'fa-circle';
  };

  const getTypeLabel = (type) => {
    const labels = {
      project: 'Project',
      country: 'Country',
      expert: 'Expert',
      publication: 'Publication',
      institution: 'Institution'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      project: '#5B7E96',
      country: '#B4A269',
      expert: '#2C6E49',
      publication: '#6C9EBF',
      institution: '#D4A373'
    };
    return colors[type] || '#8a8aaa';
  };

  const getStatusBadge = (status) => {
    const map = {
      'functional': 'Functional Framework',
      'implemented': 'Functional Framework',
      'draft': 'Draft Guidelines',
      'development': 'Policy Development',
      'under_review': 'Under Review',
      'none': 'No Framework',
      'planning': 'Planning',
      'rd': 'R&D',
      'cft': 'Confined Field Trial',
      'commercial': 'Commercial Release',
      'completed': 'Completed',
      'suspended': 'Suspended'
    };
    return map[status] || status;
  };

  const filteredResults = activeTab === 'all' 
    ? results 
    : results.filter(r => r.type === activeTab);

  const tabCounts = {
    all: results.length,
    project: results.filter(r => r.type === 'project').length,
    country: results.filter(r => r.type === 'country').length,
    expert: results.filter(r => r.type === 'expert').length,
    publication: results.filter(r => r.type === 'publication').length,
    institution: results.filter(r => r.type === 'institution').length
  };

  if (loading) {
    return (
      <div className="search-results-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Searching for "{searchQuery}"...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-page">
      {/* Header */}
      <header className="search-results-header">
        <div className="container">
          <div className="header-content">
            <button onClick={onBackToHome} className="back-home-btn">
              <i className="fas fa-arrow-left"></i> Home
            </button>
            <button onClick={onBackToSearch} className="back-search-btn">
              <i className="fas fa-search"></i> New Search
            </button>
          </div>
          <div className="search-summary">
            <h1>
              <i className="fas fa-search"></i> 
              {searchQuery ? ` Results for "${searchQuery}"` : 'Search Results'}
            </h1>
            {!error && (
              <p className="results-count-summary">
                Found {totalCount} {totalCount === 1 ? 'result' : 'results'}
                {searchType !== 'all' && ` in ${getTypeLabel(searchType)}`}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="container">
        {error ? (
          <div className="error-state">
            <i className="fas fa-exclamation-circle"></i>
            <h3>Search Error</h3>
            <p>{error}</p>
            <button onClick={() => performSearch(searchQuery, searchType)} className="retry-btn">
              <i className="fas fa-redo"></i> Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="search-tabs">
              <button
                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All ({tabCounts.all})
              </button>
              {tabCounts.project > 0 && (
                <button
                  className={`tab-btn ${activeTab === 'project' ? 'active' : ''}`}
                  onClick={() => setActiveTab('project')}
                >
                  <i className="fas fa-project-diagram"></i> Projects ({tabCounts.project})
                </button>
              )}
              {tabCounts.country > 0 && (
                <button
                  className={`tab-btn ${activeTab === 'country' ? 'active' : ''}`}
                  onClick={() => setActiveTab('country')}
                >
                  <i className="fas fa-globe-africa"></i> Countries ({tabCounts.country})
                </button>
              )}
              {tabCounts.expert > 0 && (
                <button
                  className={`tab-btn ${activeTab === 'expert' ? 'active' : ''}`}
                  onClick={() => setActiveTab('expert')}
                >
                  <i className="fas fa-user"></i> Experts ({tabCounts.expert})
                </button>
              )}
              {tabCounts.publication > 0 && (
                <button
                  className={`tab-btn ${activeTab === 'publication' ? 'active' : ''}`}
                  onClick={() => setActiveTab('publication')}
                >
                  <i className="fas fa-file-alt"></i> Publications ({tabCounts.publication})
                </button>
              )}
              {tabCounts.institution > 0 && (
                <button
                  className={`tab-btn ${activeTab === 'institution' ? 'active' : ''}`}
                  onClick={() => setActiveTab('institution')}
                >
                  <i className="fas fa-university"></i> Institutions ({tabCounts.institution})
                </button>
              )}
            </div>

            {/* Results */}
            {filteredResults.length === 0 ? (
              <div className="no-results">
                <i className="fas fa-search"></i>
                <h3>No results found</h3>
                <p>Try adjusting your search terms or filters</p>
                <button onClick={onBackToSearch} className="new-search-btn">
                  <i className="fas fa-search"></i> New Search
                </button>
              </div>
            ) : (
              <div className="results-grid">
                {filteredResults.map((result, index) => (
                  <div 
                    key={`${result.type}-${result.id}-${index}`} 
                    className="result-card"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="result-card-header">
                      <div className="result-type-badge" style={{ background: getTypeColor(result.type) }}>
                        <i className={`fas ${getTypeIcon(result.type)}`}></i>
                        {getTypeLabel(result.type)}
                      </div>
                      {result.status && (
                        <span className="result-status">{getStatusBadge(result.status)}</span>
                      )}
                    </div>
                    <h3 className="result-card-title">{result.title || result.name}</h3>
                    {result.country_name && (
                      <div className="result-card-meta">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{result.country_name}</span>
                      </div>
                    )}
                    {result.authors && (
                      <div className="result-card-meta">
                        <i className="fas fa-user"></i>
                        <span>{result.authors}</span>
                      </div>
                    )}
                    {result.institution_name && (
                      <div className="result-card-meta">
                        <i className="fas fa-building"></i>
                        <span>{result.institution_name}</span>
                      </div>
                    )}
                    {result.year && (
                      <div className="result-card-meta">
                        <i className="fas fa-calendar"></i>
                        <span>{result.year}</span>
                      </div>
                    )}
                    {result.description && (
                      <p className="result-card-description">
                        {result.description.substring(0, 150)}...
                      </p>
                    )}
                    <div className="result-card-footer">
                      <span className="view-details">
                        View Details <i className="fas fa-arrow-right"></i>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;