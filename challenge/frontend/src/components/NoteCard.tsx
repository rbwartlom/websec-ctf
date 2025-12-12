import { Button } from "@/components/ui/button";
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
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const handleDelete = () => {
    if (note.id) {
      onDelete(note.id);
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">
          {note.title || "Untitled"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
          {note.content || "No content"}
        </p>
      </CardContent>
      <CardFooter className="pt-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(note)}
        >
          Edit
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className="flex-1"
          onClick={handleDelete}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

