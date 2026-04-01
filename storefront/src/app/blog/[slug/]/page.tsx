import { getPostData, getSortedPostsData } from '@/lib/blog';
import Link from 'next/link';

export async function generateStaticParams() {
  const posts = await getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const postData = await getPostData(slug);
  return {
    title: `${postData.title} | Ali Mobile Repair Blog`,
    description: postData.description,
  };
}

export default async function PostDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const postData = await getPostData(slug);

  return (
    <main className="post-detail-view">
      {/* Article Hero */}
      <section className="post-hero">
        <div className="hero-bg">
          <img src={postData.image || '/blog/phone-repair.png'} alt={postData.title} />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-container">
          <nav className="breadcrumbs">
            <Link href="/">Home</Link>
            <span className="separator">/</span>
            <Link href="/blog">Blog</Link>
            <span className="separator">/</span>
            <span className="current">{postData.title}</span>
          </nav>
          <div className="hero-text">
            <div className="post-meta">
              <span className="date">{new Date(postData.date).toLocaleDateString('en-AU', { dateStyle: 'long' })}</span>
              <span className="dot"></span>
              <span className="author">By Ali Mobile Expert</span>
            </div>
            <h1>{postData.title}</h1>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <div className="content-container">
        <aside className="post-sidebar">
          <Link href="/blog" className="back-link">
            <span className="icon">←</span>
            <span className="text">Back to Blog</span>
          </Link>
        </aside>

        <article className="post-article">
          <div 
            className="prose-content"
            dangerouslySetInnerHTML={{ __html: postData.contentHtml }} 
          />
          
          <div className="post-footer-cta">
            <h3>Ready to fix your device?</h3>
            <p>Our expert technicians in Ringwood are standing by. Professional repairs with high-quality parts.</p>
            <Link href="/book-repair" className="cta-button">
              Book Your Repair Online
            </Link>
          </div>
        </article>
      </div>

      <style>{`
        .post-detail-view {
          background: #fff;
          min-height: 100vh;
          padding-bottom: 5rem;
        }

        /* Hero */
        .post-hero {
          height: 60vh;
          min-height: 500px;
          position: relative;
          display: flex;
          align-items: flex-end;
          color: #fff;
          overflow: hidden;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .hero-bg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 50%, rgba(15, 23, 42, 0.2) 100%);
        }

        .hero-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 1.5rem;
        }

        .breadcrumbs {
          display: flex;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 2rem;
          color: rgba(255,255,255,0.7);
        }

        .breadcrumbs a:hover {
          color: #fff;
          text-decoration: underline;
        }

        .hero-text h1 {
          font-size: 3.5rem;
          font-weight: 900;
          line-height: 1.1;
          max-width: 900px;
        }

        .post-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          color: #38bdf8;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 0.875rem;
        }

        .dot {
          width: 4px;
          height: 4px;
          background: currentColor;
          border-radius: 50%;
        }

        /* Content Layout */
        .content-container {
          max-width: 1200px;
          margin: -4rem auto 0;
          padding: 0 1.5rem;
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 4rem;
          position: relative;
          z-index: 2;
        }

        .post-sidebar {
          position: sticky;
          top: 2rem;
          height: fit-content;
        }

        .back-link {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          color: #64748b;
          font-weight: 700;
          transition: all 0.3s ease;
        }

        .back-link .icon {
          font-size: 1.5rem;
          background: #fff;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          margin-bottom: 0.5rem;
        }

        .back-link:hover {
          color: #2563eb;
          transform: translateX(-5px);
        }

        .back-link:hover .icon {
          background: #2563eb;
          color: #fff;
        }

        .post-article {
          background: #fff;
          padding: 4rem;
          border-radius: 2rem;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
        }

        /* Prose Styling */
        .prose-content {
          font-size: 1.125rem;
          line-height: 1.7;
          color: #334155;
          font-weight: 500;
        }

        .prose-content h2, .prose-content h3 {
          color: #0f172a;
          font-weight: 900;
          margin: 3rem 0 1.5rem;
        }

        .prose-content h2 { font-size: 2rem; }
        .prose-content h3 { font-size: 1.5rem; }

        .prose-content p {
          margin-bottom: 2rem;
        }

        .prose-content strong {
          font-weight: 800;
          color: #0f172a;
        }

        .prose-content a {
          color: #2563eb;
          text-decoration: underline;
          font-weight: 700;
        }

        /* Footer CTA */
        .post-footer-cta {
          margin-top: 5rem;
          padding: 3rem;
          background: #f8fafc;
          border-radius: 1.5rem;
          text-align: center;
          border: 1px solid #e2e8f0;
        }

        .post-footer-cta h3 {
          font-size: 1.5rem;
          font-weight: 900;
          margin-bottom: 1rem;
        }

        .post-footer-cta p {
          color: #64748b;
          margin-bottom: 2rem;
        }

        .cta-button {
          background: #2563eb;
          color: #fff;
          padding: 1rem 2rem;
          border-radius: 1rem;
          font-weight: 700;
          display: inline-block;
          transition: all 0.3s ease;
        }

        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4);
        }

        /* Mobile Adjustments */
        @media (max-width: 1024px) {
          .content-container {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          .post-sidebar {
            position: relative;
            top: 0;
            order: 2;
          }
          .back-link {
            flex-direction: row;
            align-items: center;
            background: #f1f5f9;
            padding: 1rem;
            border-radius: 1rem;
          }
          .back-link .icon { margin-bottom: 0; }
          .post-article {
            padding: 2.5rem 1.5rem;
            box-shadow: none;
          }
          .hero-text h1 {
            font-size: 2.25rem;
          }
        }

        @media (max-width: 600px) {
          .post-hero {
            height: 50vh;
            min-height: 400px;
          }
          .hero-container {
            padding: 2rem 1rem;
          }
          .hero-text h1 {
            font-size: 1.75rem;
          }
        }
      `}</style>
    </main>
  );
}
