import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Note } from "../services/api-service";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note | null;
  onShare: (noteId: string, emails: string[]) => Promise<void>;
  onUnshare: (noteId: string, emails: string[]) => Promise<void>;
  isLoading?: boolean;
}

export function ShareDialog({
  open,
  onOpenChange,
  note,
  onShare,
  onUnshare,
  isLoading = false,
}: ShareDialogProps) {
  const [email, setEmail] = useState("");

  const sharedWith = note?.sharedWith ?? [];

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note?.id || !email.trim()) return;

    await onShare(note.id, [email.trim()]);
    setEmail("");
  };

  const handleRemoveUser = async (emailToRemove: string) => {
    if (!note?.id) return;
    await onUnshare(note.id, [emailToRemove]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share note</DialogTitle>
          <DialogDescription>
            Share "{note?.title}" with other users by entering their email.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAddUser} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="share-email">Email</Label>
            <div className="flex gap-2">
              <Input
                id="share-email"
                type="email"
                placeholder="Enter email to share with"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !email.trim()}>
                Add
              </Button>
            </div>
          </div>

          {sharedWith.length > 0 && (
            <div className="space-y-2">
              <Label>Shared with</Label>
              <div className="flex flex-wrap gap-2">
                {sharedWith.map((sharedEmail) => (
                  <Badge
                    key={sharedEmail}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    onClick={() => handleRemoveUser(sharedEmail)}
                  >
                    {sharedEmail}
                    <span className="ml-1">×</span>
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Click a user to remove their access
              </p>
            </div>
          )}
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

