import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogDir = path.join(__dirname, '../storefront/src/content/blog');

const topic = process.argv[2] || 'Professional Device Repair';
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

const date = new Date().toISOString().split('T')[0];
const slug = `${slugify(topic)}-${slugify(location)}`;
const filePath = path.join(blogDir, `${slug}.md`);

const content = `---
title: "${topic} in ${location}"
description: "Expert ${topic.toLowerCase()} services at Ali Mobile Repair in ${location}. High-quality parts and fast turnaround."
date: "${date}"
---

Looking for professional **${topic.toLowerCase()}** in **${location}**? **Ali Mobile & Repair** is your local expert.

We understand that a broken device can be a major inconvenience. That's why our skilled technicians are dedicated to providing fast, reliable, and affordable solutions for all your tech needs.

### What We Offer:
- **Precision Repairs**: We use high-quality parts to ensure your device performs like new.
- **Fast Turnaround**: Most repairs are completed within 60 minutes.
- **Expertise**: Specializing in iPhone, iPad, Samsung, and MacBook repairs.

Whether you're dealing with a cracked screen, a failing battery, or complex hardware issues, we're here to help. Located conveniently in **Ringwood**, we serve the greater Melbourne area with professional care.

Visit our shop at **Shop 28, Ringwood Square Shopping Centre** or call us at **0481 058 514** for a free quote!
`;

try {
  if (!fs.existsSync(blogDir)) {
    fs.mkdirSync(blogDir, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
  console.log(`\x1b[32m✅ Successfully generated blog post:\x1b[0m`);
  console.log(`\x1b[36mFile:\x1b[0m ${filePath}`);
  console.log(`\x1b[36mSlug:\x1b[0m /blog/${slug}`);
} catch (error) {
  console.error(`\x1b[31m❌ Error generating blog post:\x1b[0m`, error);
}
