import FirecrawlApp from '@mendable/firecrawl-js';

const app = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const firecrawl = (app as any).v1;

export interface BrandResearch {
  websiteContent: string;
  description: string;
  socialPosts: string;
  discoveredSocials: string[];
}

// Extract social media URLs from scraped page content
function extractSocialLinks(content: string, baseUrl: string): string[] {
  const patterns = [
    /https?:\/\/(www\.)?(instagram\.com|facebook\.com|tiktok\.com|twitter\.com|x\.com|snapchat\.com|youtube\.com|linkedin\.com)\/[^\s"'<>)]+/gi,
  ];
  const found = new Set<string>();

  for (const pattern of patterns) {
    const matches = content.match(pattern) || [];
    for (const m of matches) {
      const clean = m.replace(/[,.)]+$/, '');
      // Filter out generic/homepage links
      if (!/\/(home|explore|login|signup|about|terms|privacy|help|contact)\/?$/i.test(clean)) {
        found.add(clean);
      }
    }
  }

  // Also try common brand handle patterns from the base URL
  try {
    const domain = new URL(baseUrl).hostname.replace(/^www\./, '').split('.')[0];
    if (domain && domain.length > 2) {
      // These will be tried as guesses if nothing found
      found.add(`https://instagram.com/${domain}`);
    }
  } catch { /* ignore */ }

  return Array.from(found).slice(0, 8);
}

export async function researchBrand(brandUrl: string): Promise<BrandResearch> {
  let websiteContent = '';
  let socialPosts = '';
  let discoveredSocials: string[] = [];

  // ── Step 1: Scrape brand website + extract social links ──────
  try {
    const result = await firecrawl.scrapeUrl(brandUrl, {
      formats: ['markdown'],
      onlyMainContent: false, // keep full page to find social links in footer/header
    });
    if (result.success && result.markdown) {
      websiteContent = result.markdown.slice(0, 8000);
      discoveredSocials = extractSocialLinks(result.markdown, brandUrl);
    }
  } catch (err) {
    console.error('Firecrawl website error:', err);
  }

  // ── Step 2: Scrape discovered social pages ───────────────────
  for (const url of discoveredSocials.slice(0, 4)) {
    try {
      const result = await firecrawl.scrapeUrl(url, {
        formats: ['markdown'],
        onlyMainContent: true,
      });
      if (result.success && result.markdown) {
        socialPosts += `\n\n--- ${url} ---\n${result.markdown.slice(0, 2000)}`;
      }
    } catch {
      // silently skip — social pages often block scrapers
    }
  }

  return {
    websiteContent,
    description: websiteContent.slice(0, 3000),
    socialPosts: socialPosts.slice(0, 4000),
    discoveredSocials,
  };
}
