import Link from 'next/link';
import { getSortedPostsData } from '@/lib/blog';

export const metadata = {
  title: 'Blog - Expert Repair Tips & News | Ali Mobile Repair',
  description: 'Stay updated with the latest mobile and tablet repair tips, news, and maintenance guides from Ali Mobile Repair in Ringwood, Melbourne.',
};

export default async function BlogPage() {
  const allPostsData = await getSortedPostsData();

  return (
    <div className="container mx-auto px-6 py-12 max-w-5xl">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-black mb-4">Latest from the Blog</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Expert advice, repair stories, and maintenance tips to keep your devices running smoothly in Melbourne.
        </p>
      </header>

      <div className="grid gap-12">
        {allPostsData.map(({ slug, date, title, description, image }) => (
          <article key={slug} className="group flex flex-col md:flex-row gap-8 items-start">
            <div className="w-full md:w-1/3 aspect-video bg-gray-100 rounded-2xl overflow-hidden relative border border-gray-200">
               {/* Fixed thumbnail if available, or logo placeholder */}
               <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 text-white font-black text-xl">
                 Ali Mobile
               </div>
               {image && <img src={image} alt={title} className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />}
            </div>
            <div className="flex-1">
              <div className="text-sm text-blue-600 font-bold mb-2 uppercase tracking-widest">{date}</div>
              <h2 className="text-2xl font-black mb-3 group-hover:text-blue-600 transition-colors">
                <Link href={`/blog/${slug}`}>{title}</Link>
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-3 font-medium leading-relaxed">
                {description}
              </p>
              <Link href={`/blog/${slug}`} className="inline-flex items-center text-blue-600 font-bold hover:gap-2 transition-all">
                Read Article <span className="ml-1">→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>

      <style>{`
        .container { max-width: 1100px; margin: 0 auto; }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;  
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
