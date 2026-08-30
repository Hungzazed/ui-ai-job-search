/**
 * Quy một mức lương về phần trăm trên một thang cho trước.
 *
 * Mọi thanh dải trong tính năng tra cứu lương đi qua đúng hàm này, vì thứ làm
 * bảng lương đọc được là CÙNG MỘT THANG: hai thanh vẽ trên hai thang khác nhau
 * thì dài ngắn không so được với nhau, mà mắt vẫn cứ so.
 */
export function scalePercent(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}

/** `left` và `width` của một dải [from, to] trên thang [min, max]. */
export function scaleBand(
  from: number,
  to: number,
  min: number,
  max: number,
): { left: string; width: string } {
  const start = scalePercent(from, min, max);
  const end = scalePercent(to, min, max);
  return {
    left: `${start}%`,
    width: `${Math.max(end - start, 0.8)}%`,
  };
}
