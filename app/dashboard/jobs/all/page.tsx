import { redirect } from "next/navigation";

/** Danh sách đã gộp về `/dashboard/jobs`; giữ route cũ cho link và bookmark. */
export default function AllJobsPage() {
  redirect("/dashboard/jobs");
}
