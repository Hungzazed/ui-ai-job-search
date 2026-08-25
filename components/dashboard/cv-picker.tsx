"use client";

import { useState } from "react";
import { FileText, Sparkles, Upload } from "lucide-react";
import { cn } from "@/utils";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export interface CvOption {
  id: string;
  label: string;
  type: "uploaded" | "generated";
  filename?: string;
}

interface CvPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (option: CvOption) => void;
  uploadedCv: CvOption | null;
  loading?: boolean;
}

export function CvPicker({
  open,
  onClose,
  onSelect,
  uploadedCv,
  loading,
}: CvPickerProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!selected) return;
    if (selected === "generate") {
      onSelect({ id: "generate", label: "Tạo CV theo vị trí", type: "generated" });
    } else if (uploadedCv) {
      onSelect(uploadedCv);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Chọn CV để nộp">
      <div className="space-y-3">
        {uploadedCv && (
          <label
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
              selected === uploadedCv.id
                ? "border-primary-500 bg-primary-50"
                : "border-slate-200 hover:border-slate-300",
            )}
          >
            <input
              type="radio"
              name="cv-option"
              value={uploadedCv.id}
              checked={selected === uploadedCv.id}
              onChange={() => setSelected(uploadedCv.id)}
              className="sr-only"
            />
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-lg",
                selected === uploadedCv.id
                  ? "bg-primary-100 text-primary-600"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              <Upload className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">CV đã upload</p>
              <p className="truncate text-xs text-slate-500">
                {uploadedCv.filename || "CV của bạn"}
              </p>
            </div>
          </label>
        )}

        <label
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors",
            selected === "generate"
              ? "border-primary-500 bg-primary-50"
              : "border-slate-200 hover:border-slate-300",
          )}
        >
          <input
            type="radio"
            name="cv-option"
            value="generate"
            checked={selected === "generate"}
            onChange={() => setSelected("generate")}
            className="sr-only"
          />
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg",
              selected === "generate"
                ? "bg-primary-100 text-primary-600"
                : "bg-slate-100 text-slate-500",
            )}
          >
            <Sparkles className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-900">
              Tạo CV theo vị trí
            </p>
            <p className="text-xs text-slate-500">
              AI tối ưu CV phù hợp với tin tuyển dụng
            </p>
          </div>
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button onClick={handleConfirm} disabled={!selected || loading}>
            {loading ? "Đang tạo…" : "Xác nhận"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
