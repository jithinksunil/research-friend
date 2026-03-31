import StockChart from '@/components/common/StockChart';
import { TableWithoutPagination } from '@/components/common/TableWithoutPagination';
import { Metric, StockDashboardData } from '@/interfaces';
import { cn, formatValue } from '@/lib';
import { Fragment } from 'react/jsx-runtime';
import { ViewDetailedReport } from '@/components/dashbord/ViewDetailedReport';
import { VoteButton } from './VoteButton';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import Link from 'next/link';

interface SymbolPageProps {
  params: Promise<{
    symbol: string;
  }>;
}

export default async function Page({ params }: SymbolPageProps) {
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

    if (!response.ok) {
      const errorJson = await response
        .json()
        .catch(() => ({ message: 'Unable to load dashboard right now.' }));
      errorMessage = errorJson.message;
    } else {
      dashboard = (await response.json()) as StockDashboardData;
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
  const quickMetrics = dashboard.quickMetrics?.keyMetrics ?? [];
  const fundamentals = company?.fundamentals ?? [];
  const companyProfile = company?.companyProfile;
  const companyDetails = [
    { label: 'Country', value: companyProfile?.country ?? null },
    { label: 'Sector', value: companyProfile?.sector ?? null },
    { label: 'Industry', value: companyProfile?.industry ?? null },
    { label: 'Exchange', value: companyProfile?.exchange ?? null },
    {
      label: 'Employees',
      value:
        typeof companyProfile?.employees === 'number'
          ? new Intl.NumberFormat('en-US').format(companyProfile.employees)
          : null,
    },
    { label: 'Website', value: companyProfile?.website ?? null },
  ].filter((detail) => detail.value);

  return (
    <div className="py-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-muted-foreground">
          <span className="font-bold">{normalizedSymbol}</span>{' '}
          {dashboard.quickMetrics?.name ?? company?.header.name}
        </div>
        <ViewDetailedReport symbol={normalizedSymbol} />
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <VoteButton symbol={normalizedSymbol} />
      </Suspense>
      {dashboard.chartData ? <StockChart stock={dashboard.chartData} /> : null}
      <div className="grid grid-cols-1 gap-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {quickMetrics
          .filter((item: Metric) => item.value)
          .map((item: Metric) => {
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
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-background py-6 shadow-lg">
        <TableWithoutPagination
          headings={[]}
          rows={fundamentals.map((metric, index) => [
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
              {formatValue({
                value: metric.value,
                format: metric.format,
                unit: metric.unit,
              })}
            </div>,
          ])}
          noData="No fundamentals available"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 py-6 sm:grid-cols-2 xl:grid-cols-4">
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
      <div className="mt-6 rounded-2xl border border-gray-200 bg-background p-4 shadow-lg">
        <h3 className="mb-4 text-lg font-semibold">Company Details</h3>

        <div className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
          {companyDetails.length ? (
            companyDetails.map((detail) => (
              <Fragment key={detail.label}>
                <div className="text-muted-foreground">{detail.label}</div>
                <div className="font-medium break-all">{detail.value}</div>
              </Fragment>
            ))
          ) : (
            <div className="text-muted-foreground sm:col-span-2">No company details available.</div>
          )}
        </div>
      </div>
    </div>
  );
}
