import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiNotesById, type Note } from "../services/api-service";

interface ViewSharedNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewSharedNoteDialog({
  open,
  onOpenChange,
}: ViewSharedNoteDialogProps) {
  const [noteId, setNoteId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [note, setNote] = useState<Note | null>(null);

  const handleFetchNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteId.trim()) return;

    setIsLoading(true);
    setNote(null);
    try {
      const response = await getApiNotesById({ path: { id: noteId.trim() } });
      if (response.data) {
        setNote(response.data);
      }
    } catch {
      // Error is handled by global interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setNoteId("");
    setNote(null);
  };

  const handleCopyContent = async () => {
    if (note?.content) {
      await navigator.clipboard.writeText(note.content);
      toast.success("Content copied to clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>View Shared Note</DialogTitle>
          <DialogDescription>
            Enter a note ID to view a note that has been shared with you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFetchNote} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="note-id">Note ID</Label>
            <div className="flex gap-2">
              <Input
                id="note-id"
                placeholder="Enter note ID"
                value={noteId}
                onChange={(e) => setNoteId(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !noteId.trim()}>
                {isLoading ? "Loading..." : "View"}
              </Button>
            </div>
          </div>
        </form>

        {note && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{note.title || "Untitled"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap max-h-64 overflow-y-auto">
                {note.content || "No content"}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyContent}
                className="w-full"
              >
                Copy Content
              </Button>
            </CardContent>
          </Card>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

