import { CandidateGuard } from "@/components/gaurds";

export default function ChallangeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CandidateGuard>{children}</CandidateGuard>;
}
