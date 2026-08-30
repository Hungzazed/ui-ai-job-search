import Link from "next/link";
import { notFound } from "next/navigation";
import {
  salaryService,
  type SalaryBand,
  type SalaryPositionDetail,
} from "@/services/salary";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { SectionCard } from "@/components/ui/section-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMonthlyVnd } from "@/utils";
import { SalaryBar } from "./salary-bar";

export async function loadSalaryPosition(
  slug: string,
): Promise<SalaryPositionDetail | null> {
  try {
    return await salaryService.position(slug);
  } catch {
    return null;
  }
}

/**
 * Thang dùng chung cho MỌI thanh dải trên trang.
 *
 * Ưu tiên khoảng phổ biến của vị trí; thiếu thì suy từ các mốc kinh nghiệm. Không
 * suy được thì trả `null` và trang bỏ hẳn phần thanh dải thay vì vẽ một thang bịa.
 */
function resolveScale(data: SalaryPositionDetail): [number, number] | null {
  const amounts = [
    data.rangeMin,
    data.rangeMax,
    ...data.bands.flatMap((b) => [b.minAmount, b.maxAmount, b.avgAmount]),
  ].filter((v): v is number => v !== null);

  if (amounts.length === 0) return null;

  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  return max > min ? [min, max] : null;
}

const shortVnd = (value: number) => formatMonthlyVnd(value).replace(" triệu", "");

export async function SalaryDetail({
  slug,
  basePath,
}: {
  slug: string;
  basePath: string;
}) {
  const data = await loadSalaryPosition(slug);
  if (!data) notFound();

  const scale = resolveScale(data);

  return (
    <div className="flex flex-col gap-4">
      <Headline data={data} scale={scale} />
      <Experience bands={data.bands} scale={scale} />
      <Peers data={data} basePath={basePath} />
      <SourceNote data={data} />
    </div>
  );
}

