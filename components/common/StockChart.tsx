'use client';
import { useEffect, useMemo, useRef } from 'react';
import {
  createChart,
  CrosshairMode,
  ColorType,
  IChartApi,
  AreaSeries,
  HistogramSeries,
} from 'lightweight-charts';
import { brandingColors } from '@/lib';
import type { UTCTimestamp } from 'lightweight-charts';

function toLineSeriesData(data: any[]) {
  return data.map((d) => ({
    time: d.date.toISOString().split('T')[0],
    value: Math.floor(d.close * 10) / 10,
  }));
}

export function toVolumeSeries(data: any[]) {
  return data
    .filter((d) => d.volume && d.open && d.close)
    .map((d) => ({
      time: Math.floor(new Date(d.date).getTime() / 1000) as UTCTimestamp,
      value: d.volume,
      color: d.close >= d.open ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)',
    }));
}

export default function StockChart({ stock }: { stock: any }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipTimeRef = useRef<HTMLDivElement>(null);
  const tooltipPriceRef = useRef<HTMLSpanElement>(null);
  const tooltipVolumeRef = useRef<HTMLSpanElement>(null);
  const { lineData, volumeData } = useMemo(() => {
    if (!stock) {
      return { lineData: [], volumeData: [] };
    }
    const line = toLineSeriesData(stock);
    const volume = toVolumeSeries(stock);
    return { lineData: line, volumeData: volume };
  }, [stock]);

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

    chart.subscribeCrosshairMove(({ seriesData, time, point }) => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;

      if (!time || !point) {
        tooltip.style.display = 'none';
        return;
      }

      const price = seriesData.get(priceSeries);
      const volumeData = seriesData.get(volumeSeries);

      if (tooltipTimeRef.current) {
        tooltipTimeRef.current.textContent = new Date(
          time as string,
        ).toLocaleString();
      }

      if (tooltipPriceRef.current) {
        tooltipPriceRef.current.textContent = `$${(price as any)?.value ?? '—'}`;
      }

      if (tooltipVolumeRef.current) {
        tooltipVolumeRef.current.textContent = volumeData
          ? Number((volumeData as any)?.value).toLocaleString()
          : '—';
      }

      tooltip.style.display = 'block';
      tooltip.style.left = point.x + 400 + 'px';
      tooltip.style.top = point.y + 'px';
    });
    chart.timeScale().fitContent();

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
  }, [lineData, volumeData]);

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
        <div ref={tooltipTimeRef} className='mb-2 text-xs text-gray-400'></div>

        {/* Price row */}
        <div className='mt-1 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <span className='h-4 w-1 rounded bg-purple-400'></span>
            <span className='text-gray-300'>Price</span>
          </div>
          <span ref={tooltipPriceRef} className='font-semibold'></span>
        </div>

        {/* Volume row */}
        <div className='mt-2 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <span className='h-4 w-1 rounded bg-blue-400'></span>
            <span className='text-gray-300'>Volume</span>
          </div>
          <span
            ref={tooltipVolumeRef}
            className='font-semibold text-gray-300'
          ></span>
        </div>
      </div>
    </>
  );
}
