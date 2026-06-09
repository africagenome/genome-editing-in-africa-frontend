import React, { useEffect, useRef } from 'react';

const MapSection = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (window.L && !mapRef.current) {
      const map = window.L.map('africaMap').setView([5, 20], 3);
      window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { 
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' 
      }).addTo(map);
      
      const readiness = { 
        "South Africa":0.85, "Kenya":0.78, "Nigeria":0.62, "Ghana":0.71, "Egypt":0.74, 
        "Morocco":0.70, "Rwanda":0.69, "Ethiopia":0.55, "Senegal":0.65, "Zambia":0.48, 
        "Botswana":0.73, "Tanzania":0.57, "Uganda":0.58, "Côte d'Ivoire":0.59 
      };
      
      const getColor = (s) => s >= 0.7 ? '#2C6E49' : s >= 0.55 ? '#D4A373' : s >= 0.4 ? '#BC6C25' : '#8A817C';
      
      fetch('https://raw.githubusercontent.com/georgemandis/africa-geojson/master/africa.geojson')
        .then(res => res.json())
        .then(data => {
          window.L.geoJSON(data, {
            style: (f) => {
              let name = f.properties?.name || f.properties?.ADMIN || "";
              let score = readiness[name] || 0.35;
              return { fillColor: getColor(score), weight: 1.2, color: '#4a627a', fillOpacity: 0.8 };
            },
            onEachFeature: (f, layer) => {
              let name = f.properties?.name || "African nation";
              let score = readiness[name] || 0.4;
              layer.bindTooltip(`<b>${name}</b><br>Readiness: ${score.toFixed(2)}`);
              layer.on('click', () => alert(`${name}\nGenome Editing Readiness Index: ${score.toFixed(2)}\nProjects: ${Math.floor(score*20)} ongoing`));
            }
          }).addTo(map);
        })
        .catch(() => {
          window.L.marker([-26.195,28.034]).addTo(map).bindPopup("AUDA-NEPAD Headquarters");
        });
      
      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <div className="section-title">
        <h2><i className="fas fa-map-marked-alt"></i> Genome Editing Readiness Index</h2>
        <div className="title-accent"></div>
      </div>
      <div className="map-container">
        <div id="africaMap" style={{ height: '450px', borderRadius: '28px', zIndex: 1 }}></div>
        <div className="map-legend" style={{ display: 'flex', gap: '28px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
          <div><span style={{ background: '#2C6E49', width: '18px', height: '12px', display: 'inline-block', borderRadius: '4px' }}></span> High readiness (≥0.7)</div>
          <div><span style={{ background: '#D4A373', width: '18px', height: '12px', display: 'inline-block', borderRadius: '4px' }}></span> Moderate (0.55–0.69)</div>
          <div><span style={{ background: '#BC6C25', width: '18px', height: '12px', display: 'inline-block', borderRadius: '4px' }}></span> Emerging (0.4–0.54)</div>
          <div><span style={{ background: '#8A817C', width: '18px', height: '12px', display: 'inline-block', borderRadius: '4px' }}></span> Early stage (&lt;0.4)</div>
        </div>
      </div>
    </>
  );
};

export default MapSection;