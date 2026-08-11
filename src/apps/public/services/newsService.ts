export interface NewsArticle {
  title: string;
  link: string;
  description: string;
  thumbnail?: string;
  pubDate: string;
  source: string;
}

interface FeedSource {
  name: string;
  url: string;
}

const FEED_SOURCES: FeedSource[] = [
  {
    name: 'ESG Diario',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.esgdiario.com/feed/',
  },
  {
    name: 'La Tercera',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.latercera.com/rss/',
  },
  {
    name: 'El Ciudadano',
    url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.elciudadano.com/feed/',
  },
];

const FALLBACK_ARTICLES: NewsArticle[] = [
  {
    title: 'Chile impulsa proyectos verdes para compensar emisiones corporativas',
    link: 'https://www.latercera.com/',
    description:
      'Empresas y programas chilenos avanzan en reforestación, energía limpia y certificaciones de carbono para viajes y operaciones.',
    pubDate: '2026-08-01T12:00:00.000Z',
    source: 'La Tercera',
  },
  {
    title: 'Economía circular y ESG: el pulso empresarial en América Latina',
    link: 'https://www.elciudadano.com/',
    description:
      'La región acompaña la transición sostenible con más proyectos de compensación de carbono y trazabilidad para cadenas de valor.',
    pubDate: '2026-07-30T10:00:00.000Z',
    source: 'El Ciudadano',
  },
  {
    title: 'Proyectos de mitigación en Chile conectan turismo y carbono',
    link: 'https://www.latercera.com/',
    description:
      'Iniciativas de compensación para viajes de negocios suman verificación, impacto social y respaldo de estándares internacionales.',
    pubDate: '2026-07-28T09:30:00.000Z',
    source: 'La Tercera',
  },
];

const normalizeDescription = (value: string) => {
  const withoutTags = value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return withoutTags.length > 220 ? `${withoutTags.slice(0, 217)}...` : withoutTags;
};

const toArticle = (item: any, sourceName: string): NewsArticle => ({
  title: item.title ?? 'Sin título',
  link: item.link ?? '#',
  description: normalizeDescription(item.description ?? item.content ?? ''),
  thumbnail: item.enclosure?.link ?? item.thumbnail ?? '',
  pubDate: item.pubDate ?? item.published ?? '',
  source: sourceName,
});

export const fetchImpactNews = async (): Promise<NewsArticle[]> => {
  try {
    const responses = await Promise.allSettled(
      FEED_SOURCES.map(async (source) => {
        const response = await fetch(source.url);
        if (!response.ok) {
          throw new Error(`Error ${response.status}`);
        }
        const data = await response.json();
        const items = Array.isArray(data.items) ? data.items : [];
        return items.slice(0, 6).map((item: any) => toArticle(item, source.name));
      })
    );

    const combined = responses
      .flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
      .filter((article) => Boolean(article.title));

    if (combined.length > 0) {
      const unique = combined.filter(
        (article, index, array) =>
          array.findIndex((candidate) => candidate.title === article.title) === index
      );
      return unique.slice(0, 9);
    }
  } catch {
    // fall back below
  }

  return FALLBACK_ARTICLES;
};
