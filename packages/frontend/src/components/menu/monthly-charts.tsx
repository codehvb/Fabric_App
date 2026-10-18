import {
  useCssTheme,
  VegaVisual,
  type VegaLiteConfig,
  type VisualizationSpec,
} from '@microsoft/fabric-visuals';
import type { DataTable } from '@microsoft/fabric-visuals-core';
import { useMemo } from 'react';

import type { MonthlyPoint } from '@/data/menu';

const revenueSpec: VisualizationSpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
  description: 'Monthly revenue for one smoothie',
  width: 'container',
  height: 'container',
  mark: { type: 'area', line: true },
  encoding: {
    x: {
      field: 'month',
      type: 'temporal',
      timeUnit: 'yearmonth',
      title: null,
      axis: { format: '%b', labelAngle: 0 },
    },
    y: { field: 'revenue', type: 'quantitative', title: null },
    tooltip: [
      { field: 'month', type: 'temporal', timeUnit: 'yearmonth', title: 'Month' },
      { field: 'revenue', type: 'quantitative', title: 'Revenue' },
    ],
  },
};

const unitsSpec: VisualizationSpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
  description: 'Monthly units sold for one smoothie',
  width: 'container',
  height: 'container',
  mark: 'line',
  encoding: {
    x: {
      field: 'month',
      type: 'temporal',
      timeUnit: 'yearmonth',
      title: null,
      axis: { format: '%b', labelAngle: 0 },
    },
    y: { field: 'units', type: 'quantitative', title: null, scale: { zero: false } },
    tooltip: [
      { field: 'month', type: 'temporal', timeUnit: 'yearmonth', title: 'Month' },
      { field: 'units', type: 'quantitative', title: 'Units sold' },
    ],
  },
};

/** Revenue and units trends for the open smoothie. */
export default function MonthlyCharts({ points }: { points: MonthlyPoint[] }) {
  const theme = useCssTheme();
  // The built-in series palette isn't CSS-driven, so tint single-series marks
  // with the theme's brand colour to keep the charts in the house gold.
  const config = useMemo<VegaLiteConfig>(() => {
    const gold = theme.brandForeground;
    // The base theme paints marks with `fill`/`stroke`, so override those.
    return {
      range: { category: [gold] },
      line: { stroke: gold },
      area: {
        stroke: gold,
        fill: {
          gradient: 'linear',
          x1: 0,
          y1: 0,
          x2: 0,
          y2: 1,
          stops: [
            { offset: 0, color: gold },
            { offset: 1, color: theme.background },
          ],
        },
      },
    };
  }, [theme.brandForeground, theme.background]);

  const { revenue, units } = useMemo(() => {
    const month = (p: MonthlyPoint) => p.month.toISOString().slice(0, 10);
    const revenue: DataTable = {
      columns: [
        { name: 'month', displayName: 'Month' },
        { name: 'revenue', displayName: 'Revenue', format: '$#,0' },
      ],
      rows: points.map((p) => [month(p), p.revenueUsd]),
    };
    const units: DataTable = {
      columns: [
        { name: 'month', displayName: 'Month' },
        { name: 'units', displayName: 'Units sold', format: '#,0' },
      ],
      rows: points.map((p) => [month(p), p.unitsSold]),
    };
    return { revenue, units };
  }, [points]);

  return (
    <div className="grid gap-500">
      <ChartCard title="Monthly revenue">
        <VegaVisual spec={revenueSpec} data={revenue} theme={theme} configVegaLite={config} className="h-full w-full" />
      </ChartCard>
      <ChartCard title="Units sold">
        <VegaVisual spec={unitsSpec} data={units} theme={theme} configVegaLite={config} className="h-full w-full" />
      </ChartCard>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <figure className="flex flex-col gap-200 rounded-3xl border border-border bg-background/40 p-400">
      <figcaption className="text-200 leading-200 tracking-widest text-muted-foreground uppercase">
        {title}
      </figcaption>
      <div className="flex h-[calc(var(--spacing-800)*6)] min-h-0 flex-col">{children}</div>
    </figure>
  );
}
