export interface ContentMetadata {
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  siteName?: string;
  domain?: string;
}

const REQUEST_TIMEOUT_MS = 7000;

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');

const sanitizeUrl = (inputUrl: string) => {
  const trimmed = inputUrl.trim();
  if (!trimmed) {
    throw new Error('URL is required');
  }

  const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return new URL(normalized).toString();
};

const extractFirstMatch = (html: string, patterns: RegExp[]) => {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return decodeHtmlEntities(match[1].trim());
    }
  }
  return undefined;
};

const resolveMaybeRelativeUrl = (value: string | undefined, baseUrl: string) => {
  if (!value) {
    return undefined;
  }
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return value;
  }
};

const withTimeout = async (url: string, init?: RequestInit) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        ...(init?.headers || {})
      }
    });
  } finally {
    clearTimeout(timer);
  }
};

const extractYouTubeVideoId = (url: string) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace('/', '');
    }
    if (parsed.hostname.includes('youtube.com')) {
      return parsed.searchParams.get('v') || undefined;
    }
    return undefined;
  } catch {
    return undefined;
  }
};

const fetchYoutubeMetadata = async (sourceUrl: string): Promise<ContentMetadata> => {
  const videoId = extractYouTubeVideoId(sourceUrl);
  const fallbackThumbnail = videoId
    ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    : undefined;

  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(sourceUrl)}&format=json`;
    const response = await withTimeout(oembedUrl);
    if (!response.ok) {
      return {
        image: fallbackThumbnail,
        siteName: 'YouTube',
        domain: 'youtube.com'
      };
    }

    const data = await response.json();
    return {
      title: data?.title,
      image: data?.thumbnail_url || fallbackThumbnail,
      siteName: 'YouTube',
      domain: 'youtube.com'
    };
  } catch {
    return {
      image: fallbackThumbnail,
      siteName: 'YouTube',
      domain: 'youtube.com'
    };
  }
};

const fetchHtmlMetadata = async (sourceUrl: string): Promise<ContentMetadata> => {
  const response = await withTimeout(sourceUrl);
  if (!response.ok) {
    throw new Error('Unable to fetch URL');
  }

  const html = await response.text();
  const title =
    extractFirstMatch(html, [
      /<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+name=["']twitter:title["'][^>]*content=["']([^"']+)["'][^>]*>/i,
      /<title[^>]*>([^<]+)<\/title>/i
    ]) || undefined;

  const description =
    extractFirstMatch(html, [
      /<meta[^>]+property=["']og:description["'][^>]*content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i
    ]) || undefined;

  const image = resolveMaybeRelativeUrl(
    extractFirstMatch(html, [
      /<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i,
      /<meta[^>]+name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i
    ]),
    sourceUrl
  );

  const favicon = resolveMaybeRelativeUrl(
    extractFirstMatch(html, [
      /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>/i
    ]),
    sourceUrl
  );

  const siteName =
    extractFirstMatch(html, [
      /<meta[^>]+property=["']og:site_name["'][^>]*content=["']([^"']+)["'][^>]*>/i
    ]) || undefined;

  return {
    title,
    description,
    image,
    favicon,
    siteName,
    domain: new URL(sourceUrl).hostname.replace(/^www\./, '')
  };
};

export const fetchContentMetadata = async (
  inputUrl: string,
  type?: 'document' | 'tweet' | 'youtube' | 'link'
): Promise<ContentMetadata> => {
  const sourceUrl = sanitizeUrl(inputUrl);

  if (type === 'youtube') {
    return fetchYoutubeMetadata(sourceUrl);
  }

  try {
    const metadata = await fetchHtmlMetadata(sourceUrl);
    if (type === 'tweet') {
      return {
        ...metadata,
        siteName: metadata.siteName || 'X/Twitter',
        domain: metadata.domain || 'x.com'
      };
    }
    return metadata;
  } catch {
    return {
      domain: new URL(sourceUrl).hostname.replace(/^www\./, '')
    };
  }
};
