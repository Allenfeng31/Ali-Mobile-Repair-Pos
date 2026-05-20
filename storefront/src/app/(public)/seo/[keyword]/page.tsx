import Link from 'next/link';
import { Clock, ShieldCheck, Calendar, ArrowRight, Wrench, Star } from 'lucide-react';

// Mock Supabase fetch logic
async function getSeoArticle(keyword: string) {
  const formattedKeyword = keyword.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `Expert ${formattedKeyword} in Ringwood: Fast, Reliable, & Affordable`,
    metaTitle: `Best ${formattedKeyword} Services | Book Today`,
    metaDescription: `Looking for professional ${formattedKeyword.toLowerCase()}? We offer fast turnaround times, premium parts, and a lifetime warranty. Book your repair today.`,
    author: 'Ali Mobile Tech Team',
    readingTime: '4 mins',
    lastUpdated: 'Just recently',
    content: `
      <h2>Why You Need Professional ${formattedKeyword}</h2>
      <p>When dealing with device issues, it's tempting to look for quick DIY fixes. However, modern smartphones and tablets are highly complex machines. Attempting a repair without the right tools and expertise can lead to further damage, voided warranties, and potential data loss.</p>
      <p>Our certified technicians specialize in comprehensive diagnostics and precision repairs. We understand the intricate architecture of these devices, ensuring that every screw is replaced and every flex cable is correctly seated.</p>

      <h2>Signs Your Device Needs Immediate Attention</h2>
      <ul>
        <li><strong>Unresponsive Touch:</strong> The screen registers phantom touches or completely ignores your input.</li>
        <li><strong>Rapid Battery Drain:</strong> Your device shuts down unexpectedly even when it shows it has charge.</li>
        <li><strong>Overheating:</strong> The back glass feels unusually hot during normal operation or charging.</li>
        <li><strong>Physical Damage:</strong> Visible cracks, shattered glass, or bent frames that compromise the device's structural integrity.</li>
      </ul>

      <h2>Our Premium Repair Process</h2>
      <p>We pride ourselves on transparency and quality. When you bring your device to us for ${formattedKeyword.toLowerCase()}, here is exactly what happens:</p>
      <ol>
        <li><strong>Free Comprehensive Diagnostic:</strong> We test all core functions (Face ID, cameras, microphones, charging ports) before opening the device.</li>
        <li><strong>Genuine & Premium Parts:</strong> We use only the highest quality replacement components sourced from reputable suppliers.</li>
        <li><strong>Precision Assembly:</strong> We restore all water-resistance seals and use calibrated tools to ensure factory-level fitment.</li>
        <li><strong>Post-Repair Quality Control:</strong> A rigorous 25-point inspection is performed to guarantee everything works flawlessly.</li>
      </ol>

      <h2>The Cost of Waiting</h2>
      <p>Many users delay getting their devices fixed due to perceived costs or inconvenience. However, a cracked screen can let moisture and dust into the logic board, turning a simple screen replacement into a complete data recovery nightmare. Addressing the issue early not only saves money but also extends the lifespan of your essential technology.</p>
      
      <blockquote>
        <p>"A small crack today is a dead logic board tomorrow. Don't compromise your data for a delayed repair."</p>
      </blockquote>

      <h2>Ready to Get Started?</h2>
      <p>Don't let a broken device disrupt your workflow. Our team in Ringwood is equipped and ready to provide top-tier ${formattedKeyword.toLowerCase()} services. With our extensive inventory of parts, most repairs are completed within 45 minutes.</p>
    `,
    relatedKeywords: ['screen repair', 'battery replacement', 'water damage'],
    rating: 4.9,
    reviewCount: 428
  };
}

