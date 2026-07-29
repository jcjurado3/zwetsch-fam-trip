import { MapPin } from "lucide-react";
import { formatDateRange } from "@/lib/utils";

interface PageHeroProps {
  title: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  subtitle?: string;
}

export function PageHero({
  title,
  destination,
  startDate,
  endDate,
  subtitle,
}: PageHeroProps) {
  return (
    <header className="mb-6 animate-item">
      <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-foreground">
        {title}
      </h1>
      {destination && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
          <MapPin className="h-4 w-4 text-primary" />
          {destination}
        </p>
      )}
      {startDate && endDate && (
        <p className="mt-1 text-sm text-muted">
          {formatDateRange(startDate, endDate)}
        </p>
      )}
      {subtitle && (
        <p className="mt-2 text-sm text-muted">{subtitle}</p>
      )}
    </header>
  );
}
