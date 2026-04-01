'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Review {
  id: number;
  name: string;
  rating: number;
  text: string;
  date: string;
  avatar: string;
  photos?: string[];
}

const hardcodedReviews: Review[] = [
  {
    id: 1,
    name: "Nina Meow",
    rating: 5,
    text: "Ali Mobile Repair is honest and affordable. No hidden fees, just clear and fair pricing. I compared with other nearby shops and this one is definitely cheaper. Great service and fast repair – highly recommended!",
    date: "8 months ago",
    avatar: "N",
    photos: [
      "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=400&h=300&fit=crop",
      "https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?w=400&h=300&fit=crop"
    ]
  },
  {
    id: 2,
    name: "John Williamson",
    rating: 5,
    text: "This is about the fourth or fifth time I have used Ali Mobile. He has always been helpful, prompt and fairly priced. Pleased to have gone to him. Highly recommended.",
    date: "8 months ago",
    avatar: "J"
  },
  {
    id: 3,
    name: "BBQs-R-US",
    rating: 5,
    text: "Extremely friendly and competent, fixed all my little issues and I basically have a new phone for $200. Thanks",
    date: "6 months ago",
    avatar: "B",
    photos: [
      "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=400&h=300&fit=crop"
    ]
  },
  {
    id: 4,
    name: "Janine B",
    rating: 5,
    text: "Allen replaced my screen within an hour - very honest and polite, and great rate! Amazed and grateful! Best repair experience.",
    date: "Verified",
    avatar: "J"
  },
  {
    id: 5,
    name: "Bumzigan Yebet",
    rating: 5,
    text: "Dropped my Samsung tablet in to have the battery replaced. Was done in time stated and works like a new one now. Highly recommended. Thanks",
    date: "9 months ago",
    avatar: "B",
    photos: [
      "https://images.unsplash.com/photo-1581092921461-7d6560b6fd8d?w=400&h=300&fit=crop"
    ]
  },
  {
    id: 6,
    name: "Jay Taplin",
    rating: 5,
    text: "Great service, very helpful and friendly. Highly recommend for any phone repairs in Ringwood.",
    date: "1 month ago",
    avatar: "J"
  }
];

function StarRating() {
  return (
    <span style={{ display: 'inline-flex', gap: '2px' }}>
      {[...Array(5)].map((_, i) => (
        <span key={i} style={{ color: '#FBBC05', fontSize: '14px', lineHeight: 1 }}>★</span>
      ))}
    </span>
  );
}

function GoogleLogo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
    </svg>
  );
}

export default function ReviewsSection() {
  const [currentPage, setCurrentPage] = useState(0);
  const cardsPerPage = 3;
  const totalPages = Math.ceil(hardcodedReviews.length / cardsPerPage);

  const visibleReviews = hardcodedReviews.slice(
    currentPage * cardsPerPage,
    currentPage * cardsPerPage + cardsPerPage
  );

  const goNext = () => setCurrentPage((p) => (p + 1) % totalPages);
  const goPrev = () => setCurrentPage((p) => (p - 1 + totalPages) % totalPages);

  return (
    <section style={{
      padding: '40px 20px',
      background: '#f8fafc',
      textAlign: 'center',
    }}>
      {/* Title */}
      <h2 style={{
        fontSize: '28px',
        fontWeight: 800,
        color: '#0f172a',
        marginBottom: '6px',
      }}>
        Customer Reviews
      </h2>
      <div style={{
        width: '40px',
        height: '3px',
        background: '#2563eb',
        margin: '0 auto 30px auto',
        borderRadius: '2px',
      }} />

      {/* Carousel Container */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        maxWidth: '1000px',
        margin: '0 auto',
      }}>
        {/* Left Arrow */}
        <button
          onClick={goPrev}
          aria-label="Previous reviews"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '1px solid #e2e8f0',
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            color: '#64748b',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
        >
          ←
        </button>

        {/* Cards */}
        <div style={{
          display: 'flex',
          gap: '16px',
          flex: 1,
          justifyContent: 'center',
        }}>
          {visibleReviews.map((review) => (
            <div key={review.id} style={{
              flex: '1 1 0',
              maxWidth: '300px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              {/* Speech Bubble */}
              <div style={{
                position: 'relative',
                background: 'white',
                border: '1.5px solid #1e3a8a',
                borderRadius: '20px',
                padding: '16px 20px',
                marginBottom: '20px',
                boxShadow: '4px 4px 0px rgba(30, 58, 138, 0.05)',
                width: '100%',
                minHeight: '160px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <div>
                  <p style={{
                    color: '#334155',
                    fontSize: '12.5px',
                    lineHeight: '1.5',
                    fontStyle: 'italic',
                    margin: '0 0 12px 0',
                    textAlign: 'left',
                  }}>
                    &ldquo;{review.text}&rdquo;
                  </p>
                  
                  {/* Photo Gallery */}
                  {review.photos && review.photos.length > 0 && (
                    <div style={{
                      display: 'flex',
                      gap: '6px',
                      marginBottom: '12px',
                      overflowX: 'auto',
                      paddingBottom: '4px'
                    }}>
                      {review.photos.map((photo, idx) => (
                        <img 
                          key={idx}
                          src={photo}
                          alt="Review attachment"
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #f1f5f9'
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Google + Stars row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '10px',
                }}>
                  <GoogleLogo />
                  <StarRating />
                </div>

                {/* Bubble Tip */}
                <div style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: '28px',
                  width: '14px',
                  height: '14px',
                  background: 'white',
                  borderLeft: '1.5px solid #1e3a8a',
                  borderBottom: '1.5px solid #1e3a8a',
                  transform: 'rotate(-45deg)',
                }} />
              </div>

              {/* Author Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                alignSelf: 'flex-start',
                marginLeft: '16px',
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: '#1e3a8a',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px',
                }}>
                  {review.avatar}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <span style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: '#0f172a',
                  }}>
                    {review.name}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    color: '#64748b',
                  }}>
                    {review.date}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={goNext}
          aria-label="Next reviews"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '1px solid #e2e8f0',
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            color: '#64748b',
            flexShrink: 0,
            transition: 'all 0.2s ease',
          }}
        >
          →
        </button>
      </div>

      {/* Pagination Dots */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '6px',
        marginTop: '24px',
      }}>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            aria-label={`Go to page ${i + 1}`}
            style={{
              width: i === currentPage ? '20px' : '6px',
              height: '6px',
              borderRadius: '3px',
              background: i === currentPage ? '#1e3a8a' : '#cbd5e1',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* CTA Link */}
      <div style={{ marginTop: '30px' }}>
        <a
          href="https://www.google.com/search?q=Ali+Mobile+%26+Repair+Ringwood+reviews"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block',
            padding: '8px 20px',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: 700,
            color: '#64748b',
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            background: 'white',
            transition: 'all 0.2s ease',
          }}
        >
          View All Good Reviews →
        </a>
      </div>
    </section>
  );
}
