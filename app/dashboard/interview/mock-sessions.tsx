"use client";

import Link from "next/link";
import { CaretRight, Microphone } from "@phosphor-icons/react/ssr";
import { agentService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import { AgentStatusBadge } from "@/components/dashboard/agent-status-badge";
import { SectionCard } from "@/components/ui/section-card";
import { Skeleton } from "@/components/ui/skeleton";
import { relativeDay } from "@/utils";

/** Bao nhiêu buổi gần nhất hiện trên màn. Đủ để tìm lại, chưa cần phân trang. */
const PAGE_SIZE = 8;

/**
 * Danh sách buổi phỏng vấn thử đã có, mọi vị trí.
 *
 * Thiếu nó thì buổi luyện chỉ tới được từ trang chi tiết TIN, nên thoát ra một
 * cái là không còn đường quay lại - phải nhớ mình đã luyện cho tin nào rồi tự
 * mò về đúng tin đó. Đặt ở màn Chuẩn bị phỏng vấn vì đây là chỗ người dùng đi
 * tìm mọi thứ liên quan tới phỏng vấn, và nó hiện KỂ CẢ khi chưa có bộ đề nào.
 */
export function MockSessions() {
  const page = useApiQuery(
    keys.agentRunList({ workflow: "interview", limit: PAGE_SIZE }),
    () => agentService.list({ workflow: "interview", limit: PAGE_SIZE }),
    { errorMessage: "Không tải được danh sách buổi luyện" },
  );

  // Chưa có buổi nào thì không dựng gì cả: một thẻ rỗng chỉ chiếm chỗ trên màn
  // hình mà lối vào thật nằm ở trang chi tiết tin.
  if (page.error || (page.data && page.data.items.length === 0)) return null;

  return (
    <SectionCard
      icon={Microphone}
      title="Buổi phỏng vấn thử đã có"
      description="Mở lại để đọc nhận xét, hoặc luyện tiếp từ chỗ đang dở"
      className="mb-4"
      contentClassName="space-y-0"
    >
      {!page.data ? (
        <Skeleton className="h-20" />
      ) : (
        <ul className="divide-y divide-slate-100">
          {page.data.items.map((session) => {
            /*
              Ba trường hợp, và hai cái sau KHÁC nhau: buổi chạy từ mô tả dán
              tay chưa bao giờ có `jobId`, còn tin bị gỡ thì có `jobId` mà quan
              hệ trả về null. Gộp chung là nói với người dùng một điều không
              đúng về dữ liệu của họ.
            */
            const label = session.job
              ? `${session.job.title} · ${session.job.company}`
              : session.jobId
                ? "Tin tuyển dụng đã bị gỡ"
                : "Buổi luyện từ mô tả dán tay";

            const row = (
              <div className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    <span className="font-mono tabular-nums">
                      {session._count.steps}
                    </span>{" "}
                    bước · {relativeDay(session.createdAt)}
                  </p>
                </div>
                <AgentStatusBadge status={session.status} />
                {session.jobId && (
                  <CaretRight className="size-4.5 shrink-0 text-slate-300" />
                )}
              </div>
            );

            return (
              <li key={session.id}>
                {session.jobId ? (
                  <Link
                    href={`/dashboard/interview/${session.jobId}/mock`}
                    className="hover:bg-slate-50/80 -mx-2 block rounded-md px-2 transition-colors"
                  >
                    {row}
                  </Link>
                ) : (
                  <div className="-mx-2 px-2 opacity-60">{row}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
