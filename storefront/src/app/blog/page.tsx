import Link from 'next/link';
import { getSortedPostsData } from '@/lib/blog';

export const metadata = {
  title: 'Repair Guides & Tech News | Ali Mobile Repair Blog',
  description: 'Expert mobile and tablet repair tips from Melbourne\'s most trusted technicians. Stay updated with the latest in device maintenance.',
};

export default async function BlogPage() {
  const allPostsData = await getSortedPostsData();
  const featuredPost = allPostsData[0];
  const remainingPosts = allPostsData.slice(1);

  return (
    <div className="blog-archive">
      {/* Hero Section - Featured Post */}
      {featuredPost && (
        <section className="featured-hero">
          <div className="hero-content">
            <div className="hero-image-wrapper">
              <img src={featuredPost.image || '/blog/phone-repair.png'} alt={featuredPost.title} />
              <div className="hero-overlay"></div>
            </div>
            <div className="hero-text">
              <span className="badge">Featured Article</span>
              <h1>{featuredPost.title}</h1>
              <p>{featuredPost.description}</p>
              <Link href={`/blog/${featuredPost.slug}`} className="read-more-btn">
                Read Full Guide
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Blog Grid */}
      <section className="blog-grid-section">
        <div className="section-header">
          <h2>Latest Repair Guides</h2>
          <div className="header-line"></div>
        </div>
        
        <div className="blog-grid">
          {remainingPosts.map(({ slug, date, title, description, image }) => (
            <Link href={`/blog/${slug}`} key={slug} className="blog-card">
              <div className="card-image">
                <img src={image || '/blog/phone-repair.png'} alt={title} />
                <div className="date-badge">{new Date(date).toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })}</div>
              </div>
              <div className="card-body">
                <h3>{title}</h3>
                <p>{description}</p>
                <span className="card-link">Continue Reading →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <style>{`
        .blog-archive {
          background-color: #f8fafc;
          min-height: 100vh;
          padding-bottom: 5rem;
        }

        /* Hero Styling */
        .featured-hero {
          padding: 2rem 5% 4rem;
          background: linear-gradient(to bottom, #ffffff, #f8fafc);
        }

        .hero-content {
          display: flex;
          background: #fff;
          border-radius: 2rem;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
          max-width: 1200px;
          margin: 0 auto;
          min-height: 450px;
        }

        .hero-image-wrapper {
          flex: 1.2;
          position: relative;
          overflow: hidden;
        }

        .hero-image-wrapper img {
          width: 100%;
          height: 100%;
          object-cover: cover;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(0,0,0,0.1), transparent);
        }

        .hero-text {
          flex: 1;
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: #ffffff;
        }

        .badge {
          background: #eff6ff;
          color: #2563eb;
          padding: 0.4rem 1rem;
          border-radius: 2rem;
          font-weight: 800;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          width: fit-content;
          margin-bottom: 1.5rem;
        }

        .hero-text h1 {
          font-size: 2.5rem;
          font-weight: 900;
          line-height: 1.1;
          color: #0f172a;
          margin-bottom: 1.5rem;
        }

        .hero-text p {
          color: #64748b;
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          font-weight: 500;
        }

        .read-more-btn {
          background: #0f172a;
          color: #fff;
          padding: 1rem 2rem;
          border-radius: 1rem;
          font-weight: 700;
          width: fit-content;
          transition: all 0.3s ease;
        }

        .read-more-btn:hover {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.3);
        }

        /* Grid Styling */
        .blog-grid-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 5%;
        }

        .section-header {
          margin-bottom: 3rem;
        }

        .section-header h2 {
          font-size: 2rem;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }

        .header-line {
          width: 60px;
          height: 4px;
          background: #2563eb;
          border-radius: 2px;
        }

        .blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 2.5rem;
        }

        .blog-card {
          background: #fff;
          border-radius: 1.5rem;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          border: 1px solid #e2e8f0;
        }

        .blog-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          border-color: #cbd5e1;
        }

        .card-image {
          height: 220px;
          position: relative;
          overflow: hidden;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-cover: cover;
          transition: transform 0.6s ease;
        }

        .blog-card:hover .card-image img {
          transform: scale(1.05);
        }

        .date-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          padding: 0.5rem 0.8rem;
          border-radius: 0.75rem;
          font-weight: 800;
          font-size: 0.75rem;
          color: #0f172a;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .card-body {
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .card-body h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.3;
          margin-bottom: 0.75rem;
        }

        .card-body p {
          color: #64748b;
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 1.5rem;
          flex: 1;
        }

        .card-link {
          color: #2563eb;
          font-weight: 800;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
        }

        /* Mobile Adjustments */
        @media (max-width: 900px) {
          .hero-content {
            flex-direction: column;
          }
          .hero-text {
            padding: 2rem;
          }
          .hero-text h1 {
            font-size: 1.75rem;
          }
        }

        @media (max-width: 600px) {
          .blog-grid {
            grid-template-columns: 1fr;
          }
          .blog-archive {
            padding-top: 1rem;
          }
        }
      `}</style>
    </div>
  );
}
