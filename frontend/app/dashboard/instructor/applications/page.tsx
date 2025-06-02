"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InstructorApplicationView,
  getApplications,
  updateApplicationStatus,
} from "@/lib/api/application-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { CheckIcon, ClipboardListIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function InstructorApplicationsPage() {
  const queryClient = useQueryClient();
  const [currentTab, setCurrentTab] = useState<string>("pending");
  const [dialogData, setDialogData] = useState<{
    isOpen: boolean;
    applicationId: string | null;
    action: "approve" | "reject" | null;
    studentName: string;
    courseTitle: string;
  }>({
    isOpen: false,
    applicationId: null,
    action: null,
    studentName: "",
    courseTitle: "",
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["instructor-applications"],
    queryFn: async () => {
      const response = await getApplications();
      return response.data as InstructorApplicationView[];
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({
      applicationId,
      status,
    }: {
      applicationId: string;
      status: "approved" | "rejected";
    }) => updateApplicationStatus(applicationId, status),
    onSuccess: (data) => {
      toast(data?.message || "Application status updated successfully", {
        description: `You have ${
          dialogData.action === "approve" ? "approved" : "rejected"
        } the application successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["instructor-applications"] });
    },
    onError: (error: any) => {
      toast("Error", {
        description:
          error.response?.data?.message ||
          "Failed to update application status",
      });
    },
  });

  const handleStatusUpdate = () => {
    if (!dialogData.applicationId || !dialogData.action) return;

    statusMutation.mutate({
      applicationId: dialogData.applicationId,
      status: dialogData.action === "approve" ? "approved" : "rejected",
    });

    setDialogData({
      isOpen: false,
      applicationId: null,
      action: null,
      studentName: "",
      courseTitle: "",
    });
  };

  const openDialog = (
    applicationId: string,
    action: "approve" | "reject",
    studentName: string,
    courseTitle: string
  ) => {
    setDialogData({
      isOpen: true,
      applicationId,
      action,
      studentName,
      courseTitle,
    });
  };

  const filteredApplications: any = data?.filter((app) => {
    if (currentTab === "pending") return app.status === "pending";
    if (currentTab === "approved") return app.status === "approved";
    if (currentTab === "rejected") return app.status === "rejected";
    return true;
  });

  return (
    <div className="container py-6 space-y-6 mx-auto px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Course Applications
        </h1>
        <p className="text-muted-foreground">
          Review and manage student applications to your courses
        </p>
      </div>

      <Tabs
        defaultValue="pending"
        value={currentTab}
        onValueChange={setCurrentTab}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="pending">
            Pending
            {data && (
              <Badge variant="outline" className="ml-2">
                {data.filter((app) => app.status === "pending").length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="grid gap-4 grid-cols-1">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex justify-between">
                    <div>
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex space-x-2 w-full justify-end">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card>
            <CardContent className="pt-6">
              <p>Failed to load applications. Please try again later.</p>
            </CardContent>
          </Card>
        ) : filteredApplications?.length === 0 ? (
          <Card>
            <CardContent className="pt-6 flex flex-col items-center py-10 text-center">
              <div className="rounded-full bg-muted p-3">
                <ClipboardListIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium">
                No {currentTab} applications
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                {currentTab === "pending"
                  ? "You don't have any pending applications to review at the moment."
                  : currentTab === "approved"
                  ? "You haven't approved any student applications yet."
                  : "You haven't rejected any student applications yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-1">
            {filteredApplications.map((application: any) => (
              <Card key={application.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="line-clamp-1">
                        <Link
                          href={`/courses/${application.course.id}`}
                          className="hover:underline"
                        >
                          {application.course.title}
                        </Link>
                      </CardTitle>
                      <CardDescription>
                        Applied{" "}
                        {formatDistanceToNow(new Date(application.created_at), {
                          addSuffix: true,
                        })}
                      </CardDescription>
                    </div>
                    <Badge
                      className={
                        application.status === "approved"
                          ? "bg-green-500 hover:bg-green-600"
                          : application.status === "rejected"
                          ? "bg-red-500 hover:bg-red-600"
                          : ""
                      }
                      variant={
                        application.status === "pending" ? "outline" : "default"
                      }
                    >
                      {application.status.charAt(0).toUpperCase() +
                        application.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-start space-x-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-medium text-primary">
                        {application.student.name
                          .split(" ")
                          .map((n: any) => n[0])
                          .join("")
                          .toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">
                          {application.student.name}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {application.student.email}
                        </span>
                      </div>

                      {application.message ? (
                        <div className="text-sm">
                          <p className="text-muted-foreground">
                            Student message:
                          </p>
                          <p className="italic">{application.message}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No additional message from the student.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>

                {application.status === "pending" && (
                  <CardFooter className="border-t p-4">
                    <div className="flex space-x-2 ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          openDialog(
                            application.id,
                            "reject",
                            application.student.name,
                            application.course.title
                          )
                        }
                      >
                        <XIcon className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          openDialog(
                            application.id,
                            "approve",
                            application.student.name,
                            application.course.title
                          )
                        }
                      >
                        <CheckIcon className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        )}
      </Tabs>

      <Dialog
        open={dialogData.isOpen}
        onOpenChange={(isOpen) => setDialogData({ ...dialogData, isOpen })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogData.action === "approve"
                ? "Approve Application"
                : "Reject Application"}
            </DialogTitle>
            <DialogDescription>
              {dialogData.action === "approve"
                ? `Are you sure you want to approve ${dialogData.studentName}'s application to "${dialogData.courseTitle}"? This will grant them access to the course.`
                : `Are you sure you want to reject ${dialogData.studentName}'s application to "${dialogData.courseTitle}"? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogData({ ...dialogData, isOpen: false })}
            >
              Cancel
            </Button>
            <Button
              variant={
                dialogData.action === "approve" ? "default" : "destructive"
              }
              onClick={handleStatusUpdate}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending
                ? "Processing..."
                : dialogData.action === "approve"
                ? "Yes, Approve"
                : "Yes, Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
