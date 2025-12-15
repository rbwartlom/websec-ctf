import { NoteCard } from "./NoteCard";
import type { Note } from "../services/api-service";

interface NoteListProps {
  notes: Note[];
  currentUserId?: string;
  onEdit?: (note: Note) => void;
  onDelete?: (noteId: string) => void;
  onShare?: (note: Note) => void;
  readOnly?: boolean;
  emptyMessage?: string;
  emptySubMessage?: string;
}

export function NoteList({
  notes,
  currentUserId,
  onEdit,
  onDelete,
  onShare,
  readOnly = false,
  emptyMessage = "No notes yet",
  emptySubMessage = "Create your first note to get started",
}: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">{emptyMessage}</p>
        <p className="text-muted-foreground text-sm mt-1">{emptySubMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          currentUserId={currentUserId}
          onEdit={onEdit}
          onDelete={onDelete}
          onShare={onShare}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}

