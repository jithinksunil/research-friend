import StockChart from '@/components/common/StockChart';
import stock from '@/stockdata.json';
import { TableWithoutPagination } from '@/components/common/TableWithoutPagination';
import { cn } from '@/lib';
import { Fragment } from 'react/jsx-runtime';
export function formatValue(value: number|null, format: string, unit?: string | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }

  switch (format) {
    case 'currencyCompact':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: unit || 'USD',
        notation: 'compact',
        maximumFractionDigits: 2,
      }).format(value);

    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: unit || 'USD',
        maximumFractionDigits: 2,
      }).format(value);

    case 'compact':
      return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 2,
      }).format(value);

    case 'percentage':
      return `${value.toFixed(2)}%`;

    default:
      return value.toFixed(2);
  }
}

export function formatMetricValue(
  value: number|null,
  format: string,
  unit?: string | null
) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }

  switch (format) {
    case 'percentage':
      return `${value.toFixed(2)}%`;

    default:
      return value.toFixed(2);
  }
}

async function page() {
  const company = {
    tickName: 'AAPL',
    companyName: 'Apple Inc.',
    businessDescription:
      'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions in North America and internationally. The company operates through segments including North America, International, and Amazon Web Services (AWS).',
    overview: [
      {
        label: 'Market Cap',
        value: 1834000000000,
        unit: 'USD',
        format: 'currencyCompact',
        id: 'marketCap',
      },
      {
        label: 'P/E Ratio',
        value: 54.23,
        unit: null,
        format: 'number',
        id: 'peRatio',
      },
      {
        label: '52 Week High',
        value: 188.65,
        unit: 'USD',
        format: 'currency',
        id: 'week52High',
      },
      {
        label: '52 Week Low',
        value: 118.35,
        unit: 'USD',
        format: 'currency',
        id: 'week52Low',
      },
      {
        label: 'Average Volume',
        value: 56234890,
        unit: 'shares',
        format: 'compact',
        id: 'avgVolume',
      },
      {
        label: 'Beta',
        value: 1.19,
        unit: null,
        format: 'number',
        id: 'beta',
      },
      {
        label: 'EPS (TTM)',
        value: 2.9,
        unit: 'USD',
        format: 'currency',
        id: 'epsTTM',
      },
      {
        label: 'YTD Return',
        value: 6.73,
        unit: '%',
        format: 'percentage',
        id: 'ytdReturn',
      },
    ],
    fundamentalsMetrics: [
      {
        id: 'revenueTTM',
        label: 'Revenue (TTM)',
        value: 574800000000,
        unit: 'USD',
        format: 'currencyCompact',
      },
      {
        id: 'revenueGrowth',
        label: 'Revenue Growth',
        value: 12.4,
        unit: '%',
        format: 'percentage',
      },
      {
        id: 'netIncomeTTM',
        label: 'Net Income (TTM)',
        value: 30400000000,
        unit: 'USD',
        format: 'currencyCompact',
      },
      {
        id: 'freeCashFlowTTM',
        label: 'Free Cash Flow (TTM)',
        value: 35300000000,
        unit: 'USD',
        format: 'currencyCompact',
      },
      {
        id: 'operatingMargin',
        label: 'Operating Margin',
        value: 9.1,
        unit: '%',
        format: 'percentage',
      },
      {
        id: 'debtEquity',
        label: 'Debt / Equity',
        value: 1.12,
        unit: null,
        format: 'number',
      },
      {
        id: 'roe',
        label: 'ROE',
        value: 19.3,
        unit: '%',
        format: 'percentage',
      },
      {
        id: 'roa',
        label: 'ROA',
        value: 6.8,
        unit: '%',
        format: 'percentage',
      },
    ],
    riskMetrics: [
      {
        id: 'beta',
        label: 'Beta',
        value: 1.19,
        unit: null,
        format: 'number',
        description:
          'Measures how volatile the stock is compared to the overall market. Beta > 1 means higher risk.',
      },
      {
        id: 'volatility1Y',
        label: 'Volatility (1Y)',
        value: 28.4,
        unit: '%',
        format: 'percentage',
        description:
          'Annualized price fluctuation over the past year. Higher volatility means larger price swings.',
      },
      {
        id: 'maxDrawdown1Y',
        label: 'Max Drawdown (1Y)',
        value: -34.7,
        unit: '%',
        format: 'percentage',
        description:
          'Maximum observed loss from peak to trough over the past year.',
      },
      {
        id: 'debtRatio',
        label: 'Debt Ratio',
        value: 0.61,
        unit: null,
        format: 'number',
        description:
          'Proportion of assets financed by debt. Higher values indicate higher financial leverage.',
      },
    ],
    companyProfile: [
      {
        label: 'Sector',
        value: 'Consumer Cyclical',
      },
      {
        label: 'Industry',
        value: 'Internet Retail',
      },
      {
        label: 'Country',
        value: 'United States',
      },
    ],
  };

  return (
    <div className="py-6">
      <div className="text-muted-foreground">
        <span className="font-bold">{company.tickName}</span>{' '}
        {company.companyName}
      </div>
      <StockChart stock={stock}/>
      <div className="grid grid-cols-4 gap-4 py-16">
        {company.overview.map((item) => {
          return (
            <div
              key={`${item.id}_${item.value}`}
              className="bg-background p-4 rounded-2xl shadow-lg border border-gray-200"
            >
              <div className="text-sm font-medium text-muted-foreground">
                {item.label}
              </div>

              <div className="mt-1 text-lg font-bold">
                {formatValue(item.value, item.format, item.unit)}
              </div>
            </div>
          );
        })}
      </div>
      <div className="py-6 bg-background rounded-2xl shadow-lg border border-gray-200">
        <TableWithoutPagination
          headings={[]}
          rows={company.fundamentalsMetrics.map((metric) => [
            <div className="px-[20px] py-[10px] text-sm text-muted-foreground">
              {metric.label}
            </div>,

            <div
              className={cn(
                'px-[20px] py-[10px] text-right font-medium',
                metric.format === 'percentage' &&
                  metric.value > 0 &&
                  'text-emerald-400',
                metric.format === 'percentage' &&
                  metric.value < 0 &&
                  'text-red-400'
              )}
            >
              {formatValue(metric.value, metric.format, metric.unit)}
            </div>,
          ])}
          noData="No fundamentals available"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 py-6">
        {company.riskMetrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-background p-4 rounded-2xl shadow-lg border border-gray-200"
          >
            {/* Label */}
            <div className="text-sm font-medium text-muted-foreground">
              {metric.label}
            </div>

            {/* Value */}
            <div
              className={`
          mt-1 text-xl font-bold
          ${
            metric.id === 'maxDrawdown1Y'
              ? 'text-red-400'
              : metric.format === 'percentage' && metric.value > 0
                ? 'text-emerald-400'
                : ''
          }

                


                

                
        `}
            >
              {formatMetricValue(metric.value, metric.format, metric.unit)}
            </div>

            {/* Description */}
            <div className="mt-1 text-xs text-muted-foreground">
              {metric.description}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-background p-4 rounded-2xl shadow-lg border border-gray-200  ">
        <h3 className="mb-2 text-lg font-semibold">About the Company</h3>

        <p className="text-sm leading-relaxed text-muted-foreground">
          {company.businessDescription}
        </p>
      </div>
      <div className="mt-6 bg-background p-4 rounded-2xl shadow-lg border border-gray-200 ">
        <h3 className="mb-4 text-lg font-semibold">Company Details</h3>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
          {company.companyProfile.map((item, index) => (
            <Fragment key={index}>
              <div className="text-muted-foreground">{item.label}</div>
              <div className="font-medium">{item.value}</div>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

export default page;
