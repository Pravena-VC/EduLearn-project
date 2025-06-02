"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { applyToCourse } from "@/lib/api/application-api";
import { useAuthStore } from "@/lib/store/auth-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

interface ApplicationDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  courseId: number;
  courseTitle: string;
  setRefetchApi: any;
}

export default function ApplicationDialog({
  open,
  setOpen,
  courseId,
  courseTitle,
  setRefetchApi,
}: ApplicationDialogProps) {
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const userType = useAuthStore((state) => state.user?.role);
  const user = useAuthStore((state) => state.user);

  const applicationMutation = useMutation({
    mutationFn: () => applyToCourse(courseId, message),
    onSuccess: () => {
      toast("Application submitted", {
        description: "Your application has been submitted successfully",
      });
      setOpen(false);
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      setRefetchApi((prev: any) => !prev);
    },
    onError: (error: any) => {
      toast("Error", {
        description:
          error.response?.data?.message || "Failed to submit application",
      });
    },
  });

  const handleSubmit = () => {
    if (!user) {
      toast("Login required", {
        description: "Please log in to apply for this course",
      });
      return;
    }

    if (userType === "staff") {
      toast("Not available", {
        description: "As an instructor, you cannot apply for courses",
      });
      return;
    }

    applicationMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply for Course</DialogTitle>
          <DialogDescription>
            Submit your application for "{courseTitle}". The instructor will
            review your application.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium mb-1"
              >
                Message to Instructor (optional)
              </label>
              <Textarea
                id="message"
                placeholder="Why are you interested in this course? Any relevant experience or goals you'd like to share?"
                className="min-h-[120px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={applicationMutation.isPending}
          >
            {applicationMutation.isPending
              ? "Submitting..."
              : "Submit Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
