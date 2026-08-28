import type { Metadata } from "next";
import { MatchesView } from "./matches-view";

export const metadata: Metadata = { title: "Đã chấm bằng AI — Careelot" };

export default function MatchesPage() {
  return <MatchesView />;
}
