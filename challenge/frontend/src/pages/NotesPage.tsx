import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Header } from "../components/Header";
import { NoteList } from "../components/NoteList";
import { NoteEditor } from "../components/NoteEditor";
import { ShareDialog } from "../components/ShareDialog";
import { ViewSharedNoteDialog } from "../components/ViewSharedNoteDialog";
import {
  getApiNotes,
  getApiNotesSearch,
  postApiNotes,
  putApiNotesById,
  deleteApiNotesById,
  postApiNotesByIdShare,
  postApiNotesByIdUnshare,
  getApiUsersMe,
  type Note,
} from "../services/api-service";

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [sharingNote, setSharingNote] = useState<Note | null>(null);
  const [viewSharedDialogOpen, setViewSharedDialogOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchNextCursor, setSearchNextCursor] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    const response = await getApiNotes();
    if (response.data) {
      setNotes(response.data);
    }
  }, []);

  const handleSearch = useCallback(async (cursor?: string) => {
    if (!searchQuery.trim()) {
      setIsSearchMode(false);
      setSearchResults([]);
      setSearchNextCursor(null);
      return;
    }

    setIsSearching(true);
    try {
      const response = await getApiNotesSearch({
        query: {
          regex: searchQuery,
          cursor,
          limit: 20,
        },
      });
      if (response.data) {
        if (cursor) {
          // Append to existing results for pagination
          setSearchResults((prev) => [...prev, ...(response.data?.items ?? [])]);
        } else {
          // New search, replace results
          setSearchResults(response.data.items ?? []);
        }
        setSearchNextCursor(response.data.nextCursor ?? null);
        setIsSearchMode(true);
      }
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setIsSearchMode(false);
    setSearchNextCursor(null);
  }, []);

  const fetchUser = useCallback(async () => {
    const response = await getApiUsersMe();
    if (response.data?.email) {
      setUserEmail(response.data.email);
    }
    if (response.data?.id) {
      setUserId(response.data.id);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.allSettled([fetchNotes(), fetchUser()]);
      setIsLoading(false);
    };
    init();
  }, [fetchNotes, fetchUser]);

  const handleCreateNote = () => {
    setEditingNote(null);
    setEditorOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setEditorOpen(true);
  };

  const handleSaveNote = async (
    title: string,
    content: string,
    isPublic: boolean
  ) => {
    setIsSaving(true);
    try {
      if (editingNote?.id) {
        await putApiNotesById({
          path: { id: editingNote.id },
          body: { title, content, isPublic },
        });
      } else {
        await postApiNotes({
          body: { title, content, isPublic },
        });
      }
      setEditorOpen(false);
      await fetchNotes();
      // Refresh search results if in search mode
      if (isSearchMode) {
        void handleSearch();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    await deleteApiNotesById({
      path: { id: noteId },
    });
    await fetchNotes();
    // Update search results if in search mode
    if (isSearchMode) {
      setSearchResults((prev) => prev.filter((n) => n.id !== noteId));
    }
  };

  const handleOpenShareDialog = (note: Note) => {
    setSharingNote(note);
    setShareDialogOpen(true);
  };

  const handleShareNote = async (noteId: string, emails: string[]) => {
    setIsSaving(true);
    try {
      const response = await postApiNotesByIdShare({
        path: { id: noteId },
        body: { emails },
      });
      await fetchNotes();
      // Update the sharing note in state with the response
      if (response.data) {
        setSharingNote(response.data);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnshareNote = async (noteId: string, emails: string[]) => {
    setIsSaving(true);
    try {
      const response = await postApiNotesByIdUnshare({
        path: { id: noteId },
        body: { emails },
      });
      await fetchNotes();
      // Update the sharing note in state with the response
      if (response.data) {
        setSharingNote(response.data);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userEmail={userEmail} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Your Notes</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setViewSharedDialogOpen(true)}>
              View Shared
            </Button>
            <Button variant="outline" asChild>
              <Link to="/public">See Public Thinkers</Link>
            </Button>
            <Button onClick={handleCreateNote}>New Note</Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSearch();
            }}
          >
            <Input
              type="text"
              placeholder="Search notes by title (regex supported)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="secondary" disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
            {isSearchMode && (
              <Button type="button" variant="outline" onClick={handleClearSearch}>
                Clear
              </Button>
            )}
          </form>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading notes...</p>
          </div>
        ) : isSearchMode ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {searchResults.length} matching note{searchResults.length !== 1 ? "s" : ""}
              </p>
            </div>
            <NoteList
              notes={searchResults}
              currentUserId={userId}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              onShare={handleOpenShareDialog}
              emptyMessage="No matching notes"
              emptySubMessage="Try a different search pattern"
            />
            {searchNextCursor && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => void handleSearch(searchNextCursor)}
                  disabled={isSearching}
                >
                  {isSearching ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <NoteList
            notes={notes}
            currentUserId={userId}
            onEdit={handleEditNote}
            onDelete={handleDeleteNote}
            onShare={handleOpenShareDialog}
            emptyMessage="No notes yet"
            emptySubMessage="Create your first note to get started"
          />
        )}
      </main>

      <NoteEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        note={editingNote}
        onSave={handleSaveNote}
        isLoading={isSaving}
      />

      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        note={sharingNote}
        onShare={handleShareNote}
        onUnshare={handleUnshareNote}
        isLoading={isSaving}
      />

      <ViewSharedNoteDialog
        open={viewSharedDialogOpen}
        onOpenChange={setViewSharedDialogOpen}
      />
    </div>
  );
}
