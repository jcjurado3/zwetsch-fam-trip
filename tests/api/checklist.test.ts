import { beforeEach, describe, expect, it, vi } from "vitest";
import { seedChecklist } from "@/lib/seed-data";
import { createTableMock } from "../helpers/mock-supabase";

const createAnonServerClient = vi.fn();
const createServiceClient = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createAnonServerClient: () => createAnonServerClient(),
  createServiceClient: () => createServiceClient(),
}));

describe("GET /api/checklist", () => {
  beforeEach(() => {
    vi.resetModules();
    createAnonServerClient.mockReset();
    createServiceClient.mockReset();
  });

  it("returns seed checklist when Supabase is not configured", async () => {
    createAnonServerClient.mockReturnValue(null);
    const { GET } = await import("@/app/api/checklist/route");
    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(seedChecklist);
  });

  it("returns seed checklist when the database has no rows", async () => {
    createAnonServerClient.mockReturnValue(
      createTableMock({
        checklist_items: { data: [], error: null },
      })
    );

    const { GET } = await import("@/app/api/checklist/route");
    const res = await GET();
    const body = await res.json();

    expect(body).toEqual(seedChecklist);
  });

  it("returns database checklist items when Supabase has rows", async () => {
    const dbItems = [
      {
        id: "check-live-1",
        trip_id: "trip-tampa-2026",
        title: "Cooler ice",
        notes: null,
        category: "groceries",
        assignee_name: "Jimmy",
        completed: false,
        sort_order: 1,
        created_at: "2026-07-01T00:00:00Z",
      },
    ];

    createAnonServerClient.mockReturnValue(
      createTableMock({
        checklist_items: { data: dbItems, error: null },
      })
    );

    const { GET } = await import("@/app/api/checklist/route");
    const res = await GET();
    const body = await res.json();

    expect(body).toEqual(dbItems);
  });
});

describe("POST /api/checklist", () => {
  beforeEach(() => {
    vi.resetModules();
    createAnonServerClient.mockReset();
    createServiceClient.mockReset();
  });

  it("returns a local-only item when Supabase service client is missing", async () => {
    createServiceClient.mockReturnValue(null);
    const { POST } = await import("@/app/api/checklist/route");
    const res = await POST(
      new Request("http://localhost/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Beach chairs" }),
      })
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.localOnly).toBe(true);
    expect(body.title).toBe("Beach chairs");
    expect(String(body.id)).toMatch(/^local-/);
  });

  it("inserts a checklist item through the service client", async () => {
    const created = {
      id: "uuid-1",
      trip_id: "trip-tampa-2026",
      title: "Beach chairs",
      notes: null,
      category: "packing",
      assignee_name: null,
      completed: false,
      sort_order: 100,
    };

    createServiceClient.mockReturnValue(
      createTableMock({
        checklist_items: { data: created, error: null },
      })
    );

    const { POST } = await import("@/app/api/checklist/route");
    const res = await POST(
      new Request("http://localhost/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Beach chairs",
          category: "packing",
        }),
      })
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body).toEqual(created);
    expect(body.localOnly).toBeUndefined();
  });

  it("rejects empty titles", async () => {
    const { POST } = await import("@/app/api/checklist/route");
    const res = await POST(
      new Request("http://localhost/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "   " }),
      })
    );

    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/checklist", () => {
  beforeEach(() => {
    vi.resetModules();
    createAnonServerClient.mockReset();
    createServiceClient.mockReset();
  });

  it("updates completion through Supabase", async () => {
    createServiceClient.mockReturnValue(
      createTableMock({
        checklist_items: { data: null, error: null },
      })
    );

    const { PATCH } = await import("@/app/api/checklist/route");
    const res = await PATCH(
      new Request("http://localhost/api/checklist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: "uuid-1", completed: true }),
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
});

describe("DELETE /api/checklist", () => {
  beforeEach(() => {
    vi.resetModules();
    createAnonServerClient.mockReset();
    createServiceClient.mockReset();
  });

  it("deletes through Supabase", async () => {
    createServiceClient.mockReturnValue(
      createTableMock({
        checklist_items: { data: null, error: null },
      })
    );

    const { DELETE } = await import("@/app/api/checklist/route");
    const res = await DELETE(
      new Request("http://localhost/api/checklist?id=uuid-1", {
        method: "DELETE",
      })
    );
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
});
