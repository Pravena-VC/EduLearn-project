"use client";

import CandidateHeader from "@/components/candidate-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cancelApplication, getApplications } from "@/lib/api/application-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ClockIcon, XIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function StudentApplicationsPage() {
  const queryClient = useQueryClient();
  const [applicationToCancel, setApplicationToCancel] = useState<string | null>(
    null
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["applications"],
    queryFn: async () => {
      const response = await getApplications();
      return response.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (applicationId: string) => cancelApplication(applicationId),
    onSuccess: () => {
      toast("Application cancelled", {
        description: "Your application has been cancelled successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error: any) => {
      toast("Error", {
        description:
          error.response?.data?.message || "Failed to cancel application",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">Approved</Badge>
        );
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "pending":
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="container py-6 space-y-6 mx-6">
      <CandidateHeader />

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Course Applications
        </h1>
        <p className="text-muted-foreground">
          View and manage your course applications
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
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
      ) : data?.length === 0 ? (
        <Card>
          <CardContent className="pt-6 flex flex-col items-center py-10 text-center">
            <div className="rounded-full bg-muted p-3">
              <ClockIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No applications yet</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
              You haven't applied to any courses yet. Browse our courses and
              apply to start your learning journey.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {data.map((application: any) => (
            <Card key={application.id} className="overflow-hidden">
              <div className="aspect-video relative overflow-hidden bg-muted">
                {application.course.thumbnail ? (
                  <Image
                    src={application.course.thumbnail}
                    alt={application.course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Image
                      src="/placeholder.jpg"
                      alt="Course thumbnail"
                      width={300}
                      height={169}
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <CardHeader>
                <CardTitle className="line-clamp-1">
                  {application.course.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(application.status)}
                  <CardDescription>
                    Applied{" "}
                    {formatDistanceToNow(new Date(application.created_at), {
                      addSuffix: true,
                    })}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                {application.message && (
                  <>
                    <p className="text-sm text-muted-foreground mb-2">
                      Your message:
                    </p>
                    <p className="text-sm italic line-clamp-3">
                      {application.message}
                    </p>
                  </>
                )}
              </CardContent>

              <CardFooter className="justify-between border-t p-4">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/courses/${application.course.id}`}>
                    View Course
                  </Link>
                </Button>

                {application.status === "pending" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setApplicationToCancel(application.id)}
                  >
                    <XIcon className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog
        open={applicationToCancel !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setApplicationToCancel(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Application</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this application? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (applicationToCancel) {
                  cancelMutation.mutate(applicationToCancel);
                  setApplicationToCancel(null);
                }
              }}
              className="bg-red-500 hover:bg-red-600"
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending
                ? "Cancelling..."
                : "Yes, cancel application"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
