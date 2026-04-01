import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogDir = path.join(__dirname, '../storefront/src/content/blog');

const isJsonMode = process.argv.includes('--json');
const rawTopic = process.argv.filter(arg => !arg.startsWith('--'))[2] || 'Professional Device Repair';
const location = 'Ringwood, Melbourne';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/**
 * Generates a detailed AI Art prompt based on the blog topic.
 * Aims for realistic, high-tech, professional photography style.
 */
function getAiImagePrompt(topic) {
  const base = "Professional high-detail photography of ";
  const style = ", cinematic lighting, macro lens, 4k, clean workbench, technical repair environment, sharp focus, vibrant colors";
  
  let subject = topic.toLowerCase();
  
  if (subject.includes('screen') || subject.includes('iphone') || subject.includes('display')) {
    subject = "a technician repairing a cracked iPhone screen with precision tools, glowing OLED display";
  } else if (subject.includes('tablet') || subject.includes('ipad') || subject.includes('charging')) {
    subject = "a disassembled iPad on a magnetic repair mat, internal components visible, professional tools";
  } else if (subject.includes('system') || subject.includes('software') || subject.includes('recovery') || subject.includes('data')) {
    subject = "a computer screen showing data recovery progress bars, digital matrix background, high-tech lab";
  } else if (subject.includes('water') || subject.includes('liquid')) {
    subject = "microscopic view of cleaning corrosion on a logic board with isopropyl alcohol and a specialized brush";
  } else if (subject.includes('macbook') || subject.includes('laptop')) {
    subject = "a sleek modern MacBook open on a repair desk, specialized screwdrivers, internal circuitry exposed";
  } else {
    subject = `professional mobile phone repair workbench, ${topic} tools, high-tech aesthetic`;
  }

  return encodeURIComponent(base + subject + style);
}

const date = new Date().toISOString();
const slug = `${slugify(rawTopic)}-${slugify(location)}`;
const seed = Math.floor(Math.random() * 1000000);
const aiPrompt = getAiImagePrompt(rawTopic);

// This is the TEMPORARY cloud URL for preview. 
// The backend will download this and save it locally during "Confirm".
const aiImageUrl = `https://image.pollinations.ai/prompt/${aiPrompt}?width=1280&height=720&nologo=true&seed=${seed}`;

const title = `${rawTopic} in ${location}`;
const description = `Expert ${rawTopic.toLowerCase()} services at Ali Mobile Repair in ${location}. High-quality parts and fast turnaround.`;

const markdownContent = `---
title: "${title}"
description: "${description}"
date: "${date}"
image: "/blog/${slug}.png"
---

Looking for professional **${rawTopic.toLowerCase()}** in **${location}**? **Ali Mobile & Repair** is your local expert.

We understand that a broken device can be a major inconvenience. That's why our skilled technicians are dedicated to providing fast, reliable, and affordable solutions for all your tech needs.

### Professional Standards:
- **Precision Repairs**: We use high-quality parts to ensure your device performs like new.
- **Fast Turnaround**: Most repairs are completed within 60 minutes.
- **Expertise**: Specializing in iPhone, iPad, Samsung, and MacBook repairs.

Whether you're dealing with a cracked screen, a failing battery, or complex hardware issues, we're here to help. Located conveniently in **Ringwood**, we serve the greater Melbourne area with professional care.

Visit our shop at **Shop 28, Ringwood Square Shopping Centre** or call us at **0481 058 514** for a free quote!
`;

if (isJsonMode) {
  // Output JSON for the API to consume
  console.log(JSON.stringify({
    title,
    description,
    date,
    image: aiImageUrl, // Return the cloud URL for immediate preview
    slug,
    content: markdownContent
  }));
} else {
  // Original CLI behavior (unlikely to be used now but kept for compatibility)
  const filePath = path.join(blogDir, `${slug}.md`);
  try {
    if (!fs.existsSync(blogDir)) fs.mkdirSync(blogDir, { recursive: true });
    fs.writeFileSync(filePath, markdownContent);
    console.log(`✅ Generated: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error:`, error);
    process.exit(1);
  }
}
