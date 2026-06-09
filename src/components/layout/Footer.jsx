import React from 'react';

const Footer = () => {
  return (
    <footer>
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h3 style={{ color: 'white', marginBottom: '16px' }}>AUDA-NEPAD</h3>
            <p>Genome Editing for Agenda 2063 — The Africa We Want, driven by science and inclusion.</p>
          </div>
          
          <div className="footer-col">
            <h4>Quick links</h4>
            <ul>
              <li><a href="#">Strategic roadmap</a></li>
              <li><a href="#">Ethics framework</a></li>
              <li><a href="#">Countries</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Engage</h4>
            <ul>
              <li><a href="#">Become an expert</a></li>
              <li><a href="#">Social Media toolkit</a></li>
            </ul>
          </div>
          
          <div className="footer-col">
            <h4>Contact</h4>
            <p>Midrand, South Africa<br />info@nepad.org</p>
          </div>
        </div>
        
        <div className="copyright">
          © 2026 African Union Development Agency (AUDA-NEPAD) – Empowering Africa through responsible genome editing & innovation.
        </div>
      </div>
    </footer>
  );
};

export default Footer;