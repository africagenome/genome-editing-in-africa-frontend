import React from 'react';
import { useNavigate } from 'react-router-dom';

const Footer = ({ variant = 'default' }) => {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <footer className={`footer ${variant === 'light' ? 'footer-light' : ''}`}>
      <div className="container">
        <div className="footer-grid">
          {/* About Column */}
          <div className="footer-col">
            <h3>AUDA-NEPAD</h3>
            <p>Genome Editing for Agenda 2063: The Africa We Want, driven by science and inclusion.</p>
            <div className="footer-social">
              <a href="https://twitter.com/AUDA_NEPAD" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://www.linkedin.com/company/audanepad/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="https://www.youtube.com/c/AUDA-NEPAD" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <button onClick={() => handleNavigation('/')} className="footer-link">
                  <i className="fas fa-home"></i> Home
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/about')} className="footer-link">
                  <i className="fas fa-info-circle"></i> About Genome Editing Database for Agricultural Development in Africa
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/projects')} className="footer-link">
                  <i className="fas fa-project-diagram"></i> Projects
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/countries')} className="footer-link">
                  <i className="fas fa-globe-africa"></i> Countries
                </button>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li>
                <button onClick={() => handleNavigation('/stakeholders')} className="footer-link">
                  <i className="fas fa-handshake"></i> Stakeholders
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/experts')} className="footer-link">
                  <i className="fas fa-users"></i> Experts
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/regulatory-frameworks')} className="footer-link">
                  <i className="fas fa-gavel"></i> Regulatory Frameworks
                </button>
              </li>
              <li>
                <button onClick={() => handleNavigation('/infrastructure')} className="footer-link">
                  <i className="fas fa-microscope"></i> Infrastructure
                </button>
              </li>
            </ul>
          </div>
          
          {/* Contact Column */}
          <div className="footer-col">
            <h4>Contact</h4>
            <div className="footer-contact">
              <p>
                <i className="fas fa-map-marker-alt"></i>
                <span>230, 15th Road, Midrand, Johannesburg, South Africa</span>
              </p>
              <p>
                <i className="fas fa-phone"></i>
                <a href="tel:+27112563600">+27 11 256 3600</a>
              </p>
              <p>
                <i className="fas fa-envelope"></i>
                <a href="mailto:info@nepad.org">info@nepad.org</a>
              </p>
            </div>
            <div className="footer-cta">
              <button onClick={() => handleNavigation('/contact')} className="footer-contact-btn">
                <i className="fas fa-paper-plane"></i> Contact Us
              </button>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="copyright">
            © {new Date().getFullYear()} African Union Development Agency (AUDA-NEPAD) – 
            Empowering Africa through responsible genome editing & innovation.
          </div>
          <div className="footer-legal">
            <button onClick={() => handleNavigation('/about')} className="legal-link">About</button>
            <span className="legal-divider">|</span>
            <button onClick={() => handleNavigation('/contact')} className="legal-link">Contact</button>
            <span className="legal-divider">|</span>
            <button onClick={() => handleNavigation('/')} className="legal-link">Home</button>
          </div>
        </div>
      </div>

      <style>{`
        .footer {
          background: var(--color-gray-900, #111827);
          color: var(--color-gray-400, #9CA3AF);
          padding: 48px 0 24px;
          margin-top: 0px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .footer-light {
          background: var(--color-gray-800, #1F2937);
          border-top: 1px solid var(--color-gray-700, #374151);
        }

        .footer .container {
          max-width: var(--container-max-width, 1400px);
          margin: 0 auto;
          padding: 0 var(--container-padding, 2rem);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr;
          gap: 40px;
          margin-bottom: 32px;
        }

        .footer-col h3 {
          color: var(--color-white, #FFFFFF);
          font-size: var(--font-size-lg, 1.125rem);
          font-weight: var(--font-bold, 700);
          margin: 0 0 12px;
        }

        .footer-col h4 {
          color: var(--color-white, #FFFFFF);
          font-size: var(--font-size-sm, 0.875rem);
          font-weight: var(--font-semibold, 600);
          margin: 0 0 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .footer-col p {
          color: var(--color-gray-400, #9CA3AF);
          font-size: var(--font-size-sm, 0.875rem);
          line-height: 1.6;
          margin: 0 0 12px;
        }

        .footer-col ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-col ul li {
          margin-bottom: 8px;
        }

        .footer-link {
          background: none;
          border: none;
          color: var(--color-gray-400, #9CA3AF);
          font-size: var(--font-size-sm, 0.875rem);
          cursor: pointer;
          padding: 4px 0;
          transition: all var(--transition-base, 0.25s ease);
          font-family: var(--font-family, 'Inter', sans-serif);
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .footer-link:hover {
          color: var(--color-secondary, #B4A269);
          transform: translateX(4px);
        }

        .footer-link i {
          font-size: var(--font-size-xs, 0.75rem);
          width: 16px;
          color: var(--color-secondary, #B4A269);
        }

        /* Social Icons */
        .footer-social {
          display: flex;
          gap: 12px;
          margin-top: 16px;
        }

        .footer-social a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-full, 9999px);
          color: var(--color-gray-400, #9CA3AF);
          font-size: var(--font-size-base, 1rem);
          transition: all var(--transition-base, 0.25s ease);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .footer-social a:hover {
          background: var(--color-secondary, #B4A269);
          color: var(--color-white, #FFFFFF);
          transform: translateY(-3px);
          border-color: var(--color-secondary, #B4A269);
          box-shadow: 0 4px 12px rgba(180, 162, 105, 0.3);
        }

        /* Contact */
        .footer-contact p {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 8px;
          font-size: var(--font-size-sm, 0.875rem);
          color: var(--color-gray-400, #9CA3AF);
          line-height: 1.5;
        }

        .footer-contact i {
          color: var(--color-secondary, #B4A269);
          margin-top: 2px;
          width: 16px;
          flex-shrink: 0;
        }

        .footer-contact a {
          color: var(--color-gray-400, #9CA3AF);
          text-decoration: none;
          transition: color var(--transition-base, 0.25s ease);
        }

        .footer-contact a:hover {
          color: var(--color-secondary, #B4A269);
        }

        .footer-cta {
          margin-top: 16px;
        }

        .footer-contact-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 20px;
          background: var(--color-primary-gradient, linear-gradient(135deg, #5B7E96 0%, #3D5A6E 100%));
          color: var(--color-white, #FFFFFF);
          border: none;
          border-radius: var(--radius-full, 9999px);
          font-size: var(--font-size-sm, 0.875rem);
          font-weight: var(--font-semibold, 600);
          cursor: pointer;
          transition: all var(--transition-bounce, 0.4s ease);
          font-family: var(--font-family, 'Inter', sans-serif);
        }

        .footer-contact-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(91, 126, 150, 0.3);
        }

        /* Footer Bottom */
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .copyright {
          font-size: var(--font-size-xs, 0.75rem);
          color: var(--color-gray-500, #6B7280);
        }

        .footer-legal {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .legal-link {
          background: none;
          border: none;
          color: var(--color-gray-500, #6B7280);
          font-size: var(--font-size-xs, 0.75rem);
          cursor: pointer;
          transition: color var(--transition-base, 0.25s ease);
          font-family: var(--font-family, 'Inter', sans-serif);
          padding: 4px 0;
        }

        .legal-link:hover {
          color: var(--color-secondary, #B4A269);
        }

        .legal-divider {
          color: var(--color-gray-700, #374151);
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 32px;
          }
        }

        @media (max-width: 768px) {
          .footer {
            padding: 32px 0 20px;
          }

          .footer-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .footer-bottom {
            flex-direction: column;
            text-align: center;
            gap: 12px;
          }

          .footer-legal {
            flex-wrap: wrap;
            justify-content: center;
          }

          .footer-social {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .footer-col {
            text-align: center;
          }

          .footer-contact p {
            justify-content: center;
          }

          .footer-link {
            justify-content: center;
          }

          .footer-cta {
            text-align: center;
          }
        }

        /* ===== DARK MODE ===== */
        @media (prefers-color-scheme: dark) {
          .footer {
            background: var(--color-gray-900, #111827);
            border-top-color: var(--color-gray-800, #1F2937);
          }

          .footer-light {
            background: var(--color-gray-800, #1F2937);
            border-top-color: var(--color-gray-700, #374151);
          }

          .footer-social a {
            background: rgba(255, 255, 255, 0.03);
            border-color: rgba(255, 255, 255, 0.03);
          }

          .footer-social a:hover {
            background: var(--color-secondary, #B4A269);
            color: var(--color-white, #FFFFFF);
            border-color: var(--color-secondary, #B4A269);
          }

          .footer-contact-btn {
            background: var(--color-primary-gradient, linear-gradient(135deg, #5B7E96 0%, #3D5A6E 100%));
          }

          .legal-divider {
            color: var(--color-gray-600, #4B5563);
          }
        }

        /* ===== REDUCED MOTION ===== */
        @media (prefers-reduced-motion: reduce) {
          .footer-link,
          .footer-social a,
          .footer-contact-btn,
          .footer-contact a,
          .legal-link {
            transition: none !important;
          }

          .footer-link:hover,
          .footer-social a:hover,
          .footer-contact-btn:hover,
          .legal-link:hover {
            transform: none !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;