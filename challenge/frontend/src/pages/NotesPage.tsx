import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "../components/Header";
import { NoteList } from "../components/NoteList";
import { NoteEditor } from "../components/NoteEditor";
import {
  getApiNotes,
  postApiNotes,
  putApiNotesById,
  deleteApiNotesById,
  getApiUsersMe,
  type Note,
} from "../services/api-service";

export function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const fetchNotes = useCallback(async () => {
    const response = await getApiNotes();
    if (response.data) {
      setNotes(response.data);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    const response = await getApiUsersMe();
    if (response.data?.email) {
      setUserEmail(response.data.email);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      // Errors are handled by the global interceptor, but we still want to run both
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

  const handleSaveNote = async (title: string, content: string) => {
    setIsSaving(true);
    try {
      if (editingNote?.id) {
        await putApiNotesById({
          path: { id: editingNote.id },
          body: { title, content },
        });
      } else {
        await postApiNotes({
          body: { title, content },
        });
      }
      setEditorOpen(false);
      await fetchNotes();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    await deleteApiNotesById({
      path: { id: noteId },
    });
    await fetchNotes();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header userEmail={userEmail} />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Your Notes</h2>
          <Button onClick={handleCreateNote}>New Note</Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading notes...</p>
          </div>
        ) : (
          <NoteList
            notes={notes}
            onEdit={handleEditNote}
            onDelete={handleDeleteNote}
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
    </div>
  );
}
