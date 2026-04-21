import React from 'react';

export default function CategoryLoading() {
  return (
    <div className="page-container">
      {/* HERO PILL SKELETON */}
      <div 
        className="skeleton" 
        style={{ 
          width: '140px', 
          height: '2rem', 
          borderRadius: '30px', 
          marginBottom: '1.5rem' 
        }} 
      />
      
      {/* TITLE SKELETON */}
      <div 
        className="skeleton skeleton-title" 
        style={{ width: '80%', maxWidth: '600px' }} 
      />
      
      {/* INTRO TEXT SKELETON */}
      <div className="skeleton-text skeleton" style={{ width: '100%' }} />
      <div className="skeleton-text skeleton" style={{ width: '95%' }} />
      <div className="skeleton-text skeleton" style={{ width: '40%', marginBottom: '3rem' }} />

      {/* POPULAR BRANDS SECTION */}
      <div style={{ marginTop: '3rem', marginBottom: '1rem', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: '200px', height: '2rem' }} />
      </div>
      
      <div className="brand-grid-hero">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className="skeleton" 
            style={{ 
              borderRadius: '16px', 
              height: '140px',
              width: '100%'
            }} 
          />
        ))}
      </div>

      {/* OTHER BRANDS SECTION */}
      <div style={{ marginTop: '3rem', marginBottom: '1rem', textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
        <div className="skeleton" style={{ width: '240px', height: '1.5rem' }} />
      </div>
      
      <div className="brand-grid-standard">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div 
            key={i} 
            className="skeleton" 
            style={{ 
              borderRadius: '12px', 
              height: '80px',
              width: '100%'
            }} 
          />
        ))}
      </div>
    </div>
  );
}