function Headline({
  data,
  scale,
}: {
  data: SalaryPositionDetail;
  scale: [number, number] | null;
}) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
          <div>
            <p className="text-xs text-slate-500">Lương trung bình</p>
            <p className="mt-0.5 flex items-baseline gap-1.5">
              <span className="font-mono text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                {data.avgMonthly === null ? "—" : shortVnd(data.avgMonthly)}
              </span>
              <span className="text-sm text-slate-500">triệu/tháng</span>
            </p>
          </div>

          <div className="hidden h-10 w-px self-end bg-slate-200 sm:block" />

          <div>
            <p className="text-xs text-slate-500">Khoảng phổ biến</p>
            <p className="mt-0.5 font-mono text-lg font-semibold tracking-tight text-slate-800 sm:text-xl">
              {data.rangeMin === null || data.rangeMax === null
                ? "Chưa đủ dữ liệu"
                : `${shortVnd(data.rangeMin)} – ${formatMonthlyVnd(data.rangeMax)}`}
            </p>
          </div>
        </div>

        {scale ? (
          <div className="mt-5">
            <SalaryBar
              from={data.rangeMin}
              to={data.rangeMax}
              marker={data.avgMonthly}
              scale={scale}
              size="md"
            />
            <div className="mt-2 flex justify-between text-[11px] text-slate-500">
              <span className="font-mono">{formatMonthlyVnd(scale[0])}</span>
              {data.avgMonthly !== null && (
                <span className="font-medium text-slate-900">
                  trung bình {formatMonthlyVnd(data.avgMonthly)}
                </span>
              )}
              <span className="font-mono">{formatMonthlyVnd(scale[1])}</span>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

/**
 * Bốn mốc kinh nghiệm vẽ trên CÙNG một thang với khối trên.
 *
 * Đây là điểm khác biệt so với bảng số cũ: đặt chung thang thì bậc thang lương
 * hiện ra thành hình, không phải đọc từng ô rồi tự so trong đầu.
 */
function Experience({
  bands,
  scale,
}: {
  bands: SalaryBand[];
  scale: [number, number] | null;
}) {
  return (
    <SectionCard
      title="Theo số năm kinh nghiệm"
      actions={
        scale ? (
          <span className="font-mono text-xs text-slate-500">
            cùng thang {formatMonthlyVnd(scale[0])} – {formatMonthlyVnd(scale[1])}
          </span>
        ) : undefined
      }
      contentClassName="p-0 pb-4"
    >
      {bands.length === 0 ? (
        <p className="px-5 text-sm text-slate-500">
          Chưa đủ dữ liệu để tách theo kinh nghiệm cho vị trí này.
        </p>
      ) : (
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-32">Kinh nghiệm</TableHead>
              <TableHead className="hidden sm:table-cell">Dải lương</TableHead>
              <TableHead className="w-32 pr-6 text-right">Khoảng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bands.map((band) => (
              <TableRow key={band.experienceLabel}>
                <TableCell className="whitespace-nowrap">
                  {band.experienceLabel}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {scale ? (
                    <SalaryBar
                      from={band.minAmount}
                      to={band.maxAmount}
                      marker={band.avgAmount}
                      scale={scale}
                      size="md"
                    />
                  ) : null}
                </TableCell>
                <TableCell className="pr-6 text-right font-mono whitespace-nowrap">
                  {band.minAmount === null || band.maxAmount === null
                    ? "—"
                    : `${shortVnd(band.minAmount)} – ${shortVnd(band.maxAmount)}`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </SectionCard>
  );
}

/**
 * Xếp hạng cùng ngành — thứ cho một con số lẻ có chỗ đứng.
 *
 * `?? []` không thừa: `next: { revalidate }` còn phục vụ payload cũ thiếu trường
 * này một thời gian sau khi API đổi hình dạng, và một trang 500 vì cache cũ là
 * lỗi rất khó lần ra.
 */
function Peers({
  data,
  basePath,
}: {
  data: SalaryPositionDetail;
  basePath: string;
}) {
  const peers = data.peers ?? [];
  if (peers.length < 2) return null;

  const top = peers[0].avgMonthly ?? 0;

  return (
    <SectionCard
      title="So với vị trí khác cùng ngành"
      actions={
        data.occupationName ? (
          <span className="text-xs text-slate-500">{data.occupationName}</span>
        ) : undefined
      }
      contentClassName="p-0 pb-4"
    >
      <Table className="table-fixed">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-12">#</TableHead>
            <TableHead className="w-[42%] sm:w-[38%]">Vị trí</TableHead>
            <TableHead className="hidden whitespace-nowrap sm:table-cell">
              Mức tương đối
            </TableHead>
            <TableHead className="w-28 pr-6 text-right whitespace-nowrap">
              Trung bình
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {peers.map((peer) => (
            <TableRow
              key={peer.positionSlug}
              className={peer.isCurrent ? "bg-primary-50 hover:bg-primary-50" : undefined}
            >
              <TableCell className="font-mono text-xs text-slate-400">
                {peer.rank}
              </TableCell>

              <TableCell>
                {peer.isCurrent ? (
                  <span
                    title={peer.positionName}
                    className="text-primary-800 block truncate font-semibold"
                  >
                    {peer.positionName}
                  </span>
                ) : (
                  <Link
                    href={`${basePath}/${peer.positionSlug}`}
                    title={peer.positionName}
                    className="hover:text-primary-600 block truncate text-slate-700"
                  >
                    {peer.positionName}
                  </Link>
                )}
              </TableCell>

              <TableCell className="hidden sm:table-cell">
                <div className="h-2 min-w-32 rounded-full bg-slate-100">
                  <div
                    className={
                      peer.isCurrent
                        ? "bg-accent h-full rounded-full"
                        : "bg-primary-200 h-full rounded-full"
                    }
                    style={{
                      width: `${top > 0 ? ((peer.avgMonthly ?? 0) / top) * 100 : 0}%`,
                    }}
                  />
                </div>
              </TableCell>

              <TableCell
                className={
                  peer.isCurrent
                    ? "text-primary-800 pr-6 text-right font-mono font-semibold whitespace-nowrap"
                    : "pr-6 text-right font-mono whitespace-nowrap text-slate-600"
                }
              >
                {peer.avgMonthly === null ? "—" : shortVnd(peer.avgMonthly)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </SectionCard>
  );
}

/**
 * Dải nguồn LUÔN hiện. Số đang là của bên thứ ba nên ghi nguồn là bắt buộc, và
 * khi đổi sang thống kê từ kho tin của hệ thống thì chính khối này đổi chữ.
 */
function SourceNote({ data }: { data: SalaryPositionDetail }) {
  const updated = new Date(data.updatedAt).toLocaleDateString("vi-VN");

  return (
    <Alert tone="info">
      {data.sampleSize === null ? (
        <>
          Nguồn:{" "}
          <a
            href={data.providerUrl}
            target="_blank"
            rel="noopener"
            className="underline"
          >
            {data.provider}
          </a>{" "}
          · cập nhật {updated}.{" "}
        </>
      ) : (
        <>
          Tổng hợp từ {data.sampleSize} tin tuyển dụng · cập nhật {updated}.{" "}
        </>
      )}
      Số liệu chỉ mang tính tham khảo; thu nhập thực tế phụ thuộc năng lực cá nhân
      và chính sách của từng doanh nghiệp.
    </Alert>
  );
}
