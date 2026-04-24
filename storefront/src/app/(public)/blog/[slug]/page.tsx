import { getPostData, getSortedPostsData } from '@/lib/blog';
import Link from 'next/link';

// Force dynamic so Supabase posts always appear
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const postData = await getPostData(slug);
    return {
      title: `${postData.title} | Ali Mobile Repair Blog`,
      description: postData.description,
    };
  } catch {
    return { title: 'Blog Post | Ali Mobile Repair', description: '' };
  }
}

export default async function PostDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const postData = await getPostData(slug);

  const formattedDate = postData.date
    ? new Date(postData.date).toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="blog-detail-page">
      <div className="blog-detail-container">
        {/* Back Link */}
        <Link href="/blog" className="back-link">
          ← Back to Blog
        </Link>

        {/* Cover Image */}
        {postData.image && (
          <div className="cover-wrapper">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={postData.image}
              alt={postData.title}
              className="cover-image"
              onError={(e: any) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

        {/* Article Card */}
        <article className="article-card">
          <header className="article-header">
            {formattedDate && <div className="date-label">{formattedDate}</div>}
            <h1 className="article-title">{postData.title}</h1>
            {postData.description && (
              <p className="article-excerpt">{postData.description}</p>
            )}
          </header>

          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
          />
        </article>

        {/* CTA Footer */}
        <div className="cta-card">
          <h3>Need a Repair in Ringwood?</h3>
          <p>Ali Mobile Repair offers fast, reliable fixing for iPhone, iPad, and MacBook with high-quality parts.</p>
          <Link href="/book-repair" className="cta-btn">
            Book Repair Now
          </Link>
        </div>
      </div>

      <style>{`
        .blog-detail-page {
          background: #f8fafc;
          min-height: 100vh;
          padding: 140px 1.5rem 5rem;
        }

        .blog-detail-container {
          max-width: 780px;
          margin: 0 auto;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          color: #2563eb;
          font-weight: 700;
          font-size: 0.9rem;
          margin-bottom: 2rem;
          transition: transform 0.2s;
        }
        .back-link:hover { transform: translateX(-4px); }

        /* Cover Image */
        .cover-wrapper {
          border-radius: 1.5rem;
          overflow: hidden;
          margin-bottom: -3rem;
          position: relative;
          z-index: 1;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }
        .cover-image {
          width: 100%;
          height: 380px;
          object-fit: cover;
          display: block;
        }

        /* Article Card */
        .article-card {
          background: #ffffff;
          border-radius: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.05);
          padding: 3.5rem 3rem 3rem;
          position: relative;
          z-index: 2;
          border: 1px solid #e2e8f0;
        }

        .article-header {
          margin-bottom: 2.5rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .date-label {
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #2563eb;
          margin-bottom: 1rem;
        }

        .article-title {
          font-size: 2.5rem;
          font-weight: 900;
          line-height: 1.15;
          color: #0f172a;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }

        .article-excerpt {
          font-size: 1.15rem;
          color: #64748b;
          line-height: 1.6;
          font-weight: 500;
        }

        /* Article Body — WYSIWYG styles */
        .article-body {
          font-size: 1.1rem;
          line-height: 1.85;
          color: #334155;
          font-weight: 450;
        }

        .article-body h1 { font-size: 2rem; font-weight: 900; color: #0f172a; margin: 2.5rem 0 1rem; line-height: 1.2; }
        .article-body h2 { font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 2rem 0 0.75rem; line-height: 1.25; }
        .article-body h3 { font-size: 1.3rem; font-weight: 700; color: #1e293b; margin: 1.75rem 0 0.6rem; line-height: 1.3; }

        .article-body p { margin-bottom: 1.5rem; }
        .article-body strong { font-weight: 800; color: #0f172a; }
        .article-body em { font-style: italic; }
        .article-body u { text-decoration: underline; text-underline-offset: 3px; }

        .article-body ul { list-style: disc; padding-left: 1.75rem; margin-bottom: 1.5rem; }
        .article-body ol { list-style: decimal; padding-left: 1.75rem; margin-bottom: 1.5rem; }
        .article-body li { margin-bottom: 0.4rem; }
        .article-body li::marker { color: #94a3b8; }

        .article-body a {
          color: #2563eb;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.2s;
        }
        .article-body a:hover { color: #1d4ed8; }

        .article-body blockquote {
          border-left: 4px solid #2563eb;
          padding: 1rem 1.5rem;
          margin: 1.5rem 0;
          background: #f8fafc;
          border-radius: 0 12px 12px 0;
          color: #475569;
          font-style: italic;
          font-size: 1.05rem;
        }

        .article-body pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1.25rem;
          border-radius: 12px;
          font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
          font-size: 0.875rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          line-height: 1.6;
        }
        .article-body code {
          background: #f1f5f9;
          color: #6366f1;
          padding: 0.15rem 0.5rem;
          border-radius: 5px;
          font-size: 0.875em;
          font-family: 'SF Mono', 'Fira Code', monospace;
        }
        .article-body pre code {
          background: none;
          color: inherit;
          padding: 0;
          font-size: inherit;
        }

        .article-body img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 1.5rem 0;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08);
        }

        .article-body hr {
          border: none;
          border-top: 1px solid #e2e8f0;
          margin: 2.5rem 0;
        }

        /* CTA Card */
        .cta-card {
          background: linear-gradient(135deg, #eff6ff, #dbeafe);
          padding: 2.5rem;
          border-radius: 1.5rem;
          margin-top: 3rem;
          border: 1px solid #bfdbfe;
        }
        .cta-card h3 { font-size: 1.3rem; font-weight: 900; color: #0f172a; margin-bottom: 0.5rem; }
        .cta-card p { color: #475569; font-size: 1rem; margin-bottom: 1.5rem; font-weight: 500; line-height: 1.6; }
        .cta-btn {
          display: inline-block;
          background: #2563eb;
          color: #fff;
          padding: 0.85rem 2rem;
          border-radius: 0.85rem;
          font-weight: 700;
          transition: all 0.3s;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);
        }
        .cta-btn:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(37, 99, 235, 0.35); }

        /* Responsive */
        @media (max-width: 640px) {
          .blog-detail-page { padding: 120px 1rem 3rem; }
          .article-card { padding: 2rem 1.5rem; }
          .article-title { font-size: 1.75rem; }
          .cover-image { height: 240px; }
          .article-body { font-size: 1rem; }
        }
      `}</style>
    </div>
  );
}
