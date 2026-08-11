import type { JobMatchWithJob } from "@/types";
import { toJobCard } from "@/lib/adapters";
import { APPLICATION_STATUS_LABELS } from "@/lib/application-status";
import { formatJobSalary } from "@/utils";
import { Card } from "@/components/ui/card";
import { RefusalNotice } from "./refusal-notice";
import type { Refusal } from "./refusal";

export function ConfirmStep({
  selected,
  refusal,
}: {
  selected: JobMatchWithJob;
  refusal: Refusal | null;
}) {
  const rows: Array<[string, string]> = [
    ["Vị trí", selected.job.title],
    ["Công ty", selected.job.company],
    ["Địa điểm", selected.job.location ?? "Không rõ"],
    ["Mức lương", formatJobSalary(toJobCard(selected))],
    [
      "Điểm phù hợp",
      selected.overallScore === null ? "—" : `${selected.overallScore}%`,
    ],
    ["Trạng thái đơn", APPLICATION_STATUS_LABELS.RANKED],
  ];

  return (
    <Card className="mx-auto max-w-2xl p-6">
      <h2 className="mb-4 text-lg font-bold text-slate-900">
        Xác nhận tạo đơn ứng tuyển
      </h2>

      <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between gap-4 px-4 py-3 text-sm"
          >
            <dt className="text-slate-500">{label}</dt>
            <dd className="text-right font-medium text-slate-800">{value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
        Đơn được tạo ở trạng thái “{APPLICATION_STATUS_LABELS.RANKED}”: hệ thống
        ghi nhận bạn đã quyết định nộp, còn việc gửi hồ sơ trên trang tuyển dụng
        vẫn do bạn tự làm. Khi nào nộp xong thì đổi trạng thái ở màn hình Lịch sử
        ứng tuyển.
      </p>

      <p className="mt-2 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
        Ngay sau khi tạo đơn, hệ thống xếp hàng đợi soạn CV theo vị trí này và
        thư xin việc. Việc đó chạy ở nền, mất khoảng 30–90 giây và có thể thất
        bại — xem kết quả ở mục CV Optimizer và Cover Letter.
      </p>

      {refusal && refusal.jobId === selected.jobId && (
        <div className="mt-4">
          <RefusalNotice refusal={refusal} />
        </div>
      )}
    </Card>
  );
}
