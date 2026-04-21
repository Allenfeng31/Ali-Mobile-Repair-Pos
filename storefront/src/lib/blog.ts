import fs from 'fs';
// Deployment Trigger: 2026-04-01T16:36:00
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'src/content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  image?: string;
  contentHtml: string;
}

/**
 * Capitalizes titles according to standard conventions, 
 * with hardcoded overrides for brand names.
 */
function capitalizeTitle(title: string): string {
  if (!title) return '';
  
  // Standard title case
  const words = title.toLowerCase().split(' ');
  const capitalizedWords = words.map((word, index) => {
    // Hardcoded Brand Mappings
    if (word === 'iphone') return 'iPhone';
    if (word === 'ipad') return 'iPad';
    if (word === 'samsung') return 'Samsung';
    if (word === 'google') return 'Google';
    if (word === 'pixel') return 'Pixel';
    if (word === 'macbook') return 'MacBook';
    
    // Capitalize first letter of all other words
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  return capitalizedWords.join(' ');
}

export async function getSortedPostsData() {
  // Get file names under /content/blog
  if (!fs.existsSync(postsDirectory)) return [];
  const fileNames = fs.readdirSync(postsDirectory).filter(fileName => fileName.endsWith('.md'));
  
  const allPostsData = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    const title = capitalizeTitle(matterResult.data.title || '');
    const date = matterResult.data.date || '';
    
    // Excerpt/Description fallback: If no description, take first 100 chars of content
    let description = matterResult.data.description || '';
    if (!description && matterResult.content) {
      description = matterResult.content
        .replace(/[#*`]/g, '') // Strip basic markdown
        .trim()
        .slice(0, 100) + '...';
    }

    return {
      slug,
      title,
      date,
      description,
      image: matterResult.data.image,
      content: matterResult.content
    };
  });

  // Filter out posts with empty titles or invalid dates
  const filteredPosts = allPostsData.filter(post => {
    const hasTitle = post.title.trim().length > 0;
    const hasValidDate = post.date && !isNaN(new Date(post.date).getTime());
    return hasTitle && hasValidDate;
  });

  // Sort posts by date
  return filteredPosts.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

export async function getPostData(slug: string): Promise<BlogPost> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    contentHtml,
    title: capitalizeTitle(matterResult.data.title || ''),
    date: matterResult.data.date || '',
    description: matterResult.data.description || '',
    image: matterResult.data.image,
  };
}
