import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Note } from "../services/api-service";

interface NoteCardProps {
  note: Note;
  currentUserId?: string;
  onEdit?: (note: Note) => void;
  onDelete?: (noteId: string) => void;
  onShare?: (note: Note) => void;
  readOnly?: boolean;
}

export function NoteCard({
  note,
  currentUserId,
  onEdit,
  onDelete,
  onShare,
  readOnly = false,
}: NoteCardProps) {
  const handleDelete = () => {
    if (note.id && onDelete) {
      onDelete(note.id);
    }
  };

  const handleCopyId = async () => {
    if (note.id) {
      await navigator.clipboard.writeText(note.id);
      toast.success("Note ID copied to clipboard");
    }
  };

  const isOwner = currentUserId !== undefined && note.owner === currentUserId;
  const isSharedWithMe = !isOwner && currentUserId !== undefined;
  const hasSharedUsers = (note.sharedWith?.length ?? 0) > 0;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-1 flex-1">
            {note.title || "Untitled"}
          </CardTitle>
          <div className="flex gap-1 flex-shrink-0">
            {note.isPublic && (
              <Badge variant="secondary" className="text-xs">
                Public
              </Badge>
            )}
            {isSharedWithMe && (
              <Badge variant="outline" className="text-xs">
                Shared
              </Badge>
            )}
            {isOwner && hasSharedUsers && (
              <Badge variant="outline" className="text-xs">
                {note.sharedWith?.length} shared
              </Badge>
            )}
          </div>
        </div>
        <button
          onClick={handleCopyId}
          className="text-xs text-muted-foreground hover:text-foreground font-mono truncate text-left transition-colors"
          title="Click to copy note ID"
        >
          ID: {note.id}
        </button>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
          {note.content || "No content"}
        </p>
      </CardContent>
      {!readOnly && (
        <CardFooter className="pt-2 gap-2 flex-wrap">
          {isOwner && onEdit && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(note)}
            >
              Edit
            </Button>
          )}
          {isOwner && onShare && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onShare(note)}
            >
              Share
            </Button>
          )}
          {isOwner && onDelete && (
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
          {isSharedWithMe && onEdit && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(note)}
            >
              View
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