export default async function SeoArticlePage({ params }: { params: Promise<{ keyword: string }> }) {
  const resolvedParams = await params;
  const article = await getSeoArticle(resolvedParams.keyword);

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#0C0A09] font-sans selection:bg-[#CA8A04] selection:text-white pb-24">
      {/* High-Tech Header Visual */}
      <div className="relative overflow-hidden bg-[#1C1917] text-white pt-32 pb-20 lg:pt-40 lg:pb-28 border-b border-[#44403C]">
        {/* Soft Radial Gradient & Faint Grid Mesh */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(202,138,4,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 mask-image:linear-gradient(to_bottom,white,transparent)" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Meta Info Bar */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm font-medium tracking-wide text-gray-300">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" />
                Verified Tech Article
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-400" />
                Reading Time: {article.readingTime}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                Updated: {article.lastUpdated}
              </span>
            </div>

            {/* Massive H1 Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1] drop-shadow-sm">
              {article.title}
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-400 leading-relaxed font-light">
              {article.metaDescription}
            </p>
            
            {/* Author & Rating */}
            <div className="flex items-center gap-6 mt-10 pt-10 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 flex items-center justify-center text-[#1C1917] font-bold text-lg">
                  {article.author.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{article.author}</div>
                  <div className="text-xs text-gray-400">Master Technician</div>
                </div>
              </div>
              <div className="h-8 w-[1px] bg-white/10"></div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                  <span className="ml-1 text-sm font-bold text-white">{article.rating}</span>
                </div>
                <div className="text-xs text-gray-400">Based on {article.reviewCount} reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content & Sidebar Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Article Content (70% ~ 8 cols) */}
          <div className="lg:col-span-8">
            <article 
              className="prose prose-slate lg:prose-xl max-w-none 
                         prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-[#1C1917]
                         prose-p:leading-relaxed prose-p:text-[#44403C]
                         prose-a:text-[#CA8A04] prose-a:no-underline hover:prose-a:underline
                         prose-strong:text-[#1C1917] prose-strong:font-semibold
                         prose-li:text-[#44403C] prose-ul:list-disc
                         prose-blockquote:border-l-4 prose-blockquote:border-[#CA8A04] prose-blockquote:bg-yellow-50/50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:italic prose-blockquote:text-[#1C1917]
                         prose-img:rounded-2xl prose-img:shadow-xl"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
            
            {/* Tags / Related */}
            <div className="mt-16 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-[#1C1917] uppercase tracking-wider mb-4">Related Topics</h3>
              <div className="flex flex-wrap gap-2">
                {article.relatedKeywords.map((tag) => (
                  <span key={tag} className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-[#44403C] hover:border-[#CA8A04] hover:text-[#CA8A04] cursor-pointer transition-colors duration-200 shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Conversion Card (30% ~ 4 cols) */}
          <div className="lg:col-span-4">
            <div className="sticky top-32">
              <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                {/* Card Header with Premium Gradient */}
                <div className="relative bg-[#1C1917] p-8 text-center overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#CA8A04] rounded-full blur-[40px] opacity-40"></div>
                  <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-yellow-600 rounded-full blur-[40px] opacity-20"></div>
                  <Wrench className="w-12 h-12 text-[#CA8A04] mx-auto mb-5 relative z-10" />
                  <h3 className="text-2xl font-bold text-white tracking-tight mb-2 relative z-10">
                    Need this fixed today?
                  </h3>
                  <p className="text-gray-400 text-sm relative z-10">
                    Skip the queue. Get a live quote now.
                  </p>
                </div>
                
                {/* Card Body */}
                <div className="p-8 space-y-8">
                  <ul className="space-y-4">
                    {[
                      'Live upfront pricing',
                      'Usually fixed in 45 minutes',
                      'Premium grade parts used',
                      'Lifetime warranty included'
                    ].map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mt-0.5">
                          <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </div>
                        <span className="text-sm font-medium text-[#44403C]">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2">
                    <Link href="/book-repair" className="group flex items-center justify-center w-full gap-2 px-6 py-4 bg-[#CA8A04] hover:bg-yellow-500 text-white font-bold rounded-xl shadow-lg shadow-yellow-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-yellow-500/30">
                      Get a Live Quote Now
                      <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                    <p className="text-center text-xs text-gray-400 mt-4 font-medium uppercase tracking-wider">
                      No payment required to book
                    </p>
                  </div>
                </div>
              </div>

              {/* Secondary Trust Card */}
              <div className="mt-6 bg-[#FAFAF9] rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gray-200 border-2 border-[#FAFAF9] overflow-hidden shadow-sm">
                        <img src={`https://i.pravatar.cc/100?img=${i + 12}`} alt="Customer" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#1C1917]">Trusted locally</div>
                    <div className="text-xs text-[#44403C] mt-0.5">Join 10,000+ happy customers</div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
