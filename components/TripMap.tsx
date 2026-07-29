"use client";

import { useEffect, useRef } from "react";
import {
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  Popup,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { LODGES } from "@/lib/seed-data";
import type { PlaceCard } from "@/lib/places";
import type { ItineraryItem } from "@/lib/types";

interface TripMapProps {
  itinerary: ItineraryItem[];
  places?: PlaceCard[];
}

const COLORS = {
  home: "#1f8fbf",
  itinerary: "#0e7490",
  place: "#d97706",
} as const;

function createHomeMarkerEl(label: string) {
  const wrap = document.createElement("button");
  wrap.type = "button";
  wrap.className = "trip-map-marker trip-map-marker--home";
  wrap.setAttribute("aria-label", label);
  wrap.style.cssText = `
    position: relative;
    width: 64px;
    height: 64px;
    border: none;
    background: transparent;
    cursor: pointer;
    padding: 0;
    z-index: 2;
  `;

  const pulseOuter = document.createElement("span");
  pulseOuter.setAttribute("aria-hidden", "true");
  pulseOuter.style.cssText = `
    position: absolute;
    left: 50%;
    top: 50%;
    width: 48px;
    height: 48px;
    margin: -24px 0 0 -24px;
    border-radius: 999px;
    background: ${COLORS.home};
    opacity: 0.55;
    animation: trip-map-pulse 1.6s ease-out infinite;
  `;

  const pulseInner = document.createElement("span");
  pulseInner.setAttribute("aria-hidden", "true");
  pulseInner.style.cssText = `
    position: absolute;
    left: 50%;
    top: 50%;
    width: 36px;
    height: 36px;
    margin: -18px 0 0 -18px;
    border-radius: 999px;
    background: ${COLORS.home};
    opacity: 0.65;
    animation: trip-map-pulse 1.6s ease-out infinite 0.35s;
  `;

  const pin = document.createElement("span");
  pin.setAttribute("aria-hidden", "true");
  pin.style.cssText = `
    position: absolute;
    left: 50%;
    top: 50%;
    width: 34px;
    height: 34px;
    transform: translate(-50%, -50%);
    border-radius: 999px;
    border: 3px solid #fff;
    background: ${COLORS.home};
    box-shadow:
      0 0 0 4px rgba(31, 143, 191, 0.35),
      0 8px 22px rgba(31, 143, 191, 0.55);
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  pin.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        fill="#fff"/>
    </svg>
  `;

  wrap.append(pulseOuter, pulseInner, pin);
  return wrap;
}

function createDotMarkerEl(label: string, color: string, size = 28) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "trip-map-marker";
  el.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    border-radius: 999px;
    border: 2px solid white;
    background: ${color};
    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
    cursor: pointer;
  `;
  el.setAttribute("aria-label", label);
  return el;
}

export function TripMap({ itinerary, places = [] }: TripMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const existingPulseStyle = document.getElementById("trip-map-pulse-style");
    if (existingPulseStyle) existingPulseStyle.remove();
    const style = document.createElement("style");
    style.id = "trip-map-pulse-style";
    style.textContent = `
      @keyframes trip-map-pulse {
        0% { transform: scale(0.85); opacity: 0.7; }
        70% { transform: scale(2.4); opacity: 0; }
        100% { transform: scale(2.4); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    const map = new MapLibreMap({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
        ],
      },
      center: [LODGES[0].lng, LODGES[0].lat],
      zoom: 11,
    });

    map.addControl(new NavigationControl({ showCompass: false }), "top-right");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const markers: Marker[] = [];

    const addMarker = (
      lng: number,
      lat: number,
      label: string,
      element: HTMLElement
    ) => {
      const marker = new Marker({ element, anchor: "center" })
        .setLngLat([lng, lat])
        .setPopup(
          new Popup({ offset: 18 }).setHTML(
            `<strong style="font-family: system-ui">${label}</strong>`
          )
        )
        .addTo(map);

      markers.push(marker);
    };

    for (const lodge of LODGES) {
      addMarker(
        lodge.lng,
        lodge.lat,
        `${lodge.name} · ${lodge.address}`,
        createHomeMarkerEl(lodge.name)
      );
    }

    for (const item of itinerary) {
      if (item.lat == null || item.lng == null) continue;
      // Skip duplicates of lodge pins so lodge markers stay the standout
      const matchesLodge = LODGES.some(
        (lodge) =>
          Math.abs(item.lat! - lodge.lat) < 0.0001 &&
          Math.abs(item.lng! - lodge.lng) < 0.0001
      );
      if (matchesLodge) {
        continue;
      }
      addMarker(
        item.lng,
        item.lat,
        item.title,
        createDotMarkerEl(item.title, COLORS.itinerary)
      );
    }

    for (const place of places.slice(0, 20)) {
      const isLodgePin = LODGES.some(
        (lodge) =>
          Math.abs(place.lat - lodge.lat) < 0.0001 &&
          Math.abs(place.lng - lodge.lng) < 0.0001
      );
      if (isLodgePin) continue;
      addMarker(
        place.lng,
        place.lat,
        place.name,
        createDotMarkerEl(place.name, COLORS.place, 22)
      );
    }

    const bounds = new LngLatBounds();
    LODGES.forEach((lodge) => {
      bounds.extend([lodge.lng, lodge.lat]);
    });
    itinerary.forEach((item) => {
      if (item.lat != null && item.lng != null) {
        bounds.extend([item.lng, item.lat]);
      }
    });
    places.slice(0, 20).forEach((place) => {
      bounds.extend([place.lng, place.lat]);
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 48, maxZoom: 12, duration: 600 });
    }

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [itinerary, places]);

  return (
    <div className="card-surface overflow-hidden rounded-3xl">
      <div ref={containerRef} className="aspect-[4/3] w-full" />
      <div className="flex flex-wrap gap-3 border-t border-surface-border px-4 py-3 text-xs">
        <span className="inline-flex items-center gap-1.5 text-muted">
          <span
            className="inline-block h-3 w-3 rounded-full border-2 border-white shadow"
            style={{ background: COLORS.home }}
          />
          Lodges
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted">
          <span
            className="inline-block h-3 w-3 rounded-full border-2 border-white shadow"
            style={{ background: COLORS.itinerary }}
          />
          Itinerary stops
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted">
          <span
            className="inline-block h-3 w-3 rounded-full border-2 border-white shadow"
            style={{ background: COLORS.place }}
          />
          Nearby places
        </span>
      </div>
    </div>
  );
}
