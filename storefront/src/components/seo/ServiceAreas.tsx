"use client";

import React from 'react';

export default function ServiceAreas() {
  // Pre-shuffled array of local suburbs and major hubs for an organic tag cloud
  const allSuburbs = [
    "Croydon", "Box Hill", "Mitcham", "Glen Waverley", "Heathmont", 
    "Wantirna", "Doncaster", "Bayswater", "Boronia", "Burwood", 
    "Nunawading", "Balwyn", "Vermont", "Ringwood East", "Springvale", 
    "Kilsyth", "Mooroolbark", "Clayton", "Lilydale", "Chirnside Park", 
    "Ferntree Gully", "Knoxfield", "Rowville", "Donvale", "Park Orchards", 
    "Warrandyte", "Blackburn"
  ];

  return (
    <section className="service-areas-container">
      <div className="service-areas-header">
        <h2>Proudly Serving Melbourne's Eastern Suburbs & Beyond</h2>
        <p>Whether you're local or driving in from across Melbourne, we provide reliable, same-day device repair backed by our No Fix, No Charge policy.</p>
      </div>

      <div className="suburb-cloud">
        {allSuburbs.map(s => <span key={s} className="suburb-tag">{s}</span>)}
      </div>
    </section>
  );
}
