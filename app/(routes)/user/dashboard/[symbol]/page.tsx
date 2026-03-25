import StockChart from '@/components/common/StockChart';
import { TableWithoutPagination } from '@/components/common/TableWithoutPagination';
import { cn, formatValue } from '@/lib';
import { Fragment } from 'react/jsx-runtime';
import { ViewDetailedReport } from '@/components/dashbord/ViewDetailedReport';
import { VoteButton } from './VoteButton';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import type { StockDashboardData } from '@/interfaces';
import Link from 'next/link';

interface PageProps {
  params: Promise<{
    symbol: string;
  }>;
}

type DashboardApiResponse =
  | {
      data: StockDashboardData;
    }
  | {
      message: string;
    };

export default async function Page({ params }: PageProps) {
  const { symbol } = await params;

  const normalizedSymbol = symbol.trim().toUpperCase();
  let dashboard: StockDashboardData | null = null;
  let errorMessage: string | null = null;

  try {
    const headerStore = await headers();
    const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host');
    const protocol = headerStore.get('x-forwarded-proto') ?? 'http';
    const fallbackHost = process.env.VERCEL_URL ?? 'localhost:3000';
    const baseUrl = `${protocol}://${host ?? fallbackHost}`;

    const response = await fetch(
      `${baseUrl}/api/dashboard/${encodeURIComponent(normalizedSymbol)}`,
      {
        next: { revalidate: 300, tags: [`dashboard-${normalizedSymbol}`] },
      },
    );

    const responseJson = (await response.json().catch(() => null)) as DashboardApiResponse | null;

    if (!response.ok || !responseJson || !('data' in responseJson)) {
      errorMessage =
        responseJson && 'message' in responseJson
          ? responseJson.message
          : 'Unable to load dashboard right now.';
    } else {
      dashboard = responseJson.data;
    }
  } catch {
    errorMessage = 'Unable to load dashboard right now.';
  }

  if (!dashboard) {
    return (
      <div className="py-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <h2 className="text-lg font-semibold text-red-700">Dashboard Unavailable</h2>
          <p className="mt-2 text-sm text-red-700">
            {errorMessage ?? 'Unable to load dashboard right now.'}
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              href={`/user/dashboard/${normalizedSymbol}`}
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white"
            >
              Retry
            </Link>
            <Link
              href="/user/search"
              className="rounded-md border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-700"
            >
              Back To Search
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const company = dashboard.keyMetrics;

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-muted-foreground">
          <span className="font-bold">{normalizedSymbol}</span> {dashboard?.quickMetrics?.name}
        </div>
        <ViewDetailedReport symbol={normalizedSymbol} />
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <VoteButton symbol={normalizedSymbol} />
      </Suspense>
      {dashboard.chartData ? <StockChart stock={dashboard.chartData} /> : null}
      <div className="grid grid-cols-4 gap-4 py-16">
        {dashboard?.quickMetrics?.keyMetrics
          .filter((item: any) => item.value)
          .map((item: any) => {
            return (
              <div
                key={item.label}
                className="bg-background p-4 rounded-2xl shadow-lg border border-gray-200"
              >
                <div className="text-sm font-medium text-muted-foreground">{item.label}</div>

                <div className="mt-1 text-lg font-bold">{item.value}</div>
              </div>
            );
          })}
      </div>
      <div className="py-6 bg-background rounded-2xl shadow-lg border border-gray-200">
        <TableWithoutPagination
          headings={[]}
          rows={company.fundamentals.map((metric, index) => [
            <div
              className="px-[20px] py-[10px] text-sm text-muted-foreground"
              key={`col1-${index}`}
            >
              {metric.label}
            </div>,

            <div
              key={`col2-${index}`}
              className={cn(
                'px-[20px] py-[10px] text-right font-medium',
                metric.format === 'percentage' &&
                  metric.value &&
                  metric.value > 0 &&
                  'text-emerald-400',
                metric.format === 'percentage' &&
                  metric.value &&
                  metric.value < 0 &&
                  'text-red-400',
              )}
            >
              {formatValue(metric.value, metric.format, metric.unit)}
            </div>,
          ])}
          noData="No fundamentals available"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 py-6">
        {dashboard.riskMetrics?.map((metric) => (
          <div
            key={metric.label}
            className="bg-background p-4 rounded-2xl shadow-lg border border-gray-200"
          >
            {/* Label */}
            <div className="text-sm font-medium text-muted-foreground">{metric.label}</div>

            {/* Value */}
            <div
              className={`
      mt-1 text-xl font-bold
      `}
            >
              {metric.value}
            </div>

            {/* Description */}
            <div className="mt-1 text-xs text-muted-foreground">{metric.description}</div>
          </div>
        ))}
      </div>
      <div className="bg-background p-4 rounded-2xl shadow-lg border border-gray-200  ">
        <h3 className="mb-2 text-lg font-semibold">About the Company</h3>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {dashboard.quickMetrics?.description}
        </p>
      </div>
      <div className="mt-6 bg-background p-4 rounded-2xl shadow-lg border border-gray-200 ">
        <h3 className="mb-4 text-lg font-semibold">Company Details</h3>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          {company.companyProfile.country ? (
            <Fragment>
              <div className="text-muted-foreground">Country</div>
              <div className="font-medium">{company.companyProfile.country}</div>
            </Fragment>
          ) : null}
          {company.companyProfile.sector ? (
            <Fragment>
              <div className="text-muted-foreground">Sector</div>
              <div className="font-medium">{company.companyProfile.sector}</div>
            </Fragment>
          ) : null}
          {company.companyProfile.industry ? (
            <Fragment>
              <div className="text-muted-foreground">Industry</div>
              <div className="font-medium">{company.companyProfile.industry}</div>
            </Fragment>
          ) : null}
        </div>
      </div>
    </div>
  );
}
