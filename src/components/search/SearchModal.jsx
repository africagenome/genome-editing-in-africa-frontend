// components/search/SearchModal.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import './SearchModal.css';

const SearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
        setShowSuggestions(true);
      }, 150);
    }
  }, [isOpen]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        performSearch();
      } else {
        setResults([]);
        setSuggestions([]);
        setSelectedIndex(-1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, searchType]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      // Escape to close
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Arrow navigation
      if (results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
          e.preventDefault();
          handleResultClick(results[selectedIndex]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const query = searchQuery.trim();
      const searchResults = [];

      // Search based on type
      if (searchType === 'all' || searchType === 'projects') {
        const projects = await apiService.getProjects({ search: query, limit: 5 });
        if (projects.results || projects) {
          const data = projects.results || projects;
          searchResults.push(...data.map(item => ({ ...item, type: 'project' })));
        }
      }

      if (searchType === 'all' || searchType === 'countries') {
        const countries = await apiService.getCountries({ search: query, limit: 5 });
        if (countries.results || countries) {
          const data = countries.results || countries;
          searchResults.push(...data.map(item => ({ ...item, type: 'country' })));
        }
      }

      if (searchType === 'all' || searchType === 'experts') {
        const experts = await apiService.getExperts({ search: query, limit: 5 });
        if (experts.results || experts) {
          const data = experts.results || experts;
          searchResults.push(...data.map(item => ({ ...item, type: 'expert' })));
        }
      }

      if (searchType === 'all' || searchType === 'publications') {
        const publications = await apiService.getPublications({ search: query, limit: 5 });
        if (publications.results || publications) {
          const data = publications.results || publications;
          searchResults.push(...data.map(item => ({ ...item, type: 'publication' })));
        }
      }

      if (searchType === 'all' || searchType === 'institutions') {
        const institutions = await apiService.getInstitutions({ search: query, limit: 5 });
        if (institutions.results || institutions) {
          const data = institutions.results || institutions;
          searchResults.push(...data.map(item => ({ ...item, type: 'institution' })));
        }
      }

      setResults(searchResults);
      setSelectedIndex(-1);
      
      // Generate suggestions
      if (searchResults.length === 0 && query.length >= 3) {
        setSuggestions([
          { icon: 'fa-search', text: `Search for "${query}" in all categories` },
          { icon: 'fa-globe', text: 'Try searching for a specific country or institution' },
          { icon: 'fa-microscope', text: 'Browse projects by technology type (CRISPR, TALENs)' }
        ]);
      } else {
        setSuggestions([]);
      }

    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchType]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    // Save to recent searches
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    // Navigate to search results page
    const params = new URLSearchParams();
    params.append('q', searchQuery);
    if (searchType !== 'all') {
      params.append('type', searchType);
    }
    
    onClose();
    navigate(`/search-results?${params.toString()}`);
  };

  const handleResultClick = (result) => {
    onClose();
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
      expert: 'fa-user-circle',
      publication: 'fa-file-alt',
      institution: 'fa-university'
    };
    return icons[type] || 'fa-circle';
  };

  const getTypeColor = (type) => {
    const colors = {
      project: '#5B7E96',
      country: '#B4A269',
      expert: '#8B5CF6',
      publication: '#10B981',
      institution: '#F59E0B'
    };
    return colors[type] || '#6B7280';
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

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-header">
          <div className="header-left">
            <i className="fas fa-search header-icon"></i>
            <h2>Search Database</h2>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close search">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="search-modal-body">
          <div className="search-input-wrapper">
            <div className="search-type-selector">
              <select 
                value={searchType} 
                onChange={(e) => setSearchType(e.target.value)}
                className="search-type-select"
                aria-label="Search category"
              >
                <option value="all">All Categories</option>
                <option value="projects">Projects</option>
                <option value="countries">Countries</option>
                <option value="experts">Experts</option>
                <option value="publications">Publications</option>
                <option value="institutions">Institutions</option>
              </select>
            </div>
            <div className="search-input-container">
              <i className="fas fa-search input-icon"></i>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search genome editing database..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                aria-label="Search query"
              />
              {searchQuery && (
                <button 
                  className="clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <i className="fas fa-times-circle"></i>
                </button>
              )}
              <button 
                className="search-submit-btn" 
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
                aria-label="Submit search"
              >
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchQuery.length >= 2 && (
            <div className="search-results-container" ref={resultsRef}>
              {loading ? (
                <div className="search-loading">
                  <div className="spinner"></div>
                  <p>Searching...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="search-results">
                  <div className="results-header">
                    <span className="results-count">
                      <i className="fas fa-list-ul"></i>
                      {results.length} result{results.length > 1 ? 's' : ''} found
                    </span>
                    <button className="view-all-btn" onClick={handleSearch}>
                      View all <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                  <div className="results-list">
                    {results.slice(0, 8).map((result, index) => (
                      <div 
                        key={`${result.type}-${result.id}-${index}`}
                        className={`result-item ${selectedIndex === index ? 'selected' : ''}`}
                        onClick={() => handleResultClick(result)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <div className="result-icon" style={{ backgroundColor: `${getTypeColor(result.type)}15`, color: getTypeColor(result.type) }}>
                          <i className={`fas ${getTypeIcon(result.type)}`}></i>
                        </div>
                        <div className="result-content">
                          <div className="result-title">
                            {result.title || result.name}
                          </div>
                          <div className="result-meta">
                            <span className="result-type" style={{ backgroundColor: `${getTypeColor(result.type)}15`, color: getTypeColor(result.type) }}>
                              {getTypeLabel(result.type)}
                            </span>
                            {result.country_name && (
                              <span className="result-country">
                                <i className="fas fa-map-marker-alt"></i> {result.country_name}
                              </span>
                            )}
                            {result.authors && (
                              <span className="result-authors">
                                <i className="fas fa-user"></i> {result.authors}
                              </span>
                            )}
                          </div>
                          {result.description && (
                            <div className="result-description">
                              {result.description.substring(0, 100)}...
                            </div>
                          )}
                        </div>
                        <div className="result-arrow">
                          <i className="fas fa-chevron-right"></i>
                        </div>
                      </div>
                    ))}
                  </div>
                  {results.length > 8 && (
                    <div className="results-footer">
                      <button className="view-all-btn primary" onClick={handleSearch}>
                        <i className="fas fa-search"></i> View all {results.length} results
                      </button>
                    </div>
                  )}
                </div>
              ) : suggestions.length > 0 ? (
                <div className="search-suggestions">
                  <div className="suggestions-icon">
                    <i className="fas fa-lightbulb"></i>
                  </div>
                  <h4>No results found</h4>
                  <p>Try adjusting your search terms</p>
                  <div className="suggestion-items">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="suggestion-item">
                        <i className={`fas ${suggestion.icon}`}></i>
                        <span>{suggestion.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                searchQuery.length >= 2 && (
                  <div className="search-initial">
                    <i className="fas fa-search"></i>
                    <p>Type at least 2 characters to start searching</p>
                  </div>
                )
              )}
            </div>
          )}

          {/* Recent Searches */}
          {searchQuery.length < 2 && recentSearches.length > 0 && (
            <div className="recent-searches">
              <div className="recent-header">
                <h4><i className="fas fa-clock"></i> Recent Searches</h4>
                <button 
                  className="clear-recent-btn"
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem('recentSearches');
                  }}
                >
                  <i className="fas fa-trash-alt"></i> Clear
                </button>
              </div>
              <div className="recent-items">
                {recentSearches.map((search, index) => (
                  <button 
                    key={index} 
                    className="recent-item"
                    onClick={() => {
                      setSearchQuery(search);
                      setShowSuggestions(true);
                    }}
                  >
                    <i className="fas fa-history"></i>
                    <span>{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Tips */}
          {searchQuery.length < 2 && (
            <div className="search-tips">
              <h4><i className="fas fa-info-circle"></i> Search Tips</h4>
              <ul>
                <li>Search by country name to find projects and institutions</li>
                <li>Use expert names to find publications and projects</li>
                <li>Search by technology type (e.g., CRISPR, TALENs)</li>
                <li>Filter by category for more specific results</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;