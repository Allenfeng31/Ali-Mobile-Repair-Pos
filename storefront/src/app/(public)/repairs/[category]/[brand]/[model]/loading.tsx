import React from 'react';

export default function ModelLoading() {
  return (
    <div className="page-container" style={{ maxWidth: "900px" }}>
      {/* BREADCRUMBS SKELETON */}
      <div 
        className="skeleton" 
        style={{ width: '200px', height: '1rem', marginBottom: '2rem' }} 
      />

      {/* TITLE SKELETON */}
      <div 
        className="skeleton skeleton-title" 
        style={{ width: '70%', margin: '0 auto 0.5rem' }} 
      />
      
      {/* SUBTITLE SKELETON */}
      <div 
        className="skeleton" 
        style={{ width: '50%', height: '1rem', margin: '0 auto 2.5rem' }} 
      />

      {/* REPAIR OPTIONS GRID SKELETON */}
      <div className="repair-option-grid">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div 
            key={i} 
            className="skeleton" 
            style={{ 
              borderRadius: '16px', 
              height: '80px',
              width: '100%'
            }} 
          />
        ))}
      </div>

      {/* CTA SECTION SKELETON */}
      <div
        className="skeleton"
        style={{
          marginTop: "3rem",
          borderRadius: "20px",
          height: "220px",
          width: "100%"
        }}
      />
    </div>
  );
}
