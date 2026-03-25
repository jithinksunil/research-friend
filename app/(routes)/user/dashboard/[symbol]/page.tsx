import StockChart from '@/components/common/StockChart';
import { TableWithoutPagination } from '@/components/common/TableWithoutPagination';
import { cn, formatValue } from '@/lib';
import { Fragment } from 'react/jsx-runtime';
import { ViewDetailedReport } from '@/components/dashbord/ViewDetailedReport';
import { VoteButton } from './VoteButton';
import { Suspense } from 'react';
import { headers } from 'next/headers';
import type { StockDashboardData } from '@/interfaces';

interface PageProps {
  params: Promise<{
    symbol: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { symbol } = await params;

  const normalizedSymbol = symbol.trim().toUpperCase();
  const headerStore = await headers();
  const host = headerStore.get('x-forwarded-host') ?? headerStore.get('host');
  const protocol = headerStore.get('x-forwarded-proto') ?? 'http';

  if (!host) {
    throw new Error('Unable to resolve request host');
  }

  const response = await fetch(
    `${protocol}://${host}/api/dashboard/${encodeURIComponent(normalizedSymbol)}`,
    {
      next: { revalidate: 300, tags: [`dashboard-${normalizedSymbol}`] },
    },
  );

  const responseJson = (await response.json()) as
    | {
        data: StockDashboardData;
      }
    | {
        message: string;
      };

  if (!response.ok || !('data' in responseJson)) {
    throw new Error('message' in responseJson ? responseJson.message : 'Failed to load dashboard');
  }

  const dashboard = responseJson.data;
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
