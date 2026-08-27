"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Microphone, Sparkle } from "@phosphor-icons/react/ssr";
import { useApiQuery } from "@/hooks/use-api-query";
import { apiErrorMessage, apiErrorStatus } from "@/lib/axios";

import { interviewService, type InterviewPrepRecord } from "@/services";

import { cn, companyColor, companyInitials, relativeDay } from "@/utils";
import { PageHeader } from "@/components/dashboard/page-header";
import { PrepDetail, STATUS_LABEL, STATUS_VARIANT } from "./prep-detail";
import { CompanyLogo } from "@/components/dashboard/company-logo";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { MockSessions } from "./mock-sessions";

const LOGIN_NEXT = "/login?next=/dashboard/interview";

/** Số vị trí hiện một lúc ở cột trái. Phần còn lại lật bằng thanh phân trang. */
const PAGE_SIZE = 15;

/** Bốn trạng thái của một lượt soạn, mỗi cái cần một câu khác nhau. */
export function InterviewView() {
  const router = useRouter();
  const [offset, setOffset] = useState(0);
  const [retryError, setRetryError] = useState<string | null>(null);
  /** `null` = người dùng chưa bấm chọn, để hệ thống chọn hộ. */
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const page = useApiQuery(
    ["interview", "list", offset],
    () => interviewService.list({ limit: PAGE_SIZE, offset }),
    {
      errorMessage: "Không tải được bộ câu hỏi phỏng vấn",
      keepPrevious: true,
    },
  );

  const preps: InterviewPrepRecord[] | null = page.data?.items ?? null;
  const total = page.data?.total ?? 0;
  const error = retryError ?? page.error;

  /*
   * Ưu tiên một bản ĐÃ XONG, chỉ lùi về bản mới nhất khi không có bản nào xong.
   *
   * Backend sắp theo `updatedAt` giảm dần, mà một lần chạy hỏng cũng cập nhật
   * `updatedAt` — nên "bản mới nhất" rất hay chính là bản vừa hỏng, và người
   * dùng mở màn hình ra là gặp ngay một khối lỗi đỏ trong khi vẫn có bộ câu hỏi
   * dùng được ở ngay dưới. Đó đúng là điều đã xảy ra.
   *
   * Suy ra lúc render thay vì gieo vào state sau khi tải: bản cũ cần một `ref`
   * để nhớ đã chọn hộ lần nào chưa, và lật trang thì lựa chọn cũ trỏ vào một
   * bản ghi không còn trên trang — khung bên phải trống trơn.
   */
  const autoId =
    (preps?.find((prep) => prep.status === "DONE") ?? preps?.[0])?.id ?? null;
  const selectedId = chosenId ?? autoId;
  const selected = preps?.find((prep) => prep.id === selectedId) ?? null;

  /**
   * Xếp lại vào hàng đợi rồi tải lại danh sách.
   *
   * `force: true` là bắt buộc: bản ghi đã tồn tại ở trạng thái FAILED, và đường
   * mặc định sẽ thấy "đã có rồi" mà không chạy lại gì cả.
   */
  const retry = async () => {
    if (!selected) return;
    setRetrying(true);
    setRetryError(null);
    try {
      await interviewService.prep(selected.job.id, true);
      page.reload();
    } catch (err) {
      if (apiErrorStatus(err) === 401) {
        router.replace(LOGIN_NEXT);
        return;
      }
      setRetryError(apiErrorMessage(err, "Không xếp lại được vào hàng đợi"));
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chuẩn bị phỏng vấn"
        subtitle="Bộ câu hỏi và câu trả lời gợi ý, soạn riêng cho từng vị trí bạn đang phỏng vấn"
      />

      {/*
        Đặt TRƯỚC nhánh rẽ bên dưới, không nằm trong nó: nhánh đó trả về ô trống
        khi chưa có bộ đề nào, mà buổi luyện thì không cần bộ đề - nhét vào trong
        là lặp lại đúng lỗi đã làm một lần, khoá lối vào sau một điều kiện thừa.
      */}
      <MockSessions />

      {error ? (
        <Alert tone="danger">{error}</Alert>
      ) : !preps ? (
        <Skeleton className="h-64 animate-pulse" />
      ) : preps.length === 0 ? (
        <Card>
          <EmptyState
            icon={Sparkle}
            title="Chưa có bộ câu hỏi nào"
            description={
              <>
                Bộ câu hỏi được soạn tự động khi bạn chuyển một đơn ứng tuyển
                sang trạng thái <strong>Phỏng vấn</strong>. Hệ thống không soạn
                sớm hơn vì phần lớn đơn không đi tới vòng này, mà mỗi lượt soạn
                đều tốn một lần gọi model.
              </>
            }
            action={
              <Link href="/dashboard/applications">
                <Button>Mở Lịch sử ứng tuyển</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
          {/* Danh sách vị trí */}
          <Card className="h-fit overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {preps.map((prep) => {
                const active = prep.id === selectedId;
                return (
                  <li key={prep.id}>
                    <button
                      type="button"
                      onClick={() => setChosenId(prep.id)}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-left transition-colors",
                        active ? "bg-primary-50" : "hover:bg-slate-50",
                      )}
                    >
                      <CompanyLogo
                        initials={companyInitials(prep.job.company)}
                        color={companyColor(prep.job.company)}
                        size="sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {prep.job.title}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {prep.job.company}
                        </p>
                      </div>
                      {prep.status !== "DONE" && (
                        <Badge variant={STATUS_VARIANT[prep.status]}>
                          {STATUS_LABEL[prep.status]}
                        </Badge>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

            <Pagination
              offset={offset}
              limit={PAGE_SIZE}
              total={total}
              noun="vị trí"
              onOffsetChange={setOffset}
            />
          </Card>

          <div className="min-w-0">
            {selected && (
              <>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold text-slate-900">
                    {selected.job.title}
                  </h2>
                  <Badge variant={STATUS_VARIANT[selected.status]}>
                    {STATUS_LABEL[selected.status]}
                  </Badge>
                  {selected.generatedAt && (
                    <span className="text-xs text-slate-400">
                      soạn {relativeDay(selected.generatedAt)}
                    </span>
                  )}
                  {/*
                    Lối vào buổi luyện đặt Ở ĐÂY chứ không phải trên thanh bên:
                    một buổi luyện luôn gắn với MỘT vị trí, và đây là chỗ duy
                    nhất trên màn hình mà người dùng đã chọn xong vị trí đó.
                  */}
                  <Link
                    href={`/dashboard/interview/${selected.job.id}/mock`}
                    className="ml-auto"
                  >
                    <Button variant="outline" size="sm">
                      <Microphone className="size-4" />
                      Phỏng vấn thử
                    </Button>
                  </Link>
                </div>
                <PrepDetail prep={selected} retrying={retrying} onRetry={retry} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
