"use client";

import InstructorHeader from "@/components/Instructor-Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Users2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";

export default function InstructorAnalyticsPage() {
  const revenueData = [
    { month: "Jan", revenue: 2000 },
    { month: "Feb", revenue: 3500 },
    { month: "Mar", revenue: 4200 },
    { month: "Apr", revenue: 3000 },
    { month: "May", revenue: 5000 },
  ];
  const enrollmentsData = [
    { month: "Jan", enrollments: 120 },
    { month: "Feb", enrollments: 180 },
    { month: "Mar", enrollments: 210 },
    { month: "Apr", enrollments: 160 },
    { month: "May", enrollments: 250 },
  ];
  const courseStats = [
    { name: "React Basics", students: 120, completions: 80 },
    { name: "Next.js Advanced", students: 90, completions: 60 },
    { name: "Python Bootcamp", students: 150, completions: 110 },
  ];

  const revenueChartConfig: ChartConfig = {
    revenue: { label: "Revenue", color: "#2563eb" },
  };
  const enrollmentsChartConfig: ChartConfig = {
    enrollments: { label: "Enrollments", color: "#22c55e" },
  };
  const completionsChartConfig: ChartConfig = {
    completions: { label: "Completions", color: "#f59e42" },
  };
  const studentsChartConfig: ChartConfig = {
    students: { label: "Students", color: "#6366f1" },
  };

  return (
    <div className="space-y-6 mx-6">
      <InstructorHeader />

      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track your course performance, revenue, and student engagement.
        </p>
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
            <CardDescription>All-time enrolled students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Users2 className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold">34</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Students</CardTitle>
            <CardDescription>Students active this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Users2 className="h-8 w-8 text-primary" />
              <span className="text-3xl font-bold">12</span>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={revenueChartConfig}
              className="min-h-[200px] w-full"
            >
              <LineChart data={revenueData} width={400} height={200}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent labelKey="revenue" nameKey="month" />
                  }
                />
                <ChartLegend
                  content={<ChartLegendContent nameKey="revenue" />}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Enrollments Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={enrollmentsChartConfig}
              className="min-h-[200px] w-full"
            >
              <BarChart data={enrollmentsData} width={400} height={200}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelKey="enrollments"
                      nameKey="month"
                    />
                  }
                />
                <ChartLegend
                  content={<ChartLegendContent nameKey="enrollments" />}
                />
                <Bar dataKey="enrollments" fill="#22c55e" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Course Completion Rates</CardTitle>
            <CardDescription>Completions per course</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={completionsChartConfig}
              className="min-h-[200px] w-full"
            >
              <BarChart data={courseStats} width={400} height={200}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelKey="completions"
                      nameKey="name"
                    />
                  }
                />
                <ChartLegend
                  content={<ChartLegendContent nameKey="completions" />}
                />
                <Bar dataKey="completions" fill="#f59e42" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Students per Course</CardTitle>
            <CardDescription>Enrollment by course</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={studentsChartConfig}
              className="min-h-[200px] w-full"
            >
              <BarChart data={courseStats} width={400} height={200}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent labelKey="students" nameKey="name" />
                  }
                />
                <ChartLegend
                  content={<ChartLegendContent nameKey="students" />}
                />
                <Bar dataKey="students" fill="#6366f1" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
