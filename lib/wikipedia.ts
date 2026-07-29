export interface WikipediaSummary {
  title: string;
  extract: string;
  url: string;
  thumbnail: string | null;
}

export async function fetchWikipediaSummary(
  name: string,
  wikidataId?: string | null
): Promise<WikipediaSummary | null> {
  try {
    if (wikidataId) {
      const fromWikidata = await summaryFromWikidata(wikidataId);
      if (fromWikidata) return fromWikidata;
    }

    const title = encodeURIComponent(name.trim().replace(/\s+/g, "_"));
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 86400 },
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.extract) return null;

    return {
      title: data.title ?? name,
      extract: data.extract as string,
      url: (data.content_urls?.desktop?.page as string) ?? `https://en.wikipedia.org/wiki/${title}`,
      thumbnail: (data.thumbnail?.source as string) ?? null,
    };
  } catch {
    return null;
  }
}

async function summaryFromWikidata(
  wikidataId: string
): Promise<WikipediaSummary | null> {
  try {
    const res = await fetch(
      `https://www.wikidata.org/wiki/Special:EntityData/${encodeURIComponent(wikidataId)}.json`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const entity = data?.entities?.[wikidataId];
    const enTitle = entity?.sitelinks?.enwiki?.title as string | undefined;
    if (!enTitle) return null;

    const summaryRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(enTitle.replace(/\s+/g, "_"))}`,
      {
        headers: { Accept: "application/json" },
        next: { revalidate: 86400 },
      }
    );
    if (!summaryRes.ok) return null;
    const summary = await summaryRes.json();
    if (!summary?.extract) return null;

    return {
      title: summary.title ?? enTitle,
      extract: summary.extract as string,
      url:
        (summary.content_urls?.desktop?.page as string) ??
        `https://en.wikipedia.org/wiki/${encodeURIComponent(enTitle)}`,
      thumbnail: (summary.thumbnail?.source as string) ?? null,
    };
  } catch {
    return null;
  }
}
