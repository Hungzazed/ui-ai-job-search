"use client";

import { MapPinArea } from "@phosphor-icons/react/ssr";
import { TextField } from "@/components/ui/field";
import { SectionCard } from "@/components/ui/section-card";
import type { ProfileSectionProps } from "../profile-draft";

export function ConditionsSection({ draft, update }: ProfileSectionProps) {
  return (
    <SectionCard
      icon={MapPinArea}
      title="Điều kiện làm việc"
      description="Dùng cho chiều Địa điểm — chiều này cho kết quả đạt hoặc không đạt, không có điểm trung gian"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="p-remotePreference"
          label="Ưu tiên làm việc từ xa"
          placeholder="Từ xa hoàn toàn / Kết hợp / Tại văn phòng"
          value={draft.remotePreference}
          onChange={(value) => update("remotePreference", value)}
        />
        <TextField
          id="p-commuteConstraint"
          label="Ràng buộc đi lại"
          placeholder="Tối đa 45 phút từ Quận 7"
          value={draft.commuteConstraint}
          onChange={(value) => update("commuteConstraint", value)}
        />
      </div>
      <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-3.5 text-sm text-slate-700">
        <input
          type="checkbox"
          className="accent-primary-600 size-4 cursor-pointer"
          checked={draft.willingToRelocate}
          onChange={(event) =>
            update("willingToRelocate", event.target.checked)
          }
        />
        Sẵn sàng chuyển nơi ở vì công việc
      </label>
    </SectionCard>
  );
}
