"use client";

import ChallengePage from "@/components/challenges";
import { challenges } from "@/lib/challenges";
import { notFound } from "next/navigation";
import React from "react";

export default function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);

  const challenge = challenges.find((c) => c.id === parseInt(id));

  if (!challenge) {
    return notFound();
  }

  return <ChallengePage challenge={challenge} />;
}
