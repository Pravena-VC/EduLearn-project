"use client";
import InstructorHeader from "@/components/Instructor-Header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { _axios } from "@/lib/axios";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function InstructorNotificationsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["instructor-notifications"],
    queryFn: async () => {
      return _axios.get("/notifications/", {}).then((res) => res.data);
    },
  });

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // Staff reply mutation
  const handleReply = async () => {
    if (!replyTo || !replyMessage.trim()) return;
    setIsReplying(true);
    try {
      await _axios.post("/notifications/reply/", {
        related_item_id:
          replyTo.related_item_id || replyTo.comment_id || replyTo.id, // comment id
        course_id: replyTo.course_id,
        message: replyMessage,
      });
      setReplyOpen(false);
      setReplyMessage("");
    } catch (e) {
      // Optionally show error toast
    } finally {
      setIsReplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 container mx-auto py-8">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="text-destructive">Failed to load notifications.</div>
    );
  }

  const notifications = data.data || [];

  return (
    <div className="space-y-6 mx-6">
      <InstructorHeader />

      <h1 className="text-2xl font-bold">Notifications</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {notifications.length === 0 ? (
          <div className="col-span-2 text-center text-muted-foreground py-12">
            No notifications yet.
          </div>
        ) : (
          notifications.map((n: any) => (
            <div
              key={n.id}
              className={cn(
                "rounded-lg border bg-background p-4 flex flex-col gap-3 shadow-sm transition hover:shadow-md",
                n.is_read ? "opacity-60" : "bg-accent/30 border-accent"
              )}
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={n.sender_image || undefined} />
                  <AvatarFallback className="text-lg font-bold">
                    {n.sender_name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-base">
                    {n.sender_name || "Unknown User"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(n.created_at).toLocaleDateString()}{" "}
                    {new Date(n.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <div className="font-medium text-lg mb-1">{n.title}</div>
                <div className="text-sm text-foreground/90 mb-2">
                  {n.message}
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyTo(n);
                      setReplyOpen(true);
                    }}
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Reply Dialog */}
      <Dialog open={replyOpen} onOpenChange={setReplyOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reply to {replyTo?.sender_name || "User"}</DialogTitle>
          </DialogHeader>
          <Textarea
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Type your reply..."
            className="min-h-[100px]"
            autoFocus
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReplyOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleReply}
              disabled={isReplying || !replyMessage.trim()}
            >
              {isReplying ? "Sending..." : "Send Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
