"use client";

import { useMemo, useState } from "react";
import { Check, MagnifyingGlass, X } from "@phosphor-icons/react/ssr";
import type { OccupationOption } from "@/services";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

interface OccupationPickerProps {
  open: boolean;
  groups: OccupationOption[];
  selectedGroups: string[];
  selectedSubs: string[];
  onApply: (next: { groups: string[]; subs: string[] }) => void;
  onClose: () => void;
}

const fold = (value: string) =>
  value
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

export function OccupationPicker({
  open,
  groups,
  selectedGroups,
  selectedSubs,
  onApply,
  onClose,
}: OccupationPickerProps) {
  const [needle, setNeedle] = useState("");
  const [activeGroup, setActiveGroup] = useState(groups[0]?.code ?? "");
  const [draftGroups, setDraftGroups] = useState(selectedGroups);
  const [draftSubs, setDraftSubs] = useState(selectedSubs);

  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (open) {
      setDraftGroups(selectedGroups);
      setDraftSubs(selectedSubs);
      setNeedle("");
    }
  }

  const matching = useMemo(() => {
    const term = fold(needle.trim());
    if (!term) return null;
    return groups
      .map((group) => ({
        ...group,
        subs: (group.subs ?? []).filter((sub) => fold(sub.name).includes(term)),
      }))
      .filter(
        (group) => group.subs.length > 0 || fold(group.name).includes(term),
      );
  }, [groups, needle]);

  const visibleGroups = matching ?? groups;
  const current =
    visibleGroups.find((group) => group.code === activeGroup) ??
    visibleGroups[0];

  const toggleGroup = (code: string) => {
    const group = groups.find((row) => row.code === code);
    const subs = group?.subs?.map((row) => row.code) ?? [];

    if (draftGroups.includes(code)) {
      setDraftGroups(draftGroups.filter((row) => row !== code));
      setDraftSubs(draftSubs.filter((row) => !subs.includes(row)));
      return;
    }
    setDraftGroups([...draftGroups, code]);
    setDraftSubs([...new Set([...draftSubs, ...subs])]);
  };

  const toggleSub = (code: string) => {
    setDraftSubs(
      draftSubs.includes(code)
        ? draftSubs.filter((row) => row !== code)
        : [...draftSubs, code],
    );
  };

  const total = draftGroups.length + draftSubs.length;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slab/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative flex h-[min(36rem,90vh)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            Chọn ngành nghề
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100"
          >
            <X className="size-4.5" />
          </button>
        </div>

        <div className="border-b border-slate-100 px-5 py-3">
          <div className="relative">
            <MagnifyingGlass className="pointer-events-none absolute top-1/2 left-3 size-4.5 -translate-y-1/2 text-slate-400" />
            <input
              value={needle}
              onChange={(event) => setNeedle(event.target.value)}
              placeholder="Tìm ngành nghề…"
              className="focus:border-primary-400 focus:ring-primary-100 h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 text-sm outline-none focus:bg-white focus:ring-2"
            />
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="scrollbar-thin overflow-y-auto border-r border-slate-100 py-2">
            <p className="px-5 pb-1 text-2xs font-semibold tracking-wide text-slate-400 uppercase">
              Nhóm ngành
            </p>
            {visibleGroups.map((group) => (
              <button
                key={group.code}
                type="button"
                onMouseEnter={() => setActiveGroup(group.code)}
                onClick={() => setActiveGroup(group.code)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2.5 px-5 py-2 text-left text-sm transition-colors",
                  current?.code === group.code
                    ? "bg-primary-50 text-primary-800"
                    : "text-slate-700 hover:bg-slate-50",
                )}
              >
                <span
                  role="checkbox"
                  aria-checked={draftGroups.includes(group.code)}
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleGroup(group.code);
                  }}
                  onKeyDown={(event) => {
                    if (event.key !== "Enter" && event.key !== " ") return;
                    event.preventDefault();
                    event.stopPropagation();
                    toggleGroup(group.code);
                  }}
                  className={cn(
                    "flex size-4 shrink-0 items-center justify-center rounded border",
                    draftGroups.includes(group.code)
                      ? "border-primary-600 bg-primary-600 text-white"
                      : "border-slate-300",
                  )}
                >
                  {draftGroups.includes(group.code) && (
                    <Check className="size-3.5" />
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate">{group.name}</span>
                <span className="text-xs text-slate-400">{group.count}</span>
              </button>
            ))}
          </div>

          <div className="scrollbar-thin overflow-y-auto py-2">
            <p className="px-5 pb-1 text-2xs font-semibold tracking-wide text-slate-400 uppercase">
              Nghề
            </p>
            {current?.subs?.length ? (
              current.subs.map((sub) => (
                <button
                  key={sub.code}
                  type="button"
                  onClick={() => toggleSub(sub.code)}
                  aria-pressed={draftSubs.includes(sub.code)}
                  className="flex w-full cursor-pointer items-center gap-2.5 px-5 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded border",
                      draftSubs.includes(sub.code)
                        ? "border-primary-600 bg-primary-600 text-white"
                        : "border-slate-300",
                    )}
                  >
                    {draftSubs.includes(sub.code) && (
                      <Check className="size-3.5" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{sub.name}</span>
                  <span className="text-xs text-slate-400">{sub.count}</span>
                </button>
              ))
            ) : (
              <p className="px-5 py-3 text-sm text-slate-400">
                Nhóm này chưa tách nghề chi tiết. Tích cả nhóm ở cột bên trái.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDraftGroups([]);
              setDraftSubs([]);
            }}
          >
            Bỏ chọn tất cả
            {total > 0 && (
              <span className="bg-primary-100 text-primary-700 ml-1.5 rounded-full px-1.5 text-xs font-semibold">
                {total}
              </span>
            )}
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onApply({ groups: draftGroups, subs: draftSubs })}
          >
            <Check className="size-4.5" />
            Áp dụng
          </Button>
        </div>
      </div>
    </div>
  );
}
