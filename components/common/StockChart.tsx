'use client';
import { useEffect, useRef } from 'react';
import {
  createChart,
  CrosshairMode,
  ColorType,
  IChartApi,
  AreaSeries,
  HistogramSeries,
} from 'lightweight-charts';
import { brandingColors } from '@/lib';
import { TimeSeriesDailyResponse } from '@/interfaces';

export default function StockChart({stock}:{stock:TimeSeriesDailyResponse}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: brandingColors.background },
        textColor: brandingColors.foreground,
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderVisible: false,
        visible: false,
      },
      timeScale: {
        borderVisible: true,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Price line
    const priceSeries = chart.addSeries(AreaSeries, {
      lineColor: '#6f0652',
      topColor: brandingColors.background,
      bottomColor: brandingColors.background,
    });
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
      color: brandingColors.primary,
    });

    // Volume bars
    // const volumeSeries = chart.addHistogramSeries({
    //   color: '#2b2f36',
    //   priceFormat: { type: 'volume' },
    //   priceScaleId: '',
    // });

    // // Adjust volume scale
    // chart.priceScale('').applyOptions({
    //   scaleMargins: {
    //     top: 0.8,
    //     bottom: 0,
    //   },
    // });

    // Sample price data
    const timeSeries = stock['Time Series (Daily)'];
    const lineData = Object.entries(timeSeries)
      .map(([date, v]) => ({
        time: date, // YYYY-MM-DD (TradingView supports this directly)
        value: Number(v['4. close']),
      }))
      .reverse(); // IMPORTANT: oldest → newest

    const volumeData = Object.entries(timeSeries)
      .map(([date, v]) => ({
        time: date, // YYYY-MM-DD (TradingView supports this directly)
        value: Number(v['5. volume']),
      }))
      .reverse(); // IMPORTANT: oldest → newest

    priceSeries.setData(lineData);
    volumeSeries.setData(volumeData);
    chart.priceScale('right').applyOptions({
      scaleMargins: {
        top: 0.1,
        bottom: 0.4,
      },
    });
    chart.priceScale('volume').applyOptions({
      autoScale: true,
      scaleMargins: {
        top: 0.92, // price takes top 80%
        bottom: 0,
      },
    });
    // volumeSeries.setData(volumeData);
    chart.subscribeCrosshairMove(({ seriesData, time, point }) => {
      const tooltip = tooltipRef.current!;

      if (!time || !point) {
        tooltip.style.display = 'none';
        return;
      }

      const price = seriesData.get(priceSeries);
      const volumeData = seriesData.get(volumeSeries);

      tooltip.querySelector('.tooltip-time')!.textContent = new Date(
        time as string,
      ).toLocaleString();

      tooltip.querySelector('.price-value')!.textContent =
        `$${(price as any)?.value}`;

      tooltip.querySelector('.volume-value')!.textContent = volumeData
        ? Number((volumeData as any)?.value).toLocaleString()
        : '—';

      tooltip.style.display = 'block';
      tooltip.style.left = point.x + 400 + 'px';
      tooltip.style.top = point.y + 'px';
    });
    chart.timeScale().fitContent();

    // Resize handler
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  return (
    <>
      <div
        ref={chartContainerRef}
        style={{
          width: '100%',
          overflow: 'hidden',
          backgroundColor: '#0b0f14',
        }}
      />
      <div
        ref={tooltipRef}
        className='pointer-events-none z-[999] absolute hidden min-w-[180px] rounded-xl bg-black/85 backdrop-blur-md px-4 py-3 text-sm text-white shadow-2xl'
      >
        {/* Time */}
        <div className='mb-2 text-xs text-gray-400 tooltip-time'></div>

        {/* Price row */}
        <div className='mt-1 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <span className='h-4 w-1 rounded bg-purple-400'></span>
            <span className='text-gray-300'>Price</span>
          </div>
          <span className='font-semibold price-value'></span>
        </div>

        {/* Volume row */}
        <div className='mt-2 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <span className='h-4 w-1 rounded bg-blue-400'></span>
            <span className='text-gray-300'>Volume</span>
          </div>
          <span className='font-semibold text-gray-300 volume-value'></span>
        </div>
      </div>
    </>
  );
}
