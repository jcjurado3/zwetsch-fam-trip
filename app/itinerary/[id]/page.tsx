import Link from "next/link";
import { ItineraryDetailView } from "@/components/ItineraryDetailView";
import { getItineraryItem } from "@/lib/supabase/data";

export default async function ItineraryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getItineraryItem(id);

  if (!item) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <p className="text-muted">Activity not found</p>
        <Link href="/itinerary" className="mt-4 text-primary">
          Back to itinerary
        </Link>
      </div>
    );
  }

  return <ItineraryDetailView item={item} />;
}
