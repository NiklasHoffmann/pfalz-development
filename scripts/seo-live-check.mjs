import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = (
  process.env.SEO_CHECK_BASE_URL || 'https://pfalz-development.de'
).replace(/\/$/, '');
const routesPath = path.resolve('src/config/seo-routes.json');

function extractTitle(html) {
  const match = html.match(/<title>(.*?)<\/title>/is);
  return match?.[1]?.trim() || '';
}

function extractCanonical(html) {
  const match = html.match(
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i
  );
  return match?.[1]?.trim() || '';
}

const routeDefinitions = JSON.parse(await fs.readFile(routesPath, 'utf8'));
const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`);

if (!sitemapResponse.ok) {
  console.error(
    `Failed to fetch sitemap.xml: ${sitemapResponse.status} ${sitemapResponse.statusText}`
  );
  process.exit(1);
}

const sitemapXml = await sitemapResponse.text();
let hasError = false;

for (const route of routeDefinitions) {
  const url = `${baseUrl}${route.path}`;
  const sitemapEntry = `<loc>${url}</loc>`;

  if (!sitemapXml.includes(sitemapEntry)) {
    hasError = true;
    console.error(`[FAIL] Missing from sitemap: ${url}`);
    continue;
  }

  const response = await fetch(url, { redirect: 'follow' });

  if (!response.ok) {
    hasError = true;
    console.error(`[FAIL] ${url} -> HTTP ${response.status}`);
    continue;
  }

  const html = await response.text();
  const title = extractTitle(html);
  const canonical = extractCanonical(html);

  if (!title) {
    hasError = true;
    console.error(`[FAIL] Missing <title>: ${url}`);
    continue;
  }

  if (!canonical) {
    hasError = true;
    console.error(`[FAIL] Missing canonical: ${url}`);
    continue;
  }

  console.log(`[ OK ] ${url}`);
  console.log(`       title: ${title}`);
  console.log(`       canonical: ${canonical}`);
}

if (hasError) {
  console.error('\nSEO live check failed.');
  process.exit(1);
}

console.log('\nSEO live check passed.');
