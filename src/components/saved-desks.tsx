"use client";

import { useEffect, useState } from "react";
import { Bookmark, Trash2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { authEnabled } from "@/lib/auth/client";
import { deleteDesk, listDesks, saveDesk, type SavedDesk } from "@/lib/server/saved-desks";
import { useDesk } from "@/lib/store";

export function SavedDesks() {
  const { user, isPending } = useCurrentUserState();
  const { active, weights, horizon, loadMix } = useDesk();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [rows, setRows] = useState<SavedDesk[] | null>(null);

  useEffect(() => {
    if (!open || !user) return;
    listDesks()
      .then(setRows)
      .catch(() => setRows([]));
  }, [open, user]);

  if (!authEnabled || user?.isDevFallback) return null;

  if (isPending) return <div className="hidden h-8 w-16 animate-pulse rounded-sm bg-secondary sm:block" />;

  if (!user) {
    return (
      <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
        <Link to="/login">Save desk</Link>
      </Button>
    );
  }

  async function persist() {
    const res = await saveDesk({ data: { name, active, weights, horizon } });
    if (res.ok) {
      toast.success("Desk saved");
      setName("");
      setRows(await listDesks());
    } else {
      toast.error(res.error);
    }
  }

  async function remove(id: number) {
    await deleteDesk({ data: id });
    setRows(await listDesks());
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="ghost">
          <Bookmark />
          <span className="hidden sm:inline">Desks</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" title="Saved desks">
        <div className="space-y-4 p-4">
          <div className="flex gap-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name this mix"
              maxLength={64}
            />
            <Button type="button" onClick={() => void persist()} disabled={!name.trim()}>
              Save
            </Button>
          </div>
          <ul className="space-y-2">
            {rows == null ? (
              <li className="text-sm text-muted-foreground">Loading…</li>
            ) : rows.length === 0 ? (
              <li className="text-sm text-muted-foreground">No saved desks yet.</li>
            ) : (
              rows.map((row) => (
                <li
                  key={row.id}
                  className="flex items-center gap-2 rounded-md border border-border bg-panel px-3 py-2"
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => {
                      loadMix(row.active, row.weights, row.horizon);
                      setOpen(false);
                    }}
                  >
                    <p className="truncate text-sm">{row.name}</p>
                    <p className="text-2xs text-muted-foreground">{row.horizon}m horizon</p>
                  </button>
                  <button
                    type="button"
                    className="grid size-10 place-items-center text-muted-foreground hover:text-down"
                    onClick={() => void remove(row.id)}
                    aria-label={`Delete ${row.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      </SheetContent>
    </Sheet>
  );
}
