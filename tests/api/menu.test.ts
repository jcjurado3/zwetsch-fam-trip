import { beforeEach, describe, expect, it, vi } from "vitest";
import { seedMenu } from "@/lib/seed-data";
import { createTableMock } from "../helpers/mock-supabase";

const createAnonServerClient = vi.fn();
const createServiceClient = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createAnonServerClient: () => createAnonServerClient(),
  createServiceClient: () => createServiceClient(),
}));

describe("GET /api/menu", () => {
  beforeEach(() => {
    vi.resetModules();
    createAnonServerClient.mockReset();
    createServiceClient.mockReset();
  });

  it("returns seed menu when Supabase is not configured", async () => {
    createAnonServerClient.mockReturnValue(null);
    const { GET } = await import("@/app/api/menu/route");
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.source).toBe("seed");
    expect(body.items).toEqual(seedMenu);
  });

  it("returns seed menu when the database has no menu rows", async () => {
    createAnonServerClient.mockReturnValue(
      createTableMock({
        menu_items: { data: [], error: null },
      })
    );

    const { GET } = await import("@/app/api/menu/route");
    const res = await GET();
    const body = await res.json();

    expect(body.source).toBe("seed");
    expect(body.items).toEqual(seedMenu);
  });

  it("returns database menu items when Supabase has planned meals", async () => {
    const dbItems = [
      {
        id: "menu-req-abc",
        trip_id: "trip-tampa-2026",
        day_date: "2026-08-03",
        meal_type: "dinner",
        title: "Family Tacos",
        description: "Requested by Jimmy",
        sort_order: 1,
      },
    ];

    createAnonServerClient.mockReturnValue(
      createTableMock({
        menu_items: { data: dbItems, error: null },
      })
    );

    const { GET } = await import("@/app/api/menu/route");
    const res = await GET();
    const body = await res.json();

    expect(body.source).toBe("database");
    expect(body.items).toEqual(dbItems);
  });

  it("returns 500 when Supabase menu query fails", async () => {
    createAnonServerClient.mockReturnValue(
      createTableMock({
        menu_items: { data: null, error: { message: "relation missing" } },
      })
    );

    const { GET } = await import("@/app/api/menu/route");
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("relation missing");
  });
});

describe("POST /api/menu/requests", () => {
  beforeEach(() => {
    vi.resetModules();
    createAnonServerClient.mockReset();
    createServiceClient.mockReset();
  });

  it("returns 503 when Supabase service client is missing", async () => {
    createServiceClient.mockReturnValue(null);
    const { POST } = await import("@/app/api/menu/requests/route");
    const res = await POST(
      new Request("http://localhost/api/menu/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: "trip-tampa-2026",
          requesterName: "Jimmy",
          mealType: "dinner",
          title: "Pasta Night",
        }),
      })
    );

    expect(res.status).toBe(503);
  });

  it("inserts a meal request through the service client", async () => {
    const created = {
      id: "req-1",
      trip_id: "trip-tampa-2026",
      requester_name: "Jimmy",
      meal_type: "dinner",
      title: "Pasta Night",
      status: "pending",
    };

    createServiceClient.mockReturnValue(
      createTableMock({
        meal_requests: { data: created, error: null },
      })
    );

    const { POST } = await import("@/app/api/menu/requests/route");
    const res = await POST(
      new Request("http://localhost/api/menu/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: "trip-tampa-2026",
          requesterName: "Jimmy",
          mealType: "dinner",
          title: "Pasta Night",
        }),
      })
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body).toEqual(created);
  });
});

describe("PATCH /api/menu/requests promote", () => {
  beforeEach(() => {
    vi.resetModules();
    createAnonServerClient.mockReset();
    createServiceClient.mockReset();
  });

  it("promotes a pending request into menu_items", async () => {
    const existing = {
      id: "req-1",
      trip_id: "trip-tampa-2026",
      requester_name: "Jimmy",
      meal_type: "dinner",
      day_date: "2026-08-03",
      title: "Pasta Night",
      notes: "Extra garlic",
      status: "pending",
    };

    const menuItem = {
      id: "menu-req-req-1",
      trip_id: existing.trip_id,
      day_date: existing.day_date,
      meal_type: existing.meal_type,
      title: existing.title,
    };

    const approved = { ...existing, status: "approved" };

    createServiceClient.mockReturnValue(
      createTableMock({
        "meal_requests#1": { data: existing, error: null },
        "menu_items#1": { data: [], error: null },
        "menu_items#2": { data: null, error: null, count: 0 },
        "menu_items#3": { data: menuItem, error: null },
        "meal_requests#2": { data: approved, error: null },
      })
    );

    const { PATCH } = await import("@/app/api/menu/requests/route");
    const res = await PATCH(
      new Request("http://localhost/api/menu/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "req-1", action: "promote" }),
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.request.status).toBe("approved");
    expect(body.menuItem).toEqual(menuItem);
  });
});
