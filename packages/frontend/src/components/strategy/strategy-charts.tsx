import {
  useCssTheme,
  VegaVisual,
  type VegaLiteConfig,
  type VisualizationSpec,
} from '@microsoft/fabric-visuals';
import type { DataTable } from '@microsoft/fabric-visuals-core';
import { useMemo } from 'react';

import type { CostRow, Seasonality, SugarRow } from '@/data/strategy';

const sugarSpec: VisualizationSpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
  description: 'Sugar per serve as a share of the NHS daily free-sugar maximum',
  width: 'container',
  height: 'container',
  layer: [
    {
      mark: { type: 'bar', cornerRadiusEnd: 3 },
      encoding: {
        y: { field: 'blend', type: 'nominal', sort: { field: 'pct', op: 'max', order: 'descending' }, title: null },
        x: { field: 'pct', type: 'quantitative', title: null },
        color: {
          field: 'status',
          type: 'nominal',
          scale: { domain: ['Over daily max', 'Within daily max'] },
          legend: { orient: 'top', title: null },
        },
        tooltip: [
          { field: 'blend', type: 'nominal', title: 'Blend' },
          { field: 'sugar', type: 'quantitative', title: 'Sugar per serve (g)' },
          { field: 'pct', type: 'quantitative', title: 'Share of daily max' },
        ],
      },
    },
    {
      mark: { type: 'text', style: 'labelHorizontal' },
      encoding: {
        y: { field: 'blend', type: 'nominal', sort: { field: 'pct', op: 'max', order: 'descending' } },
        x: { field: 'pct', type: 'quantitative' },
        text: { field: 'pct', type: 'quantitative' },
      },
    },
    {
      mark: { type: 'rule', strokeDash: [4, 4], strokeWidth: 1.5 },
      encoding: { x: { datum: 1 } },
    },
  ],
};

const costSpec: VisualizationSpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
  description: 'Gross margin by blend before and after a fruit cost shock',
  width: 'container',
  height: 'container',
  mark: { type: 'bar', cornerRadiusEnd: 3 },
  encoding: {
    y: { field: 'blend', type: 'nominal', title: null },
    yOffset: { field: 'scenario', type: 'nominal', scale: { domain: ['Today', 'After shock'] } },
    x: { field: 'margin', type: 'quantitative', title: null },
    color: {
      field: 'scenario',
      type: 'nominal',
      scale: { domain: ['Today', 'After shock'] },
      legend: { orient: 'top', title: null },
    },
    tooltip: [
      { field: 'blend', type: 'nominal', title: 'Blend' },
      { field: 'scenario', type: 'nominal', title: 'Scenario' },
      { field: 'margin', type: 'quantitative', title: 'Gross margin' },
    ],
  },
};

const seasonSpec: VisualizationSpec = {
  $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
  description: 'Menu revenue by month, coloured by season',
  width: 'container',
  height: 'container',
  layer: [
    {
      mark: { type: 'bar', cornerRadiusEnd: 3 },
      encoding: {
        x: {
          field: 'month',
          type: 'ordinal',
          timeUnit: 'yearmonth',
          title: null,
          axis: { format: '%b', labelAngle: 0 },
        },
        y: { field: 'revenue', type: 'quantitative', title: null },
        color: {
          field: 'season',
          type: 'nominal',
          scale: { domain: ['Summer', 'Shoulder', 'Winter'] },
          legend: { orient: 'top', title: null },
        },
        tooltip: [
          { field: 'month', type: 'temporal', timeUnit: 'yearmonth', title: 'Month' },
          { field: 'season', type: 'nominal', title: 'Season' },
          { field: 'revenue', type: 'quantitative', title: 'Revenue' },
        ],
      },
    },
    {
      mark: { type: 'text', style: 'labelVertical', limit: 80 },
      encoding: {
        x: { field: 'month', type: 'ordinal', timeUnit: 'yearmonth' },
        y: { field: 'revenue', type: 'quantitative' },
        text: { field: 'label', type: 'nominal' },
      },
    },
  ],
};

function readVar(name: string, fallback: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/** A chart theme whose series colours are the given CSS-derived colours, in order. */
function useChartTheme(pick: (t: ReturnType<typeof useCssTheme>, danger: string) => string[]) {
  const theme = useCssTheme();
  const config = useMemo<VegaLiteConfig>(() => {
    const danger = readVar('--color-chart-alert', '#c75b4a');
    return {
      range: { category: pick(theme, danger) },
      rule: { stroke: theme.foreground },
    };
    // `pick` is a stable inline selector per chart; recompute only on theme change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);
  return { theme, config };
}

function Chart({ spec, data, height, pick }: {
  spec: VisualizationSpec;
  data: DataTable;
  height: string;
  pick: (t: ReturnType<typeof useCssTheme>, danger: string) => string[];
}) {
  const { theme, config } = useChartTheme(pick);
  return (
    <div className={`flex min-h-0 flex-col ${height}`}>
      <VegaVisual spec={spec} data={data} theme={theme} configVegaLite={config} className="h-full w-full" />
    </div>
  );
}

export function SugarChart({ rows }: { rows: SugarRow[] }) {
  const data = useMemo<DataTable>(
    () => ({
      columns: [
        { name: 'blend', displayName: 'Blend' },
        { name: 'pct', displayName: 'Share of daily max', format: '0%' },
        { name: 'sugar', displayName: 'Sugar per serve (g)', format: '0.0' },
        { name: 'status', displayName: 'Status' },
      ],
      rows: rows.map((r) => [
        r.smoothie.name,
        r.pctOfDailyMax / 100,
        r.sugarPerServeG,
        r.overDailyMax ? 'Over daily max' : 'Within daily max',
      ]),
    }),
    [rows]
  );
  return (
    <Chart
      spec={sugarSpec}
      data={data}
      height="h-[calc(var(--spacing-800)*11)]"
      pick={(t, danger) => [danger, t.brandForeground]}
    />
  );
}

export function CostChart({ rows }: { rows: CostRow[] }) {
  const data = useMemo<DataTable>(
    () => ({
      columns: [
        { name: 'blend', displayName: 'Blend' },
        { name: 'scenario', displayName: 'Scenario' },
        { name: 'margin', displayName: 'Gross margin', format: '0.0%' },
      ],
      rows: rows.flatMap((r) => [
        [r.smoothie.name, 'Today', r.marginBefore / 100],
        [r.smoothie.name, 'After shock', r.marginAfter / 100],
      ]),
    }),
    [rows]
  );
  return (
    <Chart
      spec={costSpec}
      data={data}
      height="h-[calc(var(--spacing-800)*13)]"
      pick={(t, danger) => [t.brandForeground, danger]}
    />
  );
}

export function SeasonChart({ season }: { season: Seasonality }) {
  const data = useMemo<DataTable>(
    () => ({
      columns: [
        { name: 'month', displayName: 'Month' },
        { name: 'revenue', displayName: 'Revenue', format: '$#,0' },
        { name: 'label', displayName: 'Revenue label' },
        { name: 'season', displayName: 'Season' },
      ],
      rows: season.months.map((m) => [
        m.month.toISOString().slice(0, 10),
        m.revenueUsd,
        `$${Math.round(m.revenueUsd / 1000)}K`,
        m.season,
      ]),
    }),
    [season]
  );
  return (
    <Chart
      spec={seasonSpec}
      data={data}
      height="h-[calc(var(--spacing-800)*9)]"
      pick={(t) => [t.brandForeground, t.foregroundSecondary, readVar('--color-chart-cool', '#7fa6c9')]}
    />
  );
}
