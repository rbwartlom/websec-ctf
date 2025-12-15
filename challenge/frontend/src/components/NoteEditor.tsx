import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Note } from "../services/api-service";

interface NoteEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note | null;
  onSave: (title: string, content: string, isPublic: boolean) => Promise<void>;
  isLoading?: boolean;
}

export function NoteEditor({
  open,
  onOpenChange,
  note,
  onSave,
  isLoading = false,
}: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const isEditing = note !== null;

  useEffect(() => {
    if (open) {
      setTitle(note?.title ?? "");
      setContent(note?.content ?? "");
      setIsPublic(note?.isPublic ?? false);
    }
  }, [open, note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(title, content, isPublic);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit note" : "Create new note"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Make changes to your note here."
                : "Add a title and content for your new note."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note-title">Title</Label>
              <Input
                id="note-title"
                placeholder="Note title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-content">Content</Label>
              <Textarea
                id="note-content"
                placeholder="Write your note here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                required
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="note-public">Public note</Label>
                <p className="text-sm text-muted-foreground">
                  Anyone can view this note without signing in
                </p>
              </div>
              <Switch
                id="note-public"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

