/**
 * Địa điểm tin tuyển dụng, ở dạng đọc được trong một ô bảng.
 *
 * Dữ liệu vào là địa chỉ THÔ do portal trả về, và nó dài hơn nhiều so với hình
 * dung ban đầu — đo trên 48 tin đã quét thì dài nhất là 153 ký tự:
 *
 *   "Tháp B, Khu thương mại dịch vụ kết hợp nhà ở cao tầng tại lô đất 1-13 …"
 *   "Century Tower, Phố Minh Khai, Khu đô thị Times City, Vĩnh Tuy, Hai Bà
 *    Trưng, Hà Nội, GIA BINH AIRPORT, Gia Binh, Bắc Ninh"
 *
 * In nguyên như vậy vào bảng thì cột địa điểm ngốn 4 dòng và đè bẹp cả tên vị
 * trí — chính là thứ người dùng cần đọc trước.
 *
 * CỐ Ý KHÔNG tự suy ra tên tỉnh/thành. Cách hay được nghĩ tới là lấy đoạn cuối
 * sau dấu phẩy, nhưng ví dụ thứ hai ở trên là hai địa điểm bị portal nối vào
 * nhau: đoạn cuối cho ra "Bắc Ninh" và làm mất "Hà Nội", tức là hiện SAI địa
 * điểm chứ không phải hiện ngắn hơn. Hiện sai một thành phố còn tệ hơn hiện dài.
 *
 * Nên ở đây chỉ cắt bớt, và luôn giữ đủ nguyên văn trong `title` để người dùng
 * trỏ chuột là thấy hết.
 */

/** Không có địa điểm là chuyện thường: nhiều tin không ghi. */
export const LOCATION_UNKNOWN = "Không rõ";

/**
 * ĐO ĐƯỢC, không chọn theo cảm giác. Ở mức 48 ký tự, cột địa điểm của bảng Lịch
 * sử ứng tuyển đẩy ô `<select>` đổi trạng thái ra tới 1543px trong một khung
 * 1440px — control duy nhất của màn hình đó nằm ngoài vùng thấy được. Mức 28 ký
 * tự đưa nó về trong khung, và `test/visual/screens.spec.ts` giữ lại phép đo đó
 * để lần sau nới ra là đỏ ngay.
 */
const MAX_CHARS = 28;

export interface DisplayLocation {
  /** Chuỗi để hiện. */
  text: string;
  /** Nguyên văn cho `title`, hoặc undefined khi không bị cắt gì. */
  full?: string;
}

export function displayLocation(location?: string | null): DisplayLocation {
  const trimmed = location?.trim();
  if (!trimmed) return { text: LOCATION_UNKNOWN };
  if (trimmed.length <= MAX_CHARS) return { text: trimmed };

  // Cắt ở ranh giới từ để không đứt giữa một chữ. Nếu không tìm được khoảng
  // trắng nào ở gần cuối (một chuỗi dài liền mạch) thì cắt thẳng.
  const cut = trimmed.slice(0, MAX_CHARS);
  const lastSpace = cut.lastIndexOf(" ");
  const head = lastSpace > MAX_CHARS - 16 ? cut.slice(0, lastSpace) : cut;

  return { text: `${head.replace(/[,;\s]+$/, "")}…`, full: trimmed };
}
