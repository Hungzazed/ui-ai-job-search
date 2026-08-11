"use client";

import { useState, type HTMLAttributes } from "react";
import { cn } from "@/utils";

interface CompanyLogoProps extends HTMLAttributes<HTMLDivElement> {
  initials: string;
  color: string;
  /** Ảnh logo thật. Chỉ topcv và vietnamworks có; hai portal kia trả null. */
  src?: string | null;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "size-11 text-sm",
  md: "size-13 text-base",
  lg: "size-16 text-lg",
};

/// Ảnh logo được vẽ NHỎ HƠN ô chứa một chút.
///
/// `object-contain` giữ đúng tỉ lệ, nên logo dạng chữ nằm ngang chỉ chiếm một
/// dải mỏng giữa ô vuông và trông bé hơn hẳn ô chữ cái đầu bên cạnh. Chừa một
/// khoảng đệm nhỏ để ảnh không dính sát viền, rồi cho ảnh chiếm hết phần còn
/// lại.
const IMAGE_PADDING = "p-1";

/**
 * Logo công ty: ưu tiên ảnh thật, lùi về ô chữ cái đầu.
 *
 * Ô chữ cái đầu KHÔNG phải giải pháp tạm mà là đường chạy bình thường - hai
 * trong bốn portal không đưa logo ra trang danh sách, nên `src` rỗng là chuyện
 * thường chứ không phải lỗi dữ liệu.
 *
 * Cũng lùi về chữ cái đầu khi ảnh tải hỏng: URL logo trỏ sang CDN của portal,
 * mà những ảnh đó bị gỡ hoặc đổi đường dẫn theo thời gian. Không bắt lỗi thì
 * chỗ đó thành một ô vỡ ảnh.
 */
export function CompanyLogo({
  initials,
  color,
  src,
  size = "md",
  className,
  ...props
}: CompanyLogoProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-xl font-bold text-white",
        // Nền màu chỉ dùng khi hiện chữ; ảnh logo phần lớn nền trắng nên phủ
        // màu ra sau sẽ thành viền màu lạ quanh ảnh.
        src && !failed
          ? `border border-slate-200 bg-white ${IMAGE_PADDING}`
          : color,
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {src && !failed ? (
        // Dùng <img> thường chứ không phải next/image: đây là ảnh từ CDN của
        // bên thứ ba, và next/image đòi khai trước từng hostname trong
        // next.config. Danh sách portal thì thêm bớt được lúc chạy, nên khai
        // cứng hostname sẽ khiến portal mới thêm bị vỡ ảnh.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-contain"
        />
      ) : (
        initials
      )}
    </div>
  );
}
