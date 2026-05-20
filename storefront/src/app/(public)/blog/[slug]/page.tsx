import Link from "next/link";

import { BlogImage } from "@/components/BlogImage";
import { getPostData } from "@/lib/blog";

import styles from "./BlogPost.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const postData = await getPostData(slug);

    return {
      title: `${postData.title} | Ali Mobile Repair Blog`,
      description: postData.description,
    };
  } catch {
    return { title: "Blog Post | Ali Mobile Repair", description: "" };
  }
}

export default async function PostDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const postData = await getPostData(slug);

  const formattedDate = postData.date
    ? new Date(postData.date).toLocaleDateString("en-AU", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <Link href="/blog" className={styles.backLink}>
          Back to Blog
        </Link>

        <section className={styles.hero} aria-labelledby="article-title">
          <div className={styles.heroCopy}>
            <span className={styles.kicker}>Repair Guide</span>
            {formattedDate && <span className={styles.dateLabel}>{formattedDate}</span>}
            <h1 id="article-title">{postData.title}</h1>
            {postData.description && <p>{postData.description}</p>}
          </div>

          {postData.image && (
            <div className={styles.coverWrapper}>
              <BlogImage
                src={postData.image}
                alt={postData.title}
                className={styles.coverImage}
                priority
              />
            </div>
          )}
        </section>

        <article className={styles.articleCard}>
          <div
            className={styles.articleBody}
            dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
          />
        </article>

        <section className={styles.ctaCard}>
          <span className={styles.kicker}>Ringwood Repairs</span>
          <h2>Need a hands-on diagnosis?</h2>
          <p>
            Bring your phone, tablet, or laptop to Ali Mobile & Repair for a practical quote and
            same-day help on common screen and battery repairs.
          </p>
          <Link href="/book-repair" className={styles.ctaButton}>
            Book Repair Now
          </Link>
        </section>
      </div>
    </main>
  );
}
