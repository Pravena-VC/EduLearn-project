"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight">
            Terms of Service
          </h1>
          <p className="text-muted-foreground">Last Updated: April 20, 2025</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <p>
            Welcome to EduLearn. These Terms of Service ("Terms") govern your
            access to and use of EduLearn's website, services, and applications
            (the "Services"). Please read these Terms carefully, and contact us
            if you have any questions.
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using our Services, you agree to be bound by these
            Terms and our Privacy Policy. If you do not agree to these Terms,
            you may not access or use the Services.
          </p>

          <h2>2. Changes to Terms</h2>
          <p>
            We may modify the Terms at any time, at our sole discretion. If we
            do so, we'll notify you either by posting the modified Terms on the
            Site or through other communications. It's important that you review
            the Terms whenever we modify them because, if you continue to use
            the Services after we have posted modified Terms on the Site, you
            are indicating to us that you agree to be bound by the modified
            Terms.
          </p>

          <h2>3. Account Registration</h2>
          <p>
            To access most features of the Services, you must register for an
            account. When you register, you agree to provide accurate, current,
            and complete information about yourself. It is your responsibility
            to keep your account information up-to-date. You are responsible for
            safeguarding your account credentials and for any activity that
            occurs under your account.
          </p>

          <h2>4. Content and Licenses</h2>
          <p>
            Our Services allow you to access courses, challenges, and other
            educational content ("Content"). All Content is the property of
            EduLearn or its licensors and is protected by copyright, trademark,
            and other intellectual property laws.
          </p>
          <p>
            Subject to your compliance with these Terms, EduLearn grants you a
            limited, non-exclusive, non-transferable, non-sublicensable license
            to access and view the Content solely for your personal,
            non-commercial educational purposes.
          </p>

          <h2>5. User Content</h2>
          <p>
            You may submit content to the Services, including but not limited to
            course reviews, forum posts, and project submissions ("User
            Content"). You retain all rights in, and are solely responsible for,
            the User Content you post to the Services.
          </p>
          <p>
            By posting User Content, you grant EduLearn a non-exclusive,
            transferable, sub-licensable, royalty-free, worldwide license to
            use, copy, modify, create derivative works based on, distribute,
            publicly display, publicly perform, and otherwise exploit in any
            manner such User Content in all formats and distribution channels
            now known or hereafter devised.
          </p>

          <h2>6. Prohibited Conduct</h2>
          <p>
            You agree not to engage in any of the following prohibited
            activities:
          </p>
          <ul>
            <li>Violating any applicable law or regulation</li>
            <li>Infringing the intellectual property rights of others</li>
            <li>Sharing your account credentials with others</li>
            <li>
              Attempting to circumvent any content-filtering techniques we
              employ
            </li>
            <li>Using the Services for any illegal or unauthorized purpose</li>
            <li>Interfering with or disrupting the Services</li>
          </ul>

          <h2>7. Subscription and Payment Terms</h2>
          <p>
            Some of our Services require payment. By subscribing to a paid
            service, you agree to pay the specified fees. Unless otherwise
            specified, all fees are quoted in U.S. Dollars and are
            non-refundable.
          </p>

          <h2>8. Termination</h2>
          <p>
            We may terminate or suspend your access to all or part of the
            Services at any time, with or without cause, with or without notice.
          </p>

          <h2>9. Disclaimer of Warranties</h2>
          <p>
            THE SERVICES AND CONTENT ARE PROVIDED "AS IS," WITHOUT WARRANTY OF
            ANY KIND. EDULEARN DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED,
            INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY
            AND FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT.
          </p>

          <h2>10. Limitation of Liability</h2>
          <p>
            IN NO EVENT SHALL EDULEARN BE LIABLE FOR ANY SPECIAL, INDIRECT,
            CONSEQUENTIAL, OR INCIDENTAL DAMAGES, INCLUDING, WITHOUT LIMITATION,
            LOST PROFITS OR LOSS OF DATA, WHETHER OR NOT EDULEARN HAS BEEN
            ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>

          <h2>11. Governing Law</h2>
          <p>
            These Terms shall be governed by the laws of the State of
            California, without respect to its conflict of laws principles.
          </p>

          <h2>12. Contact Information</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
            <br />
            Email: legal@edulearn.com
            <br />
            Address: 123 Learning Way, San Francisco, CA 94105
          </p>
        </div>

        <div className="flex space-x-4 pt-6">
          <Button asChild variant="default">
            <Link href="/">Return to Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/privacy">Privacy Policy</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
