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
    </main>
  );
}
