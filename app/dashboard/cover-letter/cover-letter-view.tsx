"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { matchesService } from "@/services";
import { useApiQuery } from "@/hooks/use-api-query";
import { keys } from "@/lib/query-keys";
import { PageHeader } from "@/components/dashboard/page-header";
import { PageError } from "@/components/ui/alert";
import { Skeleton, SkeletonPage } from "@/components/ui/skeleton";
import { Tabs } from "@/components/ui/tabs";
import { ApplicationEmailPanel } from "./application-email-panel";
import { CoverLetterPanel } from "./cover-letter-panel";

const LOGIN_NEXT = "/dashboard/cover-letter";

const MATCH_LIMIT = 50;

type Kind = "email" | "letter";

/**
 * Hai thể loại, không phải hai cách trình bày của một thứ.
 *
 * Mail ứng tuyển là thứ người dùng gửi đi hằng ngày: dán JD, sao chép, gửi.
 * Thư xin việc là tài liệu trang trọng để đính kèm dạng PDF khi nhà tuyển dụng
 * yêu cầu. Gộp vào một màn thì mỗi lần dùng lại phải bỏ đi một nửa số nút.
 */
const KINDS = [
  { value: "email", label: "Mail ứng tuyển" },
  { value: "letter", label: "Thư xin việc (PDF)" },
];

export function CoverLetterView() {
  const fixedJobId = useSearchParams().get("jobId");

  // Vào từ nút "Viết thư xin việc cho tin này" ở trang chi tiết thì mở đúng tab
  // đó; vào từ menu bên trái thì mở tab dùng nhiều hơn.
  const [kind, setKind] = useState<Kind>(fixedJobId ? "letter" : "email");

  // Cùng khoá với màn "CV đã tạo": hai màn hỏi y hệt một danh sách, nên màn nào
  // mở sau lấy từ cache thay vì gọi lại.
  const page = useApiQuery(
    keys.matchList(MATCH_LIMIT),
    () => matchesService.list({ limit: MATCH_LIMIT }),
    { errorMessage: "Không tải được danh sách công việc" },
  );

  if (page.error)
    return <PageError title="Không tải được dữ liệu" message={page.error} />;

  const matches = page.data?.items ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={fixedJobId ? "Viết cho tin này" : "Thư đã viết"}
        subtitle={
          fixedJobId
            ? "AI viết dựa trên hồ sơ của bạn và đúng tin tuyển dụng bên dưới"
            : "Mail ứng tuyển gửi thẳng cho nhà tuyển dụng, hoặc thư xin việc trang trọng để đính kèm"
        }
      />

      <Tabs
        tabs={KINDS}
        value={kind}
        onChange={(value) => setKind(value as Kind)}
      />

      {!matches ? (
        <SkeletonPage>
          <Skeleton className="h-72" />
          <Skeleton className="h-56" />
        </SkeletonPage>
      ) : kind === "email" ? (
        <ApplicationEmailPanel
          matches={matches}
          fixedJobId={fixedJobId}
          loginNext={LOGIN_NEXT}
        />
      ) : (
        <CoverLetterPanel
          matches={matches}
          fixedJobId={fixedJobId}
          loginNext={LOGIN_NEXT}
        />
      )}
    </div>
  );
}
