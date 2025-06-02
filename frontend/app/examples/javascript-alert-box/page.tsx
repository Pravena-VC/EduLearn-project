"use client";

import AlertBoxExample from "@/components/examples/alert-box-example";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AlertBoxExamplePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link href="/challenges" className="hover:text-primary">
            Challenges
          </Link>
          <span>/</span>
          <Link href="/challenges/3" className="hover:text-primary">
            JavaScript Alert Box
          </Link>
          <span>/</span>
          <span className="text-foreground">Example</span>
        </div>

        <h1 className="text-3xl font-bold">
          JavaScript Alert Box - Example Solution
        </h1>
        <p className="text-muted-foreground">
          This example shows how to create a button that displays an alert
          message when clicked. You can use this as a reference for completing
          the challenge.
        </p>

        <div className="my-8">
          <AlertBoxExample />
        </div>

        <div className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/challenges/3">Back to Challenge</Link>
          </Button>
          <Button variant="default" asChild>
            <Link href="/challenges">View All Challenges</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
