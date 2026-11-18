import Link from "next/link";
import { Clock3, ShieldCheck } from "lucide-react";
import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogImage } from "@/components/BlogImage";
import { IphoneBatteryHealthArticle } from "@/components/blog/IphoneBatteryHealthArticle";
import { IphoneScreenRepairCostArticle } from "@/components/blog/IphoneScreenRepairCostArticle";
import { IpadScreenRepairCostArticle } from "@/components/blog/IpadScreenRepairCostArticle";
import { MacbookScreenRepairArticle } from "@/components/blog/MacbookScreenRepairArticle";
import { PhoneNotChargingArticle } from "@/components/blog/PhoneNotChargingArticle";
import { PhoneScreenBlackArticle } from "@/components/blog/PhoneScreenBlackArticle";
import { SamsungGalaxySScreenRepairCostArticle } from "@/components/blog/SamsungGalaxySScreenRepairCostArticle";
import { buildIphoneScreenRepairPriceTable, IPHONE_SCREEN_REPAIR_COST_SLUG } from "@/data/iphoneScreenRepairCost";
import { buildIpadScreenRepairPriceTable, IPAD_SCREEN_REPAIR_COST_SLUG } from "@/data/ipadScreenRepairCost";
import { buildMacbookAirScreenRepairPriceTable, MACBOOK_SCREEN_REPAIR_BLOG_SLUG } from "@/data/macbookScreenRepairBlog";
import { buildPhoneScreenBrandPriceTable, PHONE_SCREEN_BLACK_BLOG_SLUG } from "@/data/phoneScreenBlackArticle";
import { buildSamsungGalaxySScreenRepairPriceTable, SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA, SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_SLUG } from "@/data/samsungGalaxySScreenRepairCost";
import { fetchRepairCatalog } from "@/lib/api";
import { getPostData, isRemovedBlogSlug, type BlogPost } from "@/lib/blog";
import { effectiveBlogDateModified, isPriceBlogSlug } from "@/lib/blogPriceFreshness";

import styles from "./BlogPost.module.css";

export const dynamic = "force-dynamic";
const getBlogCatalogue = cache(fetchRepairCatalog);

async function priceChangedAtForSlug(slug: string) {
  if (!isPriceBlogSlug(slug)) return null;
  try {
    const catalogue = await getBlogCatalogue();
    return catalogue.blogPriceFreshness?.[slug]?.priceChangedAt ?? null;
  } catch {
    return null;
  }
}

