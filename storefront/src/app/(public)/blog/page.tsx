import Link from "next/link";
import type { Metadata } from "next";

import { BlogImage } from "@/components/BlogImage";
import { getSortedPostsData } from "@/lib/blog";

import styles from "./BlogArchive.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Repair Guides & Bench Notes | Ali Mobile Repair Blog",
  description: "Practical repair guides and diagnostics notes from Ali Mobile & Repair in Ringwood.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Repair Guides & Bench Notes | Ali Mobile Repair Blog",
    description: "Practical repair guides and diagnostics notes from Ali Mobile & Repair in Ringwood.",
    url: "/blog",
    type: "website",
    locale: "en_AU",
    siteName: "Ali Mobile & Repair",
  },
};

interface BlogPostSummary {
  slug: string;
  title: string;
  date: string;
  description: string;
  image?: string;
}

const deviceGuideLinks = [
  {
    title: "iPhone Repair Guides",
    href: "/repairs/phone/iphone",
    description: "Screen, battery, back glass and charging articles for supported iPhone models.",
  },
  {
    title: "Samsung Repair Guides",
    href: "/repairs/phone/samsung",
    description: "Galaxy phone repair notes for screen, battery, charging and assessment topics.",
  },
  {
    title: "Google Pixel Repair Guides",
    href: "/repairs/phone/google-pixel",
    description: "Pixel repair guides covering screen, battery, fingerprint and charging issues.",
  },
  {
    title: "iPad & Tablet Repair Guides",
    href: "/repairs/tablet",
    description: "iPad, Samsung Tablet and Lenovo Tablet repair advice and model guidance.",
  },
  {
    title: "MacBook Repair Guides",
    href: "/repairs/laptop/macbook",
    description: "MacBook screen, battery, keyboard/top case and charging repair notes.",
  },
  {
    title: "Apple Watch Repair Guides",
    href: "/repairs/watch/apple",
    description: "Apple Watch screen, battery, charging and water-exposure assessment notes.",
  },
];

function formatPostDate(date: string) {
  return new Date(date).toLocaleDateString("en-AU", {
    month: "short",
    day: "numeric",
  });
}

export default async function BlogPage() {
  let allPostsData: BlogPostSummary[] = [];

  try {
    allPostsData = (await getSortedPostsData()) as BlogPostSummary[];
  } catch (err) {
    console.error("CRITICAL: Failed to load blog posts in page component:", err);
  }

  if (allPostsData.length === 0) {
    return (
      <main className={styles.archive}>
        <section className={styles.emptyState}>
          <span className={styles.kicker}>Repair Notes</span>
          <h1>No Articles Found</h1>
          <p>Check back soon for new repair guides and tech news.</p>
          <Link href="/" className={styles.primaryLink}>
            Return Home
          </Link>
        </section>
      </main>
    );
  }

  const [featuredPost, ...remainingPosts] = allPostsData;

  return (
    <main className={styles.archive}>
      <section className={styles.hero} aria-labelledby="blog-heading">
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <span className={styles.kicker}>Repair Intelligence</span>
            <h1 id="blog-heading">Field notes from the repair bench.</h1>
            <p>
              Practical guides for phone, tablet, and laptop owners who want clear answers before they
              book a repair.
            </p>
          </div>

          <Link href={`/blog/${featuredPost.slug}`} className={styles.featuredCard}>
            <div className={styles.featuredImage}>
              <BlogImage
                src={featuredPost.image}
                alt={featuredPost.title}
                className={styles.image}
                priority
              />
            </div>
            <div className={styles.featuredText}>
              <span className={styles.meta}>{formatPostDate(featuredPost.date)}</span>
              <h2>{featuredPost.title}</h2>
              <p>{featuredPost.description}</p>
              <span className={styles.readLink}>Read Guide</span>
            </div>
          </Link>
        </div>
      </section>

      <section className={styles.deviceSection} aria-labelledby="device-guides-heading">
        <div className={styles.sectionHeader}>
          <span className={styles.kicker}>Repair Guides</span>
          <h2 id="device-guides-heading">Browse repair guides by device</h2>
        </div>

        <div className={styles.deviceGrid}>
          {deviceGuideLinks.map((guide) => (
            <Link href={guide.href} key={guide.href} className={styles.deviceCard}>
              <span className={styles.deviceTitle}>{guide.title}</span>
              <p>{guide.description}</p>
              <span className={styles.deviceLink}>View Guides</span>
            </Link>
          ))}
        </div>
      </section>

      {remainingPosts.length > 0 && (
        <section className={styles.gridSection} aria-labelledby="latest-guides-heading">
          <div className={styles.sectionHeader}>
            <span className={styles.kicker}>Latest Guides</span>
            <h2 id="latest-guides-heading">Useful answers, no repair-shop fog.</h2>
          </div>

          <div className={styles.blogGrid}>
            {remainingPosts.map((post, index) => (
              <Link href={`/blog/${post.slug}`} key={post.slug} className={styles.blogCard}>
                <div className={styles.cardImage}>
                  <BlogImage src={post.image} alt={post.title} className={styles.image} />
                  <span className={styles.dateBadge}>{formatPostDate(post.date)}</span>
                </div>
                <div className={styles.cardBody}>
                  <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{post.title}</h3>
                  <p>{post.description}</p>
                  <span className={styles.cardLink}>Continue Reading</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className={styles.ctaSection} aria-labelledby="blog-cta-heading">
        <div className={styles.ctaPanel}>
          <div>
            <h2 id="blog-cta-heading">Need help with a repair question?</h2>
            <p>
              If a guide matches your issue, bring the device to Ali Mobile & Repair in Ringwood
              Square or book a repair so we can confirm the exact model, part availability and quote.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <Link href="/book-repair" className={styles.ctaPrimary}>
              Book Repair
            </Link>
            <Link href="/repairs" className={styles.ctaSecondary}>
              Browse Repairs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
