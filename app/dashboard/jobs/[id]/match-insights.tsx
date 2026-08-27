import { CheckCircle, Warning } from "@phosphor-icons/react/ssr";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/utils";

const TONES = {
  positive: {
    icon: CheckCircle,
    iconClassName: "text-emerald-500",
    item: "bg-emerald-50/60",
  },
  caution: {
    icon: Warning,
    iconClassName: "text-amber-500",
    item: "bg-amber-50/60",
  },
} as const;

interface InsightListProps {
  tone: keyof typeof TONES;
  title: string;
  description: string;
  items: string[];
}

/**
 * "Điểm mạnh" và "Khoảng cách" là cùng một khối, khác mỗi màu và biểu tượng.
 *
 * Viết hai lần thì lần sửa sau sẽ chỉ chạm được một bên, và hai danh sách nằm
 * cạnh nhau trên cùng màn hình sẽ lệch nhau thấy rõ.
 */
export function InsightList({
  tone,
  title,
  description,
  items,
}: InsightListProps) {
  const style = TONES[tone];
  const Icon = style.icon;

  return (
    <SectionCard
      icon={Icon}
      iconClassName={style.iconClassName}
      title={title}
      description={description}
    >
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className={cn(
              "flex items-start gap-3 rounded-xl p-3 text-sm text-slate-700",
              style.item,
            )}
          >
            <Icon
              className={cn("mt-0.5 size-5 shrink-0", style.iconClassName)}
            />
            {item}
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
