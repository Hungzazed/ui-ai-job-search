import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import {
  SalaryDetail,
  loadSalaryPosition,
} from "@/components/salary/salary-detail";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const data = await loadSalaryPosition((await params).slug);
  return { title: data ? `Mức lương ${data.positionName}` : "Tra cứu lương" };
}

export default async function DashboardSalaryPositionPage({ params }: Params) {
  const { slug } = await params;
  const data = await loadSalaryPosition(slug);

  return (
    <>
      <PageHeader
        title={`Mức lương ${data?.positionName ?? ""}`}
        subtitle={data?.occupationName ?? undefined}
        actions={
          <Link href="/dashboard/salary">
            <Button variant="outline" size="sm">
              <ArrowLeft className="size-4" />
              Tra cứu lương
            </Button>
          </Link>
        }
      />
      <SalaryDetail slug={slug} basePath="/dashboard/salary" />
    </>
  );
}
