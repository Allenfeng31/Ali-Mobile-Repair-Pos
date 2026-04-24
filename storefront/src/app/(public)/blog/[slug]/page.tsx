import { getPostData, getSortedPostsData } from '@/lib/blog';
import Link from 'next/link';
import Image from 'next/image';

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
    <article className="max-w-3xl mx-auto px-6 pt-[160px] pb-12">
      <Link href="/blog" className="text-blue-600 font-bold mb-8 inline-block hover:-translate-x-1 transition-transform">
        ← Back to Blog
      </Link>
      
      <header className="mb-12">
        <div className="text-sm text-blue-600 font-bold mb-2 uppercase tracking-widest">{postData.date}</div>
        <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">{postData.title}</h1>
        {postData.image && (
          <Image 
            src={postData.image} 
            alt={postData.title} 
            width={800} 
            height={320} 
            priority
            sizes="(max-width: 800px) 100vw, 800px"
            className="w-full h-80 object-cover rounded-3xl mb-8" 
          />
        )}
      </header>

      <div 
        className="blog-content prose prose-lg max-w-none font-medium text-gray-700 leading-relaxed space-y-4"
        dangerouslySetInnerHTML={{ __html: postData.contentHtml }} 
      />

      <style>{`
        .blog-content h1, .blog-content h2, .blog-content h3 { font-weight: 900; color: #111; margin-top: 2rem; margin-bottom: 1rem; }
        .blog-content h1 { font-size: 2rem; }
        .blog-content h2 { font-size: 1.5rem; }
        .blog-content h3 { font-size: 1.25rem; }
        .blog-content p { margin-bottom: 1.5rem; line-height: 1.8; }
        .blog-content strong { font-weight: 800; color: #1f2937; }
        .blog-content ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; }
        .blog-content ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 1.5rem; }
        .blog-content li { margin-bottom: 0.5rem; }
        .blog-content a { color: #2563eb; font-weight: 700; text-decoration: underline; }
        .blog-content blockquote {
          border-left: 4px solid #6366f1;
          padding: 0.75rem 1.25rem;
          margin: 1rem 0;
          background: #f1f5f9;
          border-radius: 0 12px 12px 0;
          color: #475569;
          font-style: italic;
        }
        .blog-content pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 12px;
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 0.9rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        .blog-content code {
          background: #f1f5f9;
          color: #6366f1;
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          font-size: 0.9em;
        }
        .blog-content pre code {
          background: none;
          color: inherit;
          padding: 0;
        }
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 1.5rem 0;
        }
      `}</style>

      <footer className="mt-16 pt-8 border-t border-gray-100">
         <div className="bg-blue-50 p-8 rounded-3xl">
            <h3 className="font-black text-xl mb-2">Need a Repair in Ringwood?</h3>
            <p className="text-gray-600 mb-6 font-medium">Ali Mobile Repair offers fast, reliable fixing for iPhone, iPad, and MacBook with high-quality parts.</p>
            <Link href="/book-repair" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold inline-block hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-200">
               Book Repair Now
            </Link>
         </div>
      </footer>
    </article>
  );
}
