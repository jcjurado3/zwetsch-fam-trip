import { NextResponse } from "next/server";
import { fetchPlaceDetail } from "@/lib/places";
import { fetchWikipediaSummary } from "@/lib/wikipedia";

export async function GET(
  _request: Request,
  context: { params: Promise<{ xid: string }> }
) {
  const { xid } = await context.params;
  if (!xid) {
    return NextResponse.json({ error: "Missing place id" }, { status: 400 });
  }

  const detail = await fetchPlaceDetail(xid);
  if (!detail) {
    return NextResponse.json({ error: "Place not found" }, { status: 404 });
  }

  let wikipediaExtract = detail.wikipediaExtract;
  let wikipediaUrl = detail.wikipediaUrl;

  if (!wikipediaExtract) {
    const wiki = await fetchWikipediaSummary(detail.name, detail.wikidata);
    if (wiki) {
      wikipediaExtract = wiki.extract;
      wikipediaUrl = wiki.url;
    }
  }

  return NextResponse.json(
    {
      ...detail,
      wikipediaExtract,
      wikipediaUrl,
      description: detail.description ?? wikipediaExtract,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    }
  );
}
