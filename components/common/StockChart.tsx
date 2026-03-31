'use client';

import { brandingColors } from '@/lib';
import { useEffect, useMemo, useRef } from 'react';
import {
  createChart,
  CrosshairMode,
  ColorType,
  IChartApi,
  AreaSeries,
  HistogramSeries,
  UTCTimestamp,
} from 'lightweight-charts';

interface Candle {
  date: string | Date;
  open: number;
  close: number;
  volume: number;
}

interface StockChartProps {
  stock: Candle[];
}

function normalizeData(data: Candle[]) {
  const map = new Map<number, Candle>();

  for (const d of data) {
    const time = Math.floor(new Date(d.date).getTime() / 1000);

    map.set(time, {
      ...d,
      date: new Date(time * 1000),
    });
  }

  const sorted = [...map.entries()].sort((a, b) => a[0] - b[0]).map(([, value]) => value);

  const lineData = sorted.map((d) => ({
    time: Math.floor(new Date(d.date).getTime() / 1000) as UTCTimestamp,
    value: Math.floor(d.close * 10) / 10,
  }));

  const volumeData = sorted
    .filter((d) => d.volume && d.open && d.close)
    .map((d) => ({
      time: Math.floor(new Date(d.date).getTime() / 1000) as UTCTimestamp,
      value: d.volume,
      color: d.close >= d.open ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)',
    }));

  return { lineData, volumeData };
}

export default function StockChart({ stock }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipTimeRef = useRef<HTMLDivElement>(null);
  const tooltipPriceRef = useRef<HTMLSpanElement>(null);
  const tooltipVolumeRef = useRef<HTMLSpanElement>(null);

  const { lineData, volumeData } = useMemo(() => {
    if (!stock) return { lineData: [], volumeData: [] };
    return normalizeData(stock);
  }, [stock]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

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
        top: 0.92,
        bottom: 0,
      },
    });

    chart.timeScale().fitContent();

    chart.subscribeCrosshairMove(({ seriesData, time, point }) => {
      const tooltip = tooltipRef.current;
      if (!tooltip) return;

      if (!time || !point) {
        tooltip.style.display = 'none';
        return;
      }

      const priceData = seriesData.get(priceSeries);
      const volumeDataPoint = seriesData.get(volumeSeries);
      const priceValue =
        priceData && 'value' in priceData && typeof priceData.value === 'number'
          ? priceData.value
          : null;
      const volumeValue =
        volumeDataPoint && 'value' in volumeDataPoint && typeof volumeDataPoint.value === 'number'
          ? volumeDataPoint.value
          : null;

      if (tooltipTimeRef.current) {
        tooltipTimeRef.current.textContent = new Date((time as number) * 1000).toLocaleDateString();
      }

      if (tooltipPriceRef.current) {
        tooltipPriceRef.current.textContent = priceValue !== null ? `$${priceValue}` : '—';
      }

      if (tooltipVolumeRef.current) {
        tooltipVolumeRef.current.textContent =
          volumeValue !== null ? volumeValue.toLocaleString() : '—';
      }

      tooltip.style.display = 'block';
      tooltip.style.left = `${point.x + 16}px`;
      tooltip.style.top = `${point.y + 16}px`;
    });

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
        className="pointer-events-none z-[999] absolute hidden min-w-[180px] rounded-xl bg-black/85 backdrop-blur-md px-4 py-3 text-sm text-white shadow-2xl"
      >
        <div ref={tooltipTimeRef} className="mb-2 text-xs text-gray-400"></div>

        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 rounded bg-purple-400"></span>
            <span className="text-gray-300">Price</span>
          </div>
          <span ref={tooltipPriceRef} className="font-semibold"></span>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-4 w-1 rounded bg-blue-400"></span>
            <span className="text-gray-300">Volume</span>
          </div>
          <span ref={tooltipVolumeRef} className="font-semibold text-gray-300"></span>
        </div>
      </div>
    </>
  );
}
