import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogImage } from "@/components/BlogImage";
import { IphoneScreenRepairCostArticle } from "@/components/blog/IphoneScreenRepairCostArticle";
import { SamsungGalaxySScreenRepairCostArticle } from "@/components/blog/SamsungGalaxySScreenRepairCostArticle";
import { IPHONE_SCREEN_REPAIR_COST_SLUG, IPHONE_SCREEN_REPAIR_COST_STATIC_METADATA } from "@/data/iphoneScreenRepairCost";
import { SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA, SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_SLUG } from "@/data/samsungGalaxySScreenRepairCost";
import { getPostData, isRemovedBlogSlug, type BlogPost } from "@/lib/blog";

import styles from "./BlogPost.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  if (slug === SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_SLUG) {
    return {
      title: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.seoTitle,
      description: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.description,
      alternates: { canonical: `/blog/${slug}` },
      openGraph: {
        title: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.seoTitle,
        description: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.description,
        url: `/blog/${slug}`,
        type: "article",
        locale: "en_AU",
        siteName: "Ali Mobile & Repair",
      },
      twitter: {
        card: "summary_large_image",
        title: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.seoTitle,
        description: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.description,
      },
    };
  }

  try {
    const postData = await getPostData(slug);

    const metaTitle = postData.seo_title || `${postData.title} | Ali Mobile Repair Blog`;

    return {
      title: metaTitle,
      description: postData.description,
      alternates: {
        canonical: `/blog/${slug}`,
      },
      openGraph: {
        title: metaTitle,
        description: postData.description,
        url: `/blog/${slug}`,
        type: "article",
        locale: "en_AU",
        siteName: "Ali Mobile & Repair",
        images: postData.image ? [{ url: postData.image, alt: postData.cover_image_alt || postData.title }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: metaTitle,
        description: postData.description,
        images: postData.image ? [postData.image] : undefined,
      },
    };
  } catch {
    return { title: "Blog Post | Ali Mobile Repair", description: "" };
  }
}

export default async function PostDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (isRemovedBlogSlug(slug)) {
    notFound();
  }

  const isIphoneScreenCostArticle = slug === IPHONE_SCREEN_REPAIR_COST_SLUG;
  const isSamsungGalaxySScreenCostArticle = slug === SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_SLUG;
  let postData: BlogPost;
  if (isSamsungGalaxySScreenCostArticle) {
    postData = {
        slug,
        title: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.title,
        date: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.datePublished,
        description: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.description,
        contentHtml: "",
        image: undefined,
        source: "markdown" as const,
        seo_title: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.seoTitle,
        cover_image_alt: null,
        author_name: "Ali Mobile & Repair",
        hero_intro: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.heroIntro,
        updated_at: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.dateModified,
    };
  } else {
    try {
      postData = await getPostData(slug);
    } catch {
      notFound();
    }
  }

  const datePublished = isSamsungGalaxySScreenCostArticle
    ? SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.datePublished
    : isIphoneScreenCostArticle
    ? IPHONE_SCREEN_REPAIR_COST_STATIC_METADATA.datePublished
    : postData.date;
  const dateModified = isSamsungGalaxySScreenCostArticle
    ? SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.dateModified
    : isIphoneScreenCostArticle
    ? IPHONE_SCREEN_REPAIR_COST_STATIC_METADATA.dateModified
    : postData.updated_at || postData.date;
  const formattedDate = datePublished
    ? new Date(datePublished).toLocaleDateString("en-AU", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const authorName = postData.author_name || "Ali Mobile & Repair";
  const authorType = authorName === "Ali Mobile & Repair" ? "Organization" : "Person";

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: postData.title,
    description: postData.description,
    author: {
      "@type": authorType,
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Ali Mobile & Repair",
    },
    datePublished,
    dateModified,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.alimobile.com.au/blog/${slug}`,
    },
  };

  if (postData.image) {
    jsonLd.image = [postData.image.startsWith("/") ? `https://www.alimobile.com.au${postData.image}` : postData.image];
  }

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.shell}>
        <Link href="/blog" className={styles.backLink}>
          Back to Blog
        </Link>

        <section className={styles.hero} aria-labelledby="article-title">
          <div className={styles.heroCopy}>
            <span className={styles.kicker}>Repair Guide</span>
            <div className={styles.metaRow} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.875rem', color: 'var(--color-neu-text-secondary)', marginBottom: '1rem' }}>
              {formattedDate && <span className={styles.dateLabel}>{formattedDate}</span>}
              {formattedDate && <span>•</span>}
              <span>By {authorName}</span>
            </div>
            <h1 id="article-title">{postData.title}</h1>
            {(postData.hero_intro || postData.description) && <p>{postData.hero_intro || postData.description}</p>}
          </div>

          {postData.image && !isIphoneScreenCostArticle && (
            <div className={styles.coverWrapper} style={{ objectFit: 'cover', width: '100%', maxHeight: '600px', overflow: 'hidden' }}>
              <BlogImage
                src={postData.image}
                alt={postData.cover_image_alt || postData.title}
                className={styles.coverImage}
                priority
              />
            </div>
          )}
        </section>

        <article className={styles.articleCard}>
          {isSamsungGalaxySScreenCostArticle ? (
            <SamsungGalaxySScreenRepairCostArticle />
          ) : isIphoneScreenCostArticle ? (
            <IphoneScreenRepairCostArticle />
          ) : (
            <div
              className={styles.articleBody}
              dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
            />
          )}
        </article>

        <section className={styles.ctaCard}>
          <span className={styles.kicker}>Ringwood Repairs</span>
          <h2>Need a hands-on diagnosis?</h2>
          <p>
            Bring your phone, tablet, or laptop to Ali Mobile & Repair for a practical quote and
            same-day repair may be available for many common phone models when parts are in stock.
            Contact us first to confirm your model, issue and timing.
          </p>
          <Link href="/book-repair" className={styles.ctaButton}>
            Book Repair Now
          </Link>
        </section>
      </div>
    </main>
  );
}
