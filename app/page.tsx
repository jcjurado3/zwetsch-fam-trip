import { BrandHero } from "@/components/BrandHero";
import { FeatureCard } from "@/components/FeatureCard";
import { FlightStatusCard } from "@/components/FlightStatusCard";
import { NavGrid } from "@/components/NavGrid";
import { WeatherCard } from "@/components/WeatherCard";
import { CoastalConditionsCard } from "@/components/CoastalConditions";
import { getItineraryItems, getTrip } from "@/lib/supabase/data";
import { getNextItineraryItem } from "@/lib/utils";
import { fetchTripFlightStatuses } from "@/lib/flights";
import { fetchDestinationWeather } from "@/lib/weather";
import { fetchCoastalConditions } from "@/lib/coastal";
import { ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const [trip, itinerary, weather, coastal, flights] = await Promise.all([
    getTrip(),
    getItineraryItems(),
    fetchDestinationWeather(),
    fetchCoastalConditions(),
    fetchTripFlightStatuses(),
  ]);
  const highlight = getNextItineraryItem(itinerary);
  const nearbyOptions = itinerary.slice(0, 4);

  if (!trip) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted">No trip configured yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BrandHero
        destination={trip.destination}
        startDate={trip.start_date}
        endDate={trip.end_date}
      />

      {weather && <WeatherCard weather={weather} />}
      {coastal && <CoastalConditionsCard data={coastal} />}
      {flights.length > 0 && <FlightStatusCard flights={flights} />}

      {highlight && (
        <FeatureCard
          title={highlight.title}
          subtitle={highlight.location ?? undefined}
          time={highlight.time}
          dayDate={highlight.day_date}
          imageUrl={highlight.image_url ?? trip.hero_image_url}
          href={`/itinerary/${highlight.id}`}
          label={highlight.visited ? "Up Next" : "Today's Highlight"}
        />
      )}

      <section className="card-surface rounded-3xl p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Staying Here
        </p>
        <h2 className="mt-2 font-serif text-2xl font-semibold text-foreground">
          Trip Lodges
        </h2>
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl border border-surface-border bg-surface-solid/60 p-4">
            <p className="text-sm font-semibold text-foreground">Tampa Lodge</p>
            <p className="mt-1 flex items-start gap-1.5 text-sm text-muted">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              901 Villa Venicia Way, Tampa, FL 33606
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=901+Villa+Venicia+Way,+Tampa,+FL+33606"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Open in Maps
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <div className="rounded-2xl border border-surface-border bg-surface-solid/60 p-4">
            <p className="text-sm font-semibold text-foreground">
              Sarasota Lodge
            </p>
            <p className="mt-1 flex items-start gap-1.5 text-sm text-muted">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              2704 Ringling Blvd, Sarasota, FL 34237
            </p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=2704+Ringling+Blvd,+Sarasota,+FL+34237"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-surface-border px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-primary/5"
            >
              Open in Maps
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-serif text-xl font-semibold">
          Around Tampa
        </h2>
        <div className="space-y-2">
          {nearbyOptions.map((option) => (
            <Link
              key={option.id}
              href={`/itinerary/${option.id}`}
              className="card-surface flex items-start gap-3 rounded-2xl px-4 py-3 transition-transform active:scale-[0.98]"
            >
              <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
              <span>
                <span className="block text-sm font-semibold text-foreground">
                  {option.title}
                </span>
                {option.location && (
                  <span className="block text-xs text-muted">
                    {option.location}
                  </span>
                )}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-serif text-xl font-semibold">Explore</h2>
        <NavGrid />
      </section>
    </div>
  );
}
