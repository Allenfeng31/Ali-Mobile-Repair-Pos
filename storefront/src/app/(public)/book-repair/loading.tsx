import React from 'react';

export default function BookingLoading() {
  return (
    <div className="page-container">
      {/* TITLE & DESCRIPTION SKELETON */}
      <div 
        className="skeleton" 
        style={{ width: '40%', height: '2.5rem', margin: '0 auto 1rem' }} 
      />
      <div 
        className="skeleton" 
        style={{ width: '60%', height: '1.2rem', margin: '0 auto 2rem' }} 
      />

      {/* REPAIR CART SKELETON */}
      <div 
        className="skeleton" 
        style={{ width: '100%', height: '400px', borderRadius: '24px', marginBottom: '2rem' }} 
      />

      {/* FORM SKELETON */}
      <div 
        className="skeleton" 
        style={{ width: '100%', height: '600px', borderRadius: '20px' }} 
      />
    </div>
  );
}
