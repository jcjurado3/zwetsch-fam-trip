import { PlaceDetailView } from "@/components/PlaceDetailView";

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ xid: string }>;
}) {
  const { xid } = await params;
  return <PlaceDetailView xid={decodeURIComponent(xid)} />;
}
