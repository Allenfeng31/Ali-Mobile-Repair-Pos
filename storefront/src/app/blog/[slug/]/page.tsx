import { getPostData, getSortedPostsData } from '@/lib/blog';
import Link from 'next/link';

export async function generateStaticParams() {
  const posts = await getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const postData = await getPostData(params.slug);
  return {
    title: `${postData.title} | Ali Mobile Repair Blog`,
    description: postData.description,
  };
}

export default async function PostDetail({ params }: { params: { slug: string } }) {
  const postData = await getPostData(params.slug);

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/blog" className="text-blue-600 font-bold mb-8 inline-block hover:-translate-x-1 transition-transform">
        ← Back to Blog
      </Link>
      
      <header className="mb-12">
        <div className="text-sm text-blue-600 font-bold mb-2 uppercase tracking-widest">{postData.date}</div>
        <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">{postData.title}</h1>
        {postData.image && (
          <img src={postData.image} alt={postData.title} className="w-full h-80 object-cover rounded-3xl mb-8" />
        )}
      </header>

      <div 
        className="prose prose-lg max-w-none font-medium text-gray-700 leading-relaxed space-y-4"
        dangerouslySetInnerHTML={{ __html: postData.contentHtml }} 
      />

      <style>{`
        .prose h1, .prose h2, .prose h3 { font-weight: 900; color: #111; margin-top: 2rem; margin-bottom: 1rem; }
        .prose p { margin-bottom: 1.5rem; }
        .prose strong { font-weight: 800; color: #1f2937; }
        .prose ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; }
        .prose a { color: #2563eb; font-weight: 700; text-decoration: underline; }
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
