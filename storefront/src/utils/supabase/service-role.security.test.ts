import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Service Role Security', () => {
  const serviceRolePath = path.resolve(__dirname, 'service-role.ts');
  const sourceCode = fs.readFileSync(serviceRolePath, 'utf8');

  it('remains a server-only module in production source', () => {
    expect(sourceCode).toContain("import 'server-only';");
  });

  it('contains no NEXT_PUBLIC service-role key', () => {
    expect(sourceCode).not.toContain('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');
  });

  it('is not imported by any client component', () => {
    const findClientImports = (dir: string): string[] => {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      list.forEach((file) => {
        const filePath = path.resolve(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          results = results.concat(findClientImports(filePath));
        } else if ((filePath.endsWith('.ts') || filePath.endsWith('.tsx')) && !filePath.endsWith('.test.ts') && !filePath.endsWith('.test.tsx')) {
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes('use client') || content.includes('"use client"') || content.includes("'use client'")) {
            if (content.includes('service-role')) {
              results.push(filePath);
            }
          }
        }
      });
      return results;
    };

    const srcPath = path.resolve(__dirname, '../../');
    const violations = findClientImports(srcPath);
    expect(violations).toEqual([]);
  });
});
