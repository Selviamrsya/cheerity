"use client";

import React, { useState } from "react";

interface DataPoint {
  label: string;
  count: number;
  fullDate?: string;
}

interface DonationsActivityChartProps {
  data: {
    weekly: DataPoint[];
    monthly: DataPoint[];
    yearly: DataPoint[];
  };
}

export default function DonationsActivityChart({ data }: DonationsActivityChartProps) {
  const [period, setPeriod] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const currentData = data[period] || [];
  const counts = currentData.map((d) => d.count);
  const totalCount = counts.reduce((acc, c) => acc + c, 0);

  // Calculate Y-axis scale and ticks: 0, 1, 2, 3, 4, 5
  const rawMax = Math.max(...counts, 0);
  let scaleMax = 5;
  let yTicks: number[] = [0, 1, 2, 3, 4, 5];

  if (rawMax <= 5) {
    scaleMax = 5;
    yTicks = [0, 1, 2, 3, 4, 5];
  } else {
    const roughStep = Math.ceil(rawMax / 5);
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const normalized = roughStep / magnitude;
    let step = 1;
    if (normalized <= 1) step = 1 * magnitude;
    else if (normalized <= 2) step = 2 * magnitude;
    else if (normalized <= 5) step = 5 * magnitude;
    else step = 10 * magnitude;

    scaleMax = step * 5;
    while (scaleMax < rawMax) {
      scaleMax += step;
    }
    yTicks = [];
    for (let val = 0; val <= scaleMax; val += step) {
      yTicks.push(val);
    }
  }

  // SVG dimensions
  const width = 800;
  const height = 320;
  const paddingTop = 25;
  const paddingBottom = 40;
  const paddingLeft = 21; // Space for Y-axis numbers
  const paddingRight = 35;

  const chartHeight = height - paddingTop - paddingBottom;
  const lineX1 = paddingLeft;
  const lineX2 = width - paddingRight;

  // Space out the first data point from 0 and the Y-axis
  const startX = paddingLeft + 35; // Generous distance between 0 and the first point
  const endX = width - paddingRight - 20;
  const pointsWidth = endX - startX;

  // Generate coordinates
  const points = currentData.map((item, index) => {
    const x = startX + (index / (currentData.length - 1 || 1)) * pointsWidth;
    const y = paddingTop + chartHeight - (item.count / scaleMax) * chartHeight;
    return { x, y, ...item };
  });

  // Generate SVG path string with smooth curve
  const pathD = points.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p.x} ${p.y}`;
    const prev = arr[i - 1];
    const cpX1 = prev.x + (p.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (p.x - prev.x) / 2;
    const cpY2 = p.y;
    return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
  }, "");

  // Area path for gradient fill
  const areaD =
    points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${
          paddingTop + chartHeight
        } Z`
      : "";

  const getPeriodLabel = () => {
    switch (period) {
      case "weekly":
        return "Total donations in the last 7 days";
      case "monthly":
        return "Monthly donation amount";
      case "yearly":
        return "Annual donation amount over one year";
    }
  };

  return (
    <div className="mb-4 flex min-h-100 w-full flex-col rounded-sm border border-card-border bg-surface p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Header with Title & Filter Buttons */}
      <div className="flex flex-col gap-2 border-b border-card-border pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-poppins text-lg font-medium text-text-main">
            Donations Activity
          </h2>
          <p className="mt-1 font-inter text-xs text-text-muted">
            {getPeriodLabel()} &bull; Total: <strong>{totalCount} donation</strong>
          </p>
        </div>

        {/* Filter Tabs: Weekly | Monthly | Yearly */}
        <div className="inline-flex self-start rounded-lg border border-outline bg-surface-container p-1 sm:self-auto">
          {(["weekly", "monthly", "yearly"] as const).map((tab) => {
            const isActive = period === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setPeriod(tab);
                  setHoveredIndex(null);
                }}
                data-active={isActive}
                className={`cursor-pointer rounded-md border-none px-4 py-1.5 font-inter text-xs font-medium capitalize transition-all ${
                  isActive
                    ? "bg-surface text-primary-900 shadow-sm font-semibold"
                    : "bg-transparent text-text-muted hover:text-text-main"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="relative w-full flex-1 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-80 min-w-[600px] w-full overflow-visible"
          // preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines on 0, 1, 2, 3, 4, 5 */}
          {yTicks.map((tick, i) => {
            const y = paddingTop + chartHeight - (tick / scaleMax) * chartHeight;
            return (
              <g key={i}>
                <line
                  x1={lineX1}
                  y1={y}
                  x2={lineX2}
                  y2={y}
                  className="stroke-outline stroke-1"
                  strokeDasharray={i === 0 ? "0" : "4 4"}
                />
                <text
                  x={lineX1 - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-text-subtle font-inter text-xs font-medium"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Gradient Area Fill */}
          {areaD && <path d={areaD} fill="url(#chartGradient)" />}

          {/* Smooth Line */}
          {pathD && (
            <path
              d={pathD}
              className="fill-none stroke-primary-800 stroke-[3.5] [stroke-linecap:round] [stroke-linejoin:round]"
            />
          )}

          {/* Data Points and Interactivity */}
          {points.map((p, idx) => (
            <g
              key={idx}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer"
            >
              {/* Invisible bigger hover area */}
              <circle cx={p.x} cy={p.y} r="16" fill="transparent" />

              {/* Point Circle */}
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === idx ? 6 : 4}
                className={`fill-surface stroke-primary-800 stroke-[1.5] transition-all data-[active=true]:fill-primary-800 data-[active=true]:stroke-[2.5] ${hoveredIndex === idx ? "active" : ""}`}
              />

              {/* X-axis Label */}
              <text
                x={p.x}
                y={height - 12}
                textAnchor="middle"
                className={`fill-text-subtle font-poppins text-xs font-medium transition-[fill] data-[active=true]:fill-primary-900 ${hoveredIndex === idx ? "active" : ""}`}
              >
                {p.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Popup */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div
            className="pointer-events-none absolute z-10 mt-[-10px] -translate-x-1/2 -translate-y-full rounded-md bg-text-main px-3 py-2 font-inter text-[11.5px] text-surface shadow-lg"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              top: `${(points[hoveredIndex].y / height) * 100}%`,
            }}
          >
            <div className="font-medium text-surface">
              {points[hoveredIndex].count} donasi
            </div>
            <div className="text-xs text-text-subtle">
              {points[hoveredIndex].fullDate || points[hoveredIndex].label}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
