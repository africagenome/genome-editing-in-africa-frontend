import React, { useEffect, useRef } from 'react';

const Charts = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (window.Chart && !chartRef.current) {
      const ctx = document.getElementById('sectorChart').getContext('2d');
      chartRef.current = new window.Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Agriculture & Food', 'Human Health', 'Environmental', 'Regulatory', 'Capacity Building'],
          datasets: [{
            label: 'Active Projects',
            data: [22, 14, 6, 8, 17],
            backgroundColor: ['#5B7E96', '#B4A269', '#6C9EBF', '#D4A373', '#4F7C6B'],
            borderRadius: 12,
            barPercentage: 0.7
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: { 
            legend: { position: 'top' }, 
            tooltip: { backgroundColor: '#2D4A5E' } 
          },
          scales: { 
            y: { 
              beginAtZero: true, 
              title: { display: true, text: 'Number of Projects' } 
            } 
          }
        }
      });
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, []);

  return (
    <div className="chart-container">
      <h3 style={{ marginBottom: '20px', fontWeight: 700, textAlign: 'center' }}>
        <i className="fas fa-chart-line"></i> Genome Editing Projects by Sector (2026)
      </h3>
      <canvas id="sectorChart" width="400" height="200" style={{ maxHeight: '360px' }}></canvas>
      <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: 'var(--auda-primary)' }}>
        Data: AUDA-NEPAD Genomics Observatory | 47 active projects across Africa
      </p>
    </div>
  );
};

export default Charts;