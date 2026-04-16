'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Review {
  id: number;
  name: string;
  rating: number;
  text: string;
  initial: string;
}

const hardcodedReviews: Review[] = [
  {
    id: 1,
    name: "BBQs-R-US",
    rating: 5,
    text: "Allen replaced my screen within an hour - very honest and polite, and great rate! Amazed and grateful! Best repair experience.",
    initial: "B"
  },
  {
    id: 2,
    name: "Janine B",
    rating: 5,
    text: "Dropped my Samsung tablet in to have the battery replaced. Was done in time stated and works like a new one now. Highly recommended. Thanks",
    initial: "J"
  },
  {
    id: 3,
    name: "Bumzigan Yebet",
    rating: 5,
    text: "Great service, very helpful and friendly. Highly recommend for any phone repairs in Ringwood.",
    initial: "B"
  },
  {
    id: 4,
    name: "John Williamson",
    rating: 5,
    text: "Extremely friendly and competent, fixed all my little issues and I basically have a new phone for $200. Thanks",
    initial: "J"
  },
  {
    id: 5,
    name: "Nina Meow",
    rating: 5,
    text: "This is about the fourth or fifth time I have used Ali Mobile. He has always been helpful, prompt and fairly priced. Pleased to have gone to him. Highly recommended.",
    initial: "N"
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
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const card = container.children[index] as HTMLElement;
      if (card) {
        const targetX = card.offsetLeft - (container.offsetWidth - card.offsetWidth) / 2;
        container.scrollTo({
          left: targetX,
          behavior: 'smooth'
        });
      }
    }
    setActiveIndex(index);
  };

  const goNext = () => {
    const nextIndex = (activeIndex + 1) % hardcodedReviews.length;
    scrollToIndex(nextIndex);
  };

  const goPrev = () => {
    const prevIndex = (activeIndex - 1 + hardcodedReviews.length) % hardcodedReviews.length;
    scrollToIndex(prevIndex);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const scrollLeft = container.scrollLeft;
        const containerWidth = container.offsetWidth;
        
        // Find which card is closest to the center
        let closestIndex = 0;
        let minDiff = Infinity;
        
        Array.from(container.children).forEach((child, index) => {
          const card = child as HTMLElement;
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const containerCenter = scrollLeft + containerWidth / 2;
          const diff = Math.abs(cardCenter - containerCenter);
          
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = index;
          }
        });
        
        setActiveIndex(closestIndex);
      }
    };

    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <section style={{
      padding: '60px 20px',
      background: 'var(--background)',
      textAlign: 'center',
      borderTop: '1px solid var(--layer-border)',
    }}>
      {/* Title */}
      <h2 style={{
        fontSize: '32px',
        fontWeight: 800,
        color: 'var(--foreground)',
        marginBottom: '8px',
        letterSpacing: '-0.5px',
      }}>
        Customer Reviews
      </h2>
      <div style={{
        width: '50px',
        height: '4px',
        background: 'var(--primary)',
        margin: '0 auto 40px auto',
        borderRadius: '2px',
      }} />

      {/* Carousel Container */}
      <div style={{
        position: 'relative', // Added for absolute arrows
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '1200px', // Slightly wider
        margin: '0 auto',
        padding: '0 20px',
      }}>
        {/* Cards container */}
        <div 
          ref={scrollRef}
          style={{
            display: 'flex',
            gap: '16px',
            flex: 1,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch',
            padding: '20px 0',
            msOverflowStyle: 'none',  /* IE and Edge */
            scrollbarWidth: 'none',   /* Firefox */
          }}
          className="reviews-scroll-container"
        >
          {/* Responsive Card Width and Hover effect */}
          <style jsx>{`
            .reviews-scroll-container::-webkit-scrollbar {
              display: none;
            }
            .review-card {
              flex: 0 0 85%;
              max-width: 340px;
            }
            @media (min-width: 768px) {
              .review-card {
                flex: 0 0 calc(50% - 16px);
              }
            }
            @media (min-width: 1024px) {
              .review-card {
                flex: 0 0 calc(33.333% - 16px);
              }
            }
            .review-card:hover {
              transform: translateY(-5px);
            }
          `}</style>
          
          {hardcodedReviews.map((review, index) => (
            <div key={review.id} style={{
              scrollSnapAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              opacity: index === activeIndex ? 1 : 0.6,
              transform: index === activeIndex ? 'scale(1.02)' : 'scale(0.98)',
            }} className="review-card">
              {/* Speech Bubble */}
              <div style={{
                position: 'relative',
                background: 'var(--layer)',
                backdropFilter: 'blur(8px)',
                border: '1px solid var(--layer-border)',
                borderRadius: '24px',
                padding: '20px 24px',
                marginBottom: '20px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                width: '100%',
                minHeight: '160px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}>
                <div>
                  <p style={{
                    color: 'var(--foreground)',
                    opacity: 0.9,
                    fontSize: '13px',
                    lineHeight: '1.6',
                    fontStyle: 'italic',
                    margin: '0 0 15px 0',
                    textAlign: 'left',
                  }}>
                    &ldquo;{review.text}&rdquo;
                  </p>
                </div>

                {/* Google + Stars row */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderTop: '1px solid var(--layer-border)',
                  paddingTop: '12px',
                }}>
                  <GoogleLogo />
                  <StarRating />
                </div>

                {/* Bubble Tip */}
                <div style={{
                  position: 'absolute',
                  bottom: '-8px',
                  left: '32px',
                  width: '16px',
                  height: '16px',
                  background: 'var(--layer)',
                  backdropFilter: 'blur(8px)',
                  borderLeft: '1px solid var(--layer-border)',
                  borderBottom: '1px solid var(--layer-border)',
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
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  background: 'var(--primary)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                }}>
                  {review.initial}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <span style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--foreground)',
                  }}>
                    {review.name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons (Floating on top or beside) */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '-20px',
          right: '-20px',
          transform: 'translateY(-50%)',
          display: 'flex',
          justifyContent: 'space-between',
          pointerEvents: 'none',
          zIndex: 10,
        }}>
          <button
            onClick={goPrev}
            aria-label="Previous reviews"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '1px solid var(--layer-border)',
              background: 'var(--layer)',
              backdropFilter: 'blur(12px)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              color: 'var(--primary)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              pointerEvents: 'auto',
              transition: 'all 0.3s ease',
            }}
            className="nav-btn"
          >
            ←
          </button>
          <button
            onClick={goNext}
            aria-label="Next reviews"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '1px solid var(--layer-border)',
              background: 'var(--layer)',
              backdropFilter: 'blur(12px)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              color: 'var(--primary)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              pointerEvents: 'auto',
              transition: 'all 0.3s ease',
            }}
            className="nav-btn"
          >
            →
          </button>
          <style jsx>{`
            .nav-btn:hover {
              background: var(--secondary);
              transform: scale(1.1);
              border-color: var(--primary);
            }
            .nav-btn:active {
              transform: scale(0.95);
            }
            @media (max-width: 768px) {
              .nav-btn {
                display: none; /* Hide on mobile to favor touch */
              }
            }
          `}</style>
        </div>
      </div>

      {/* Pagination Dots */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '8px',
        marginTop: '20px',
      }}>
        {hardcodedReviews.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            aria-label={`Go to review ${i + 1}`}
            style={{
              width: i === activeIndex ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i === activeIndex ? 'var(--primary)' : 'var(--layer-border)',
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
            padding: '10px 24px',
            border: '1px solid var(--layer-border)',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--foreground)',
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            background: 'var(--layer)',
            backdropFilter: 'blur(4px)',
            transition: 'all 0.3s ease',
          }}
        >
          VIEW ALL GOOD REVIEWS →
        </a>
      </div>
    </section>
  );
}
