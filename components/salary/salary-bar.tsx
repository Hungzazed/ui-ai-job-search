import { scaleBand, scalePercent } from "./salary-scale";

interface SalaryBarProps {
  from: number | null;
  to: number | null;
  /** Vạch đánh dấu mức trung bình. Bỏ qua khi không có. */
  marker?: number | null;
  scale: [number, number];
  /** Cao hơn một chút cho bảng mốc kinh nghiệm ở trang chi tiết. */
  size?: "sm" | "md";
}

/**
 * Một dải lương vẽ trên thang cho trước.
 *
 * Tách thành component riêng vì trang danh sách và trang chi tiết vẽ CÙNG một
 * thứ: gộp lại thì đổi cách thể hiện chỉ phải sửa một chỗ, và hai trang không
 * thể lệch nhau.
 */
export function SalaryBar({ from, to, marker, scale, size = "sm" }: SalaryBarProps) {
  if (from === null || to === null) return null;

  const track = size === "md" ? "h-6" : "h-5";

  return (
    <div className={`relative ${track} min-w-32 rounded bg-slate-100`}>
      <div
        className="bg-primary-300 absolute inset-y-1 rounded-sm"
        style={scaleBand(from, to, scale[0], scale[1])}
      />
      {marker !== null && marker !== undefined && (
        <div
          className="bg-primary-800 absolute inset-y-0.5 w-0.5"
          style={{ left: `${scalePercent(marker, scale[0], scale[1])}%` }}
        />
      )}
    </div>
  );
}
