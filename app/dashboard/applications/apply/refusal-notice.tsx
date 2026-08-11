import Link from "next/link";
import { ArrowRight, CheckCircle2, Search, ShieldAlert } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import type { Refusal } from "./refusal";

function RefusalLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-xs font-semibold underline"
    >
      {children} <ArrowRight className="size-3.5" />
    </Link>
  );
}

/**
 * Mỗi lý do từ chối một hình thức riêng, và chỉ trường hợp cuối mới là hộp đỏ.
 *
 * Câu chữ lấy nguyên từ backend qua `apiErrorMessage` — backend đã viết sẵn
 * tiếng Việt, kể cả trích dẫn câu trong tin tuyển dụng dẫn tới kết luận không
 * đủ điều kiện. Viết lại ở đây chỉ làm mất đúng phần thông tin có giá trị nhất.
 */
export function RefusalNotice({ refusal }: { refusal: Refusal }) {
  if (refusal.kind === "ineligible") {
    return (
      <Alert
        tone="warning"
        icon={ShieldAlert}
        title="Không đủ điều kiện ứng tuyển"
        actions={
          <RefusalLink href={`/dashboard/jobs/${refusal.jobId}`}>
            Xem chi tiết đánh giá
          </RefusalLink>
        }
      >
        <p>{refusal.message}</p>
        <p className="mt-2">
          Đây là kết luận từ khâu chấm điểm chứ không phải sự cố hệ thống. Tin
          này đòi điều kiện mà hồ sơ chưa đáp ứng, nộp cũng không được xét, nên
          hệ thống không soạn hồ sơ cho nó.
        </p>
      </Alert>
    );
  }

  if (refusal.kind === "not-scored") {
    return (
      <Alert
        tone="info"
        icon={Search}
        title="Chưa có kết quả chấm điểm dùng được"
        actions={
          <RefusalLink href={`/dashboard/jobs/${refusal.jobId}`}>
            Chấm điểm công việc này trước
          </RefusalLink>
        }
      >
        {refusal.message}
      </Alert>
    );
  }

  if (refusal.kind === "duplicate") {
    return (
      <Alert
        tone="info"
        icon={CheckCircle2}
        title="Đã ứng tuyển"
        actions={
          <RefusalLink href="/dashboard/applications">
            Xem đơn trong Lịch sử ứng tuyển
          </RefusalLink>
        }
      >
        {refusal.message}
      </Alert>
    );
  }

  return <Alert tone="danger">{refusal.message}</Alert>;
}
