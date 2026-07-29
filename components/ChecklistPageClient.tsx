"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import type { ChecklistCategory, ChecklistItem } from "@/lib/types";
import { SEED_TRIP_ID } from "@/lib/seed-data";
import { PageHero } from "@/components/PageHero";
import { ExpandableFormShell } from "@/components/ExpandableFormShell";
import { checklistToneClass } from "@/lib/item-tones";

const CATEGORIES: { value: ChecklistCategory; label: string }[] = [
  { value: "packing", label: "Packing" },
  { value: "groceries", label: "Groceries" },
  { value: "tasks", label: "Tasks" },
  { value: "general", label: "General" },
];

const LOCAL_STORAGE_KEY = "zwetsch-checklist-local";

function loadLocalExtras(): ChecklistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ChecklistItem[]) : [];
  } catch {
    return [];
  }
}

function saveLocalExtras(items: ChecklistItem[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
}

export function ChecklistPageClient() {
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [category, setCategory] = useState<ChecklistCategory>("general");
  const [assigneeName, setAssigneeName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch("/api/checklist");
      const data = res.ok ? ((await res.json()) as ChecklistItem[]) : [];
      const localExtras = loadLocalExtras().filter(
        (local) => !data.some((item) => item.id === local.id)
      );
      const merged = [...data, ...localExtras].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return a.sort_order - b.sort_order;
      });
      setItems(merged);
    } catch {
      setItems(loadLocalExtras());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: SEED_TRIP_ID,
          title: title.trim(),
          notes: notes.trim() || null,
          category,
          assigneeName: assigneeName.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Could not add item");
      }

      if (data.localOnly || String(data.id).startsWith("local-")) {
        const localItem = data as ChecklistItem;
        const next = [...loadLocalExtras(), localItem];
        saveLocalExtras(next);
      }

      setTitle("");
      setNotes("");
      setAssigneeName("");
      setCategory("general");
      await fetchItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add item");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleCompleted(item: ChecklistItem) {
    const nextCompleted = !item.completed;
    setItems((prev) =>
      prev.map((row) =>
        row.id === item.id ? { ...row, completed: nextCompleted } : row
      )
    );

    if (String(item.id).startsWith("local-") || String(item.id).startsWith("check-")) {
      if (String(item.id).startsWith("local-")) {
        const locals = loadLocalExtras().map((row) =>
          row.id === item.id ? { ...row, completed: nextCompleted } : row
        );
        saveLocalExtras(locals);
      }
      // Seed items without Supabase: optimistic UI only
      try {
        await fetch("/api/checklist", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id, completed: nextCompleted }),
        });
      } catch {
        // keep optimistic state
      }
      return;
    }

    try {
      await fetch("/api/checklist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, completed: nextCompleted }),
      });
    } catch {
      fetchItems();
    }
  }

  async function removeItem(item: ChecklistItem) {
    setItems((prev) => prev.filter((row) => row.id !== item.id));

    if (String(item.id).startsWith("local-")) {
      saveLocalExtras(loadLocalExtras().filter((row) => row.id !== item.id));
      return;
    }

    try {
      await fetch(`/api/checklist?id=${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
    } catch {
      fetchItems();
    }
  }

  const openItems = items.filter((item) => !item.completed);
  const doneItems = items.filter((item) => item.completed);

  return (
    <div className="space-y-6">
      <PageHero
        title="Family Checklist"
        subtitle="Packing, groceries, and trip to-dos · Aug 5–11"
      />

      <ExpandableFormShell label="Add an item">
        <form onSubmit={handleAdd}>
          <p className="text-sm text-muted">
            Share packing lists and tasks with the whole family
          </p>

          <div className="mt-4 space-y-3">
            <input
              type="text"
              required
              placeholder="What needs to get done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border border-surface-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              disabled={submitting}
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as ChecklistCategory)
                }
                className="w-full rounded-2xl border border-surface-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                disabled={submitting}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Assigned to (optional)"
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                className="w-full rounded-2xl border border-surface-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
                disabled={submitting}
              />
            </div>

            <input
              type="text"
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-2xl border border-surface-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
              disabled={submitting}
            />
          </div>

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting || !title.trim()}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add to checklist
              </>
            )}
          </button>
        </form>
      </ExpandableFormShell>

      {loading ? (
        <p className="text-center text-sm text-muted">Loading checklist...</p>
      ) : (
        <div className="space-y-6">
          <section className="space-y-2">
            <h2 className="font-serif text-lg font-semibold">
              To do ({openItems.length})
            </h2>
            {openItems.length === 0 ? (
              <div className="card-surface rounded-3xl px-5 py-6 text-center text-sm text-muted">
                All clear — add something above.
              </div>
            ) : (
              openItems.map((item) => (
                <ChecklistRow
                  key={item.id}
                  item={item}
                  onToggle={() => toggleCompleted(item)}
                  onRemove={() => removeItem(item)}
                />
              ))
            )}
          </section>

          {doneItems.length > 0 && (
            <section className="space-y-2">
              <h2 className="font-serif text-lg font-semibold">
                Done ({doneItems.length})
              </h2>
              {doneItems.map((item) => (
                <ChecklistRow
                  key={item.id}
                  item={item}
                  onToggle={() => toggleCompleted(item)}
                  onRemove={() => removeItem(item)}
                />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function ChecklistRow({
  item,
  onToggle,
  onRemove,
}: {
  item: ChecklistItem;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const categoryLabel =
    CATEGORIES.find((c) => c.value === item.category)?.label ?? item.category;
  const tone = checklistToneClass(item.category);

  return (
    <div
      className={`tone-item card-surface flex items-start gap-3 rounded-2xl border p-3 ${tone}`}
    >
      <button
        type="button"
        onClick={onToggle}
        data-done={item.completed ? "true" : "false"}
        className="tone-check mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors"
        aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
      >
        <Check className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={`font-medium ${
            item.completed ? "text-muted line-through" : ""
          }`}
        >
          {item.title}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className={`tone-chip ${tone}`}>{categoryLabel}</span>
          {item.assignee_name && (
            <span className="text-xs text-muted">{item.assignee_name}</span>
          )}
        </div>
        {item.notes && (
          <p className="mt-1.5 text-sm text-muted">{item.notes}</p>
        )}
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="rounded-xl p-2 text-muted transition-colors hover:text-red-500"
        aria-label="Remove item"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
