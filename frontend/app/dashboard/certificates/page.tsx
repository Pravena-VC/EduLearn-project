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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Search } from "lucide-react";
import { useState } from "react";

export default function CertificatesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock certificates data
  const certificates = [
    {
      id: 1,
      title: "Web Development Fundamentals",
      issueDate: "March 15, 2023",
      instructor: "Jane Smith",
      credentialId: "WD-12345-2023",
      image: "/placeholder.svg?height=200&width=300",
      category: "Web Development",
      status: "completed",
    },
    {
      id: 2,
      title: "Python Programming Basics",
      issueDate: "January 10, 2023",
      instructor: "John Doe",
      credentialId: "PY-67890-2023",
      image: "/placeholder.svg?height=200&width=300",
      category: "Programming",
      status: "completed",
    },
    {
      id: 3,
      title: "JavaScript Advanced Concepts",
      issueDate: "In Progress (78%)",
      instructor: "Alex Johnson",
      credentialId: "JS-24680-2023",
      image: "/placeholder.svg?height=200&width=300",
      category: "Web Development",
      status: "in-progress",
    },
    {
      id: 4,
      title: "Data Science Fundamentals",
      issueDate: "In Progress (45%)",
      instructor: "Sarah Williams",
      credentialId: "DS-13579-2023",
      image: "/placeholder.svg?height=200&width=300",
      category: "Data Science",
      status: "in-progress",
    },
  ];

  // Filter certificates based on search query
  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.instructor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate completed and in-progress certificates
  const completedCertificates = filteredCertificates.filter(
    (cert) => cert.status === "completed"
  );
  const inProgressCertificates = filteredCertificates.filter(
    (cert) => cert.status === "in-progress"
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground">
            View and download your earned certificates
          </p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search certificates..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="completed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="completed" className="space-y-4">
          {completedCertificates.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No certificates found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Complete courses to earn certificates"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {completedCertificates.map((certificate) => (
                <Card key={certificate.id} className="overflow-hidden">
                  <div className="aspect-[3/2] relative">
                    <img
                      src={certificate.image || "/placeholder.svg"}
                      alt={certificate.title}
                      className="object-cover w-full h-full"
                    />
                    <Badge className="absolute top-2 right-2">
                      {certificate.category}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {certificate.title}
                    </CardTitle>
                    <CardDescription>
                      Issued on {certificate.issueDate}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Instructor:
                        </span>
                        <span>{certificate.instructor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Credential ID:
                        </span>
                        <span className="font-mono">
                          {certificate.credentialId}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" asChild>
                      <a href="#" download>
                        <Download className="mr-2 h-4 w-4" />
                        Download Certificate
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4">
          {inProgressCertificates.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">
                No certificates in progress
              </h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Enroll in courses to start earning certificates"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {inProgressCertificates.map((certificate) => (
                <Card key={certificate.id} className="overflow-hidden">
                  <div className="aspect-[3/2] relative">
                    <img
                      src={certificate.image || "/placeholder.svg"}
                      alt={certificate.title}
                      className="object-cover w-full h-full"
                    />
                    <Badge className="absolute top-2 right-2">
                      {certificate.category}
                    </Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {certificate.title}
                    </CardTitle>
                    <CardDescription>
                      Status: {certificate.issueDate}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Instructor:
                        </span>
                        <span>{certificate.instructor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Credential ID:
                        </span>
                        <span className="font-mono">
                          {certificate.credentialId}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`/courses/${certificate.id}`}>Continue Course</a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
