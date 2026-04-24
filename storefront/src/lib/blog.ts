import fs from 'fs';
// Deployment Trigger: 2026-04-01T16:36:00
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { createClient } from '@supabase/supabase-js';

const postsDirectory = path.join(process.cwd(), 'src/content/blog');

// Server-side Supabase client for blog fetching
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServer = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  image?: string;
  contentHtml: string;
  source?: 'markdown' | 'supabase';
}

/**
 * Capitalizes titles according to standard conventions, 
 * with hardcoded overrides for brand names.
 */
function capitalizeTitle(title: string): string {
  if (!title) return '';
  
  const words = title.toLowerCase().split(' ');
  const capitalizedWords = words.map((word, index) => {
    if (word === 'iphone') return 'iPhone';
    if (word === 'ipad') return 'iPad';
    if (word === 'samsung') return 'Samsung';
    if (word === 'google') return 'Google';
    if (word === 'pixel') return 'Pixel';
    if (word === 'macbook') return 'MacBook';
    
    return word.charAt(0).toUpperCase() + word.slice(1);
  });

  return capitalizedWords.join(' ');
}

/**
 * Fetch published blog posts from Supabase storefront_blogs table.
 */
async function getSupabasePosts(): Promise<BlogPost[]> {
  if (!supabaseServer) return [];

  try {
    const { data, error } = await supabaseServer
      .from('storefront_blogs')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching Supabase blog posts:', error);
      return [];
    }

      return (data || []).map((post: any) => ({
      slug: post.slug || `post-${post.id}`,
      title: post.title || 'Untitled Post',
      date: post.published_at || post.created_at || new Date().toISOString(),
      description: post.description || '',
      image: post.cover_image || undefined,
      contentHtml: post.content || '',
      source: 'supabase' as const,
    }));
  } catch (err) {
    console.error('Failed to fetch Supabase blog posts:', err);
    return [];
  }
}

/**
 * Get sorted posts from BOTH markdown files and Supabase.
 */
export async function getSortedPostsData() {
  // 1. Get markdown posts
  const markdownPosts: any[] = [];
  if (fs.existsSync(postsDirectory)) {
    const fileNames = fs.readdirSync(postsDirectory).filter(fileName => fileName.endsWith('.md'));
    
    for (const fileName of fileNames) {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      const title = capitalizeTitle(matterResult.data.title || '');
      const date = matterResult.data.date || '';
      
      let description = matterResult.data.description || '';
      if (!description && matterResult.content) {
        description = matterResult.content
          .replace(/[#*`]/g, '')
          .trim()
          .slice(0, 100) + '...';
      }

      markdownPosts.push({
        slug,
        title,
        date,
        description,
        image: matterResult.data.image,
        content: matterResult.content,
        source: 'markdown',
      });
    }
  }

  // 2. Get Supabase posts
  let supabasePosts: any[] = [];
  try {
    supabasePosts = await getSupabasePosts();
  } catch (err) {
    console.error('Error in getSortedPostsData (Supabase fetch):', err);
  }

  // 3. Merge both sources
  try {
    const allPosts = [...markdownPosts, ...supabasePosts];

    // Filter out posts with empty titles or invalid dates
    const filteredPosts = allPosts.filter(post => {
      if (!post) return false;
      const title = String(post.title || '').trim();
      const hasTitle = title.length > 0;
      const dateVal = post.date;
      const hasValidDate = dateVal && !isNaN(new Date(dateVal).getTime());
      return hasTitle && hasValidDate;
    });

    // Sort posts by date (newest first)
    return filteredPosts.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  } catch (err) {
    console.error('Error merging or sorting blog posts:', err);
    return markdownPosts; // Fallback to just markdown if merge fails
  }
}

/**
 * Get a single post by slug — checks Supabase first, then falls back to markdown.
 */
export async function getPostData(slug: string): Promise<BlogPost> {
  // Try Supabase first
  if (supabaseServer) {
    try {
      const { data, error } = await supabaseServer
        .from('storefront_blogs')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (data && !error) {
        return {
          slug: data.slug,
          title: data.title,
          date: data.published_at || data.created_at,
          description: data.description || '',
          image: data.cover_image || undefined,
          contentHtml: data.content || '',
          source: 'supabase',
        };
      }
    } catch {
      // Fall through to markdown
    }
  }

  // Fall back to markdown file
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
    source: 'markdown',
  };
}
