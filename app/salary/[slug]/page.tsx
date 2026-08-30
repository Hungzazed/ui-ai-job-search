import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/button";
import {
  SalaryDetail,
  loadSalaryPosition,
} from "@/components/salary/salary-detail";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const data = await loadSalaryPosition((await params).slug);
  if (!data) return { title: "Không có dữ liệu lương" };

  return {
    title: `Mức lương ${data.positionName}`,
    description: `Khoảng lương phổ biến và mức trung bình của vị trí ${data.positionName}, phân tách theo số năm kinh nghiệm.`,
  };
}

export default async function SalaryPositionPage({ params }: Params) {
  const { slug } = await params;
  const data = await loadSalaryPosition(slug);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-slate-900">
            Mức lương {data?.positionName ?? ""}
          </h1>
          {data?.occupationName ? (
            <p className="mt-1 text-sm text-slate-500">{data.occupationName}</p>
          ) : null}
        </div>

        <Link href="/salary">
          <Button variant="outline" size="sm">
            <ArrowLeft className="size-4" />
            Tra cứu lương
          </Button>
        </Link>
      </div>

      <SalaryDetail slug={slug} basePath="/salary" />
    </main>
  );
}