const PHONE_NOT_CHARGING_SLUG = "why-is-my-phone-not-charging";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  if (slug === SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_SLUG) {
    const postData = await getPostData(slug);
    const dateModified = effectiveBlogDateModified(
      postData.updated_at || postData.date, await priceChangedAtForSlug(slug),
    );
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
        publishedTime: postData.date,
        modifiedTime: dateModified,
        images: [{
          url: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.image,
          alt: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.coverImageAlt,
        }],
      },
      twitter: {
        card: "summary_large_image",
        title: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.seoTitle,
        description: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.description,
        images: [SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.image],
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
        publishedTime: postData.date,
        modifiedTime: effectiveBlogDateModified(
          postData.updated_at || postData.date, await priceChangedAtForSlug(slug),
        ),
        authors: [postData.author_name || "Ali Mobile & Repair"],
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
  const isIpadScreenCostArticle = slug === IPAD_SCREEN_REPAIR_COST_SLUG;
  const isIphoneBatteryHealthArticle = slug === "when-should-you-replace-iphone-battery";
  const isPhoneNotChargingArticle = slug === PHONE_NOT_CHARGING_SLUG;
  const isPhoneScreenBlackArticle = slug === PHONE_SCREEN_BLACK_BLOG_SLUG;
  const isMacbookScreenRepairArticle = slug === MACBOOK_SCREEN_REPAIR_BLOG_SLUG;
  const isSamsungGalaxySScreenCostArticle = slug === SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_SLUG;
  let postData: BlogPost;
  if (isSamsungGalaxySScreenCostArticle) {
    const editorialPost = await getPostData(slug);
    postData = {
        slug,
        title: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.title,
        date: editorialPost.date,
        description: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.description,
        contentHtml: "",
        image: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.image,
        source: "markdown" as const,
        seo_title: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.seoTitle,
        cover_image_alt: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.coverImageAlt,
        author_name: "Ali Mobile & Repair",
        hero_intro: SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_METADATA.heroIntro,
        updated_at: editorialPost.updated_at,
    };
  } else {
    try {
      postData = await getPostData(slug);
    } catch {
      notFound();
    }
  }

  let iphoneScreenPriceTable = null;
  let priceChangedAt: string | null = null;
  if (isIphoneScreenCostArticle) {
    try {
      const catalogue = await getBlogCatalogue();
      iphoneScreenPriceTable = buildIphoneScreenRepairPriceTable(catalogue);
      priceChangedAt = catalogue.blogPriceFreshness?.[IPHONE_SCREEN_REPAIR_COST_SLUG]?.priceChangedAt ?? null;
    } catch {
      // The article must not substitute stale fixed prices when the catalogue is unavailable.
      iphoneScreenPriceTable = null;
    }
  }

  let macbookAirScreenPriceTable = null;
  if (isMacbookScreenRepairArticle) {
    try {
      const catalogue = await getBlogCatalogue();
      macbookAirScreenPriceTable = buildMacbookAirScreenRepairPriceTable(catalogue);
      priceChangedAt = catalogue.blogPriceFreshness?.[MACBOOK_SCREEN_REPAIR_BLOG_SLUG]?.priceChangedAt ?? null;
    } catch {
      // Do not show a fixed fallback amount when the public catalogue is unavailable.
      macbookAirScreenPriceTable = null;
    }
  }

  let ipadScreenPriceTable = null;
  if (isIpadScreenCostArticle) {
    try {
      const catalogue = await getBlogCatalogue();
      ipadScreenPriceTable = buildIpadScreenRepairPriceTable(catalogue);
      priceChangedAt = catalogue.blogPriceFreshness?.[IPAD_SCREEN_REPAIR_COST_SLUG]?.priceChangedAt ?? null;
    } catch {
      // Do not show a fixed fallback amount when the public catalogue is unavailable.
      ipadScreenPriceTable = null;
    }
  }

  let phoneScreenBrandPriceTable = null;
  if (isPhoneScreenBlackArticle) {
    try {
      const catalogue = await getBlogCatalogue();
      phoneScreenBrandPriceTable = buildPhoneScreenBrandPriceTable(catalogue);
      priceChangedAt = catalogue.blogPriceFreshness?.[PHONE_SCREEN_BLACK_BLOG_SLUG]?.priceChangedAt ?? null;
    } catch {
      // Do not substitute fixed ranges when the public catalogue is unavailable.
      phoneScreenBrandPriceTable = null;
    }
  }

  let samsungGalaxySScreenPriceTable = null;
  if (isSamsungGalaxySScreenCostArticle) {
    try {
      const catalogue = await getBlogCatalogue();
      samsungGalaxySScreenPriceTable = buildSamsungGalaxySScreenRepairPriceTable(catalogue);
      priceChangedAt = catalogue.blogPriceFreshness?.[SAMSUNG_GALAXY_S_SCREEN_REPAIR_COST_SLUG]?.priceChangedAt ?? null;
    } catch {
      // Do not substitute stale fixed prices when the public catalogue is unavailable.
      samsungGalaxySScreenPriceTable = null;
    }
  }

  const datePublished = postData.date;
  const dateModified = effectiveBlogDateModified(postData.updated_at || postData.date, priceChangedAt);
  const formatDate = (date: string) => new Date(date).toLocaleDateString("en-AU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Australia/Melbourne",
  });
  const formattedDatePublished = datePublished
    ? formatDate(datePublished)
    : "";
  const hasDistinctUpdatedDate = Boolean(dateModified && formatDate(dateModified) !== formattedDatePublished);
  const formattedDateModified = hasDistinctUpdatedDate ? formatDate(dateModified) : "";

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
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.shell}>
        <Link href="/blog" className={styles.backLink}>
          Back to Blog
        </Link>

        <section
          className={`${styles.hero} ${isPhoneNotChargingArticle || isPhoneScreenBlackArticle ? styles.phoneChargingHero : ""} ${isIpadScreenCostArticle ? styles.ipadCostHero : ""}`}
          aria-labelledby="article-title"
        >
          <div className={styles.heroCopy}>
            <span className={styles.kicker}>Repair Guide</span>
            <div className={styles.metaRow}>
              {formattedDatePublished && <span className={styles.dateLabel}>Published {formattedDatePublished}</span>}
              {formattedDateModified && <span aria-hidden="true">•</span>}
              {formattedDateModified && <span className={styles.dateLabel}>Updated {formattedDateModified}</span>}
              {(formattedDatePublished || formattedDateModified) && <span aria-hidden="true">•</span>}
              <span>By {authorName}</span>
            </div>
            <h1 id="article-title">{postData.title}</h1>
            {(postData.hero_intro || postData.description) && <p>{postData.hero_intro || postData.description}</p>}
            {isIpadScreenCostArticle && (
              <div className={styles.ipadHeroFacts} aria-label="iPad repair information">
                <span><Clock3 size={18} aria-hidden="true" /> Approx. 1 Hour Repair</span>
                <span><ShieldCheck size={18} aria-hidden="true" /> 6-Month Warranty</span>
              </div>
            )}
          </div>

          {postData.image && !isIphoneScreenCostArticle && !isIpadScreenCostArticle && (
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
          <SamsungGalaxySScreenRepairCostArticle priceTable={samsungGalaxySScreenPriceTable} />
          ) : isIphoneScreenCostArticle ? (
            <IphoneScreenRepairCostArticle priceTable={iphoneScreenPriceTable} />
          ) : isIpadScreenCostArticle ? (
            <IpadScreenRepairCostArticle priceTable={ipadScreenPriceTable} />
          ) : isIphoneBatteryHealthArticle ? (
            <div className={styles.articleBody}><IphoneBatteryHealthArticle /></div>
          ) : isPhoneNotChargingArticle ? (
            <div className={styles.articleBody}><PhoneNotChargingArticle /></div>
          ) : isPhoneScreenBlackArticle ? (
            <div className={styles.articleBody}><PhoneScreenBlackArticle priceTable={phoneScreenBrandPriceTable} /></div>
          ) : isMacbookScreenRepairArticle ? (
            <MacbookScreenRepairArticle priceTable={macbookAirScreenPriceTable} />
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
            {isIpadScreenCostArticle
              ? "Bring your iPad to Ali Mobile & Repair for model confirmation, screen testing and frame assessment. Parts availability and timing are confirmed before work begins."
              : isMacbookScreenRepairArticle
              ? "Bring your MacBook to Ali Mobile & Repair for model confirmation and display assessment. Parts availability and timing are confirmed before work begins."
              : isIphoneBatteryHealthArticle
              ? "Bring your iPhone to Ali Mobile & Repair for an assessment. Contact us first to confirm your model, issue and timing."
              : isPhoneScreenBlackArticle
              ? "Bring your phone to Ali Mobile & Repair for display and power checks. We will confirm the likely fault and available repair options before work begins."
              : "Bring your phone, tablet, or laptop to Ali Mobile & Repair for a practical quote and same-day repair may be available for many common phone models when parts are in stock. Contact us first to confirm your model, issue and timing."}
          </p>
          <Link href="/book-repair" className={styles.ctaButton}>
            Book Repair Now
          </Link>
        </section>
      </div>
    </div>
  );
}
