// services/apiService.js

const API_BASE_URL = 'https://www.genome.africa/api/v1';

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  async fetch(endpoint, options = {}) {
    const cacheKey = `${endpoint}-${JSON.stringify(options)}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      // Handle 404 gracefully - return empty data instead of throwing
      if (response.status === 404) {
        console.warn(`Endpoint not found: ${endpoint}`);
        return { results: [], count: 0 };
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error('API fetch error:', error);
      // Return empty data instead of throwing for 404s
      if (error.message.includes('404')) {
        return { results: [], count: 0 };
      }
      throw error;
    }
  }

  clearCache(endpoint = null) {
    if (endpoint) {
      for (const key of this.cache.keys()) {
        if (key.startsWith(endpoint)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Helper to clean empty params
  cleanParams(params) {
    const clean = {};
    Object.keys(params).forEach(key => {
      if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
        clean[key] = params[key];
      }
    });
    return clean;
  }

  // ============ COUNTRY ENDPOINTS ============
  async getCountries(params = {}) {
    const cleanParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanParams).toString();
    const endpoint = `/countries/${queryString ? `?${queryString}` : ''}`;
    return this.fetch(endpoint);
  }

  async getCountry(id) {
    return this.fetch(`/countries/${id}/`);
  }

  async getCountryProjects(id) {
    return this.fetch(`/countries/${id}/projects/`);
  }

  async getCountryPublications(id) {
    return this.fetch(`/countries/${id}/publications/`);
  }

  async getCountryExperts(id) {
    return this.fetch(`/countries/${id}/experts/`);
  }

  async getCountryOrganisms(id) {
    return this.fetch(`/countries/${id}/organisms/`);
  }

  async getCountryStats() {
    return this.fetch('/countries/stats/');
  }

  // ============ ORGANISM ENDPOINTS ============
  async getOrganisms(params = {}) {
    const cleanParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanParams).toString();
    const endpoint = `/organisms/${queryString ? `?${queryString}` : ''}`;
    return this.fetch(endpoint);
  }

  async getOrganism(id) {
    return this.fetch(`/organisms/${id}/`);
  }

  async getOrganismCategories() {
    return this.fetch('/organism-categories/');
  }

  async getOrganismsByCategory() {
    return this.fetch('/organisms/by_category/');
  }

  async getFeaturedOrganisms() {
    return this.fetch('/organisms/featured/');
  }

  async getOrganismProjects(id) {
    return this.fetch(`/organisms/${id}/projects/`);
  }

  async getOrganismStatistics(id) {
    return this.fetch(`/organisms/${id}/statistics/`);
  }

  // ============ PROJECT ENDPOINTS ============
  async getProjects(params = {}) {
    const cleanParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanParams).toString();
    const endpoint = `/projects/${queryString ? `?${queryString}` : ''}`;
    return this.fetch(endpoint);
  }

  async getProject(id) {
    return this.fetch(`/projects/${id}/`);
  }

  async getProjectsByStatus() {
    return this.fetch('/projects/by_status/');
  }

  async getProjectsByTechnology() {
    return this.fetch('/projects/by_technology/');
  }

  async getProjectsByOrganism() {
    return this.fetch('/projects/by_organism/');
  }

  async getProjectStats() {
    return this.fetch('/projects/stats/');
  }

  async getSimilarProjects(id) {
    return this.fetch(`/projects/${id}/similar_projects/`);
  }

  // ============ EXPERT ENDPOINTS ============
  async getExperts(params = {}) {
    const cleanParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanParams).toString();
    const endpoint = `/experts/${queryString ? `?${queryString}` : ''}`;
    return this.fetch(endpoint);
  }

  async getExpert(id) {
    return this.fetch(`/experts/${id}/`);
  }

  async getFeaturedExperts() {
    return this.fetch('/experts/featured/');
  }

  async getExpertPublications(id) {
    return this.fetch(`/experts/${id}/publications/`);
  }

  // ============ PUBLICATION ENDPOINTS ============
  async getPublications(params = {}) {
    const cleanParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanParams).toString();
    const endpoint = `/publications/${queryString ? `?${queryString}` : ''}`;
    return this.fetch(endpoint);
  }

  async getPublication(id) {
    return this.fetch(`/publications/${id}/`);
  }

  async getFeaturedPublications() {
    return this.fetch('/publications/featured/');
  }

  async getPublicationsByYear() {
    return this.fetch('/publications/by_year/');
  }

  async incrementPublicationDownload(id) {
    return this.fetch(`/publications/${id}/download/`, {
      method: 'POST'
    });
  }

  // ============ PROTOCOL ENDPOINTS ============
  async getProtocols(params = {}) {
    const cleanParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanParams).toString();
    const endpoint = `/protocols/${queryString ? `?${queryString}` : ''}`;
    return this.fetch(endpoint);
  }

  async getProtocol(id) {
    return this.fetch(`/protocols/${id}/`);
  }

  async getFeaturedProtocols() {
    return this.fetch('/protocols/featured/');
  }

  async getTopRatedProtocols() {
    return this.fetch('/protocols/top_rated/');
  }

  async rateProtocol(id, rating) {
    return this.fetch(`/protocols/${id}/rate/`, {
      method: 'POST',
      body: JSON.stringify({ rating })
    });
  }

  // ============ NEWS ENDPOINTS ============
  async getNews(params = {}) {
    const cleanParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanParams).toString();
    const endpoint = `/news/${queryString ? `?${queryString}` : ''}`;
    return this.fetch(endpoint);
  }

  async getNewsArticle(id) {
    return this.fetch(`/news/${id}/`);
  }

  async getFeaturedNews() {
    return this.fetch('/news/featured/');
  }

  async getLatestNews() {
    return this.fetch('/news/latest/');
  }

  async incrementNewsView(id) {
    return this.fetch(`/news/${id}/view/`, {
      method: 'POST'
    });
  }

  // ============ CONSULTATION ENDPOINTS ============
  async getConsultations(params = {}) {
    const cleanParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanParams).toString();
    const endpoint = `/consultations/${queryString ? `?${queryString}` : ''}`;
    return this.fetch(endpoint);
  }

  async getOpenConsultations() {
    return this.fetch('/consultations/open/');
  }

  async getConsultationsClosingSoon() {
    return this.fetch('/consultations/closing_soon/');
  }

  async submitConsultation(id, data) {
    return this.fetch(`/consultations/${id}/submit/`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ============ FAQ ENDPOINTS ============
  async getFAQs(params = {}) {
    const cleanParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanParams).toString();
    const endpoint = `/faqs/${queryString ? `?${queryString}` : ''}`;
    return this.fetch(endpoint);
  }

  async getFAQsByCategory() {
    return this.fetch('/faqs/by_category/');
  }

  // ============ GLOSSARY ENDPOINTS ============
  async getGlossary(params = {}) {
    const cleanParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanParams).toString();
    const endpoint = `/glossary/${queryString ? `?${queryString}` : ''}`;
    return this.fetch(endpoint);
  }

  // ============ FUNDING ENDPOINTS ============
  async getFunding(params = {}) {
    const cleanParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanParams).toString();
    const endpoint = `/funding/${queryString ? `?${queryString}` : ''}`;
    return this.fetch(endpoint);
  }

  async getOpenFunding() {
    return this.fetch('/funding/open/');
  }

  async getFundingClosingSoon() {
    return this.fetch('/funding/closing_soon/');
  }

  // ============ EVENT ENDPOINTS ============
  async getEvents(params = {}) {
    const cleanParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanParams).toString();
    const endpoint = `/events/${queryString ? `?${queryString}` : ''}`;
    return this.fetch(endpoint);
  }

  async getEvent(id) {
    return this.fetch(`/events/${id}/`);
  }

  async getUpcomingEvents() {
    return this.fetch('/events/upcoming/');
  }

  async getFeaturedEvents() {
    return this.fetch('/events/featured/');
  }

  async getEventsByCountry(countryCode) {
    return this.fetch(`/events/by_country/?country=${countryCode}`);
  }

  // ============ INSTITUTION ENDPOINTS ============
  async getInstitutions(params = {}) {
    const cleanParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanParams).toString();
    const endpoint = `/institutions/${queryString ? `?${queryString}` : ''}`;
    return this.fetch(endpoint);
  }

  async getInstitution(id) {
    return this.fetch(`/institutions/${id}/`);
  }

  async getInstitutionProjects(id) {
    return this.fetch(`/institutions/${id}/projects/`);
  }

  async getInstitutionExperts(id) {
    return this.fetch(`/institutions/${id}/experts/`);
  }

  async getInstitutionProtocols(id) {
    return this.fetch(`/institutions/${id}/protocols/`);
  }

  // ============ DASHBOARD ENDPOINTS ============
  async getDashboardStats() {
    try {
      // Try to get stats from projects endpoint as fallback
      const projects = await this.getProjects({ limit: 1 });
      const countries = await this.getCountries();
      const experts = await this.getExperts({ limit: 1 });
      const publications = await this.getPublications({ limit: 1 });
      
      return {
        total_countries: countries.count || 0,
        total_projects: projects.count || 0,
        total_experts: experts.count || 0,
        total_publications: publications.count || 0,
        total_protocols: 0,
        total_organisms: 0,
        total_events: 0,
        active_projects: 0,
      };
    } catch (error) {
      console.warn('Could not fetch dashboard stats:', error);
      return {
        total_countries: 0,
        total_projects: 0,
        total_experts: 0,
        total_publications: 0,
        total_protocols: 0,
        total_organisms: 0,
        total_events: 0,
        active_projects: 0,
      };
    }
  }

  // ============ REGION ENDPOINTS ============
  async getRegions() {
    return this.fetch('/regions/');
  }

  async getRegionCountries(id) {
    return this.fetch(`/regions/${id}/countries/`);
  }

  // ============ REGULATORY FRAMEWORK ENDPOINTS ============
  async getRegulatoryFrameworks(params = {}) {
    const cleanParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanParams).toString();
    const endpoint = `/regulatory-frameworks/${queryString ? `?${queryString}` : ''}`;
    return this.fetch(endpoint);
  }

  async getRegulatoryFrameworkDetail(id) {
    return this.fetch(`/regulatory-frameworks/${id}/`);
  }

  async getRegulatoryFrameworkStats() {
    return this.fetch('/regulatory-frameworks/stats/');
  }

  async getRegulatoryFrameworkByCountry(code) {
    return this.fetch(`/regulatory-frameworks/by_country/?code=${code}`);
  }

  async getRegulatoryFrameworkAgreements(id) {
    return this.fetch(`/regulatory-frameworks/${id}/agreements/`);
  }

  async getRegulatoryFrameworkInstitutions(id) {
    return this.fetch(`/regulatory-frameworks/${id}/institutions/`);
  }

  async getRegulatoryFrameworkInstruments(id) {
    return this.fetch(`/regulatory-frameworks/${id}/instruments/`);
  }

  async getRegulatoryFrameworkTimeline(id) {
    return this.fetch(`/regulatory-frameworks/${id}/timeline/`);
  }

  async getRegulatoryFrameworkGedStatus(id) {
    return this.fetch(`/regulatory-frameworks/${id}/ged_status/`);
  }

  // ============ INFRASTRUCTURE ENDPOINTS ============
  async getInfrastructureCategories(params = {}) {
    const cleanParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanParams).toString();
    const endpoint = `/infrastructure-categories/${queryString ? `?${queryString}` : ''}`;
    return this.fetch(endpoint);
  }

  async getLaboratoryFacilities(params = {}) {
    const cleanParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanParams).toString();
    const endpoint = `/laboratory-facilities/${queryString ? `?${queryString}` : ''}`;
    return this.fetch(endpoint);
  }

  async getLaboratoryFacility(id) {
    return this.fetch(`/laboratory-facilities/${id}/`);
  }

  async getLaboratoryFacilityStats() {
    return this.fetch('/laboratory-facilities/stats/');
  }

  async getLaboratoryFacilitiesByCountry(code) {
    return this.fetch(`/laboratory-facilities/by_country/?code=${code}`);
  }

  async getLaboratoryFacilityEquipment(id) {
    return this.fetch(`/laboratory-facilities/${id}/equipment/`);
  }

  async getEquipment(params = {}) {
    const cleanParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanParams).toString();
    const endpoint = `/equipment/${queryString ? `?${queryString}` : ''}`;
    return this.fetch(endpoint);
  }

  async getEquipmentStats() {
    return this.fetch('/equipment/stats/');
  }

  async getEquipmentByCountry(code) {
    return this.fetch(`/equipment/by_country/?code=${code}`);
  }

  async getInfrastructureProjects(params = {}) {
    const cleanParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanParams).toString();
    const endpoint = `/infrastructure-projects/${queryString ? `?${queryString}` : ''}`;
    return this.fetch(endpoint);
  }

  async getInfrastructureProject(id) {
    return this.fetch(`/infrastructure-projects/${id}/`);
  }

  async getInfrastructureProjectsByCountry(code) {
    return this.fetch(`/infrastructure-projects/by_country/?code=${code}`);
  }

  async getTrainingCapacities(params = {}) {
    const cleanParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanParams).toString();
    const endpoint = `/training-capacities/${queryString ? `?${queryString}` : ''}`;
    return this.fetch(endpoint);
  }

  async getFeaturedTraining() {
    return this.fetch('/training-capacities/featured/');
  }

  async getInfrastructureAssessments(params = {}) {
    const cleanParams = this.cleanParams(params);
    const queryString = new URLSearchParams(cleanParams).toString();
    const endpoint = `/infrastructure-assessments/${queryString ? `?${queryString}` : ''}`;
    return this.fetch(endpoint);
  }

  async getInfrastructureAssessment(id) {
    return this.fetch(`/infrastructure-assessments/${id}/`);
  }

  async getInfrastructureAssessmentsByCountry(code) {
    return this.fetch(`/infrastructure-assessments/by_country/?code=${code}`);
  }
}

export default new ApiService();