"use client";

import CandidateHeader from "@/components/candidate-header";
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
import { _axios } from "@/lib/axios";
import { generateCertificatePDF } from "@/lib/certificate-generator";
import { useAuthStore } from "@/lib/store/auth-store";
import { useQuery } from "@tanstack/react-query";
import { Award, Download, GraduationCap, Share2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CertificatesPage() {
  const [isCertificateLoading, setIsCertificateLoading] = useState(false);
  const [loadingCertificateId, setLoadingCertificateId] = useState<
    string | null
  >(null);

  const user = useAuthStore((state) => state.user);
  const { data: certificates, isLoading } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: async () => {
      let res = await _axios.get("/my-certificates/");
      return res.data;
    },
  });

  const handleDownload = async (cert: any) => {
    try {
      setIsCertificateLoading(true);
      setLoadingCertificateId(cert.id);
      const studentName = user?.username || "Student";

      const today = new Date();
      const issueDate = today.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const pdfBlob = await generateCertificatePDF({
        studentName,
        courseTitle: cert.title,
        instructorName: cert.instructor.name,
        issueDate,
        courseId: cert.id,
        category: cert.category,
      });

      const url = window.URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${cert.title.replace(/\s+/g, "_")}_Certificate.pdf`
      );

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setIsCertificateLoading(false);
      setLoadingCertificateId(null);
    } catch (error) {
      console.error("Error generating certificate:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 mx-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Certificates</h1>
          <p className="text-muted-foreground mt-1">
            View and share your earned certificates and achievements
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, index) => (
            <CertificateSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 mx-8">
      <CandidateHeader />

      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Certificates</h1>
        <p className="text-muted-foreground mt-1">
          View and share your earned certificates and achievements
        </p>
      </div>
      {certificates?.data?.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-medium mt-4">No Certificates Yet</h3>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Complete courses to earn certificates that showcase your skills and
            knowledge.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/candidate/courses">Browse Courses</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {certificates?.data?.map((cert: any) => (
            <Card key={cert.id} className="overflow-hidden flex flex-col">
              <div className="aspect-[16/9] relative bg-muted">
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="w-full max-w-md bg-card border rounded-lg p-6 text-center space-y-2">
                    <Award className="h-12 w-12 mx-auto text-primary" />
                    <h3 className="font-semibold text-lg">{cert.title}</h3>
                    <p className="text-sm">This certifies that</p>
                    <p className="font-medium">{user?.username || "Student"}</p>
                    <p className="text-sm">
                      has successfully completed the course
                    </p>
                    <p className="font-medium">{cert.title}</p>
                    <div className="text-sm text-muted-foreground">
                      Issued on {new Date().toLocaleDateString()}
                    </div>
                    <div className="text-xs">Credential ID: {cert.id}</div>
                  </div>
                </div>
              </div>

              <CardHeader className="pb-2">
                <CardTitle>{cert.title}</CardTitle>
                <CardDescription>
                  Instructor: {cert.instructor.name}
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-0 flex-grow">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary">{cert.category}</Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-4 space-y-1">
                  <div className="flex justify-between">
                    <span>Issued:</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expires:</span>
                    <span>Never</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Credential ID:</span>
                    <span className="font-mono text-xs">{cert.id}</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-4 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleDownload(cert)}
                  disabled={
                    isCertificateLoading && loadingCertificateId === cert.id
                  }
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isCertificateLoading && loadingCertificateId === cert.id
                    ? "Generating..."
                    : "Download"}
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

const CertificateSkeleton = () => (
  <Card className="overflow-hidden flex flex-col">
    <div className="aspect-[16/9] relative bg-muted">
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-card border rounded-lg p-6 text-center space-y-2">
          <Skeleton className="h-12 w-12 mx-auto" />
          <Skeleton className="h-6 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <Skeleton className="h-4 w-1/3 mx-auto" />
          <Skeleton className="h-4 w-1/4 mx-auto" />
          <Skeleton className="h-4 w-1/5 mx-auto" />
          <Skeleton className="h-4 w-1/6 mx-auto" />
        </div>
      </div>
    </div>
    <CardHeader className="pb-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent className="pb-0 flex-grow">
      <div className="flex flex-wrap gap-1">
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="text-sm text-muted-foreground mt-4 space-y-1">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
    </CardContent>
    <CardFooter className="pt-4 flex gap-2">
      <Skeleton className="h-10 w-1/2" />
      <Skeleton className="h-10 w-1/2" />
    </CardFooter>
  </Card>
);
