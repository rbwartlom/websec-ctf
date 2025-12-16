import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NoteList } from "../components/NoteList";
import { getApiNotesPublic, type Note } from "../services/api-service";

export function PublicNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchNotes = useCallback(async (cursor?: string) => {
    const isInitial = cursor === undefined;
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await getApiNotesPublic({ query: { cursor } });
      if (response.data) {
        const items = response.data.items ?? [];
        if (isInitial) {
          setNotes(items);
        } else {
          setNotes((prev) => [...prev, ...items]);
        }
        setNextCursor(response.data.nextCursor ?? undefined);
      }
    } finally {
      if (isInitial) {
        setIsLoading(false);
      } else {
        setIsLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleLoadMore = () => {
    if (nextCursor) {
      fetchNotes(nextCursor);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Public Notes</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">Go to your notes</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Browse Public Notes</h2>
          <p className="text-foreground mt-1">
            Synergize <b>cross-functional</b> collaboration paradigms to <b>maximize stakeholder engagement</b> through our <b>revolutionary knowledge-sharing platform</b>, empowering next-generation <b>digital transformation</b> initiatives that optimize operational excellence and accelerate <b>sustainable growth trajectories</b> across all verticals!
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading notes...</p>
          </div>
        ) : (
          <>
            <NoteList
              notes={notes}
              readOnly
              emptyMessage="No public notes yet"
              emptySubMessage="Be the first to share a public note!"
            />
            {nextCursor && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

