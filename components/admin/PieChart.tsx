"use client";

import React, { useState } from "react";

interface PieChartProps {
  data: {
    label: string;
    value: number;
    percentage: number;
  }[];
  title: string;
  subtitle?: string;
  colors?: string[];
  compact?: boolean;
}

const DEFAULT_COLORS = [
  "var(--color-primary)",      
  "var(--color-primary-600)",
  "var(--color-primary-800)",   
  "var(--color-primary-900)",     
];

export default function PieChart({ data, title, subtitle, colors = DEFAULT_COLORS, compact = false }: PieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Filter out items with value = 0 to prevent empty slices
  const filteredData = data.filter(item => item.value > 0);

  // Debug: log data
  console.log("PieChart - Original data:", data);
  console.log("PieChart - Filtered data:", filteredData);
  console.log("PieChart - Total:", filteredData.reduce((sum, item) => sum + item.value, 0));

  const total = filteredData.reduce((sum, item) => sum + item.value, 0);
  const centerX = compact ? 120 : 150;
  const centerY = compact ? 120 : 150;
  const radius = compact ? 100 : 120;

  // PINDAHKAN KE SINI: Convert polar to cartesian coordinates
  // Harus dideklarasikan sebelum digunakan di dalam data.map
  const polarToCartesian = (angle: number, r: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: centerX + r * Math.cos(rad),
      y: centerY + r * Math.sin(rad),
    };
  };

  // Calculate pie slices
  let currentAngle = -90; // Start from top
  const slices = filteredData.map((item, index) => {
    const sliceAngle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const centroidAngle = (startAngle + endAngle) / 2;
    const centroidPosition = polarToCartesian(centroidAngle, radius * 0.7);

    return {
      ...item,
      startAngle,
      endAngle,
      color: colors[index % colors.length],
      centroidX: centroidPosition.x,
      centroidY: centroidPosition.y,
    };
  });

  // Generate SVG path for pie slice
  const getSlicePath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(startAngle, radius);
    const end = polarToCartesian(endAngle, radius);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return [
      `M ${centerX} ${centerY}`,
      `L ${start.x} ${start.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
      "Z",
    ].join(" ");
  };

  if (compact) {
    // Tambahkan validasi jika data kosong atau totalnya 0
    const hasData = filteredData && filteredData.length > 0 && total > 0;

    return (
      <div className="mb-4 flex min-h-[400px] w-full flex-col rounded-sm border border-card-border bg-surface p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] h-full">
        <div className="flex flex-col gap-2 border-b border-card-border pb-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-poppins text-lg font-medium text-text-main">{title}</h2>
            {subtitle && <p className="mt-1 font-inter text-xs text-text-muted">{subtitle}</p>}
          </div>
        </div>

        {/* Cek apakah data tersedia */}
        {hasData ? (
          <div className="flex flex-col items-center flex-1 justify-center">
            <div className="relative shrink-0">
              <svg width="240" height="240" viewBox="0 0 240 240" className="w-[240px] h-[240px]">
                {slices.length === 1 ? (
                  /* JIKA DATA CUMA 1: Render <circle> penuh */
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    fill={slices[0].color}
                    className="transition-all duration-200 cursor-pointer"
                    style={{
                      transform: hoveredIndex === 0 ? "scale(1.05)" : "scale(1)",
                      transformOrigin: `${centerX}px ${centerY}px`,
                    }}
                    onMouseEnter={() => setHoveredIndex(0)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                ) : (
                  /* JIKA DATA LEBIH DARI 1: Gunakan path slice normal */
                  slices.map((slice, index) => (
                    <g key={index}>
                      <path
                        d={getSlicePath(slice.startAngle, slice.endAngle)}
                        fill={slice.color}
                        className="transition-all duration-200 cursor-pointer"
                        style={{
                          opacity: hoveredIndex === null ? 1 : hoveredIndex === index ? 1 : 0.3,
                          transform: hoveredIndex === index ? "scale(1.05)" : "scale(1)",
                          transformOrigin: `${centerX}px ${centerY}px`,
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                    </g>
                  ))
                )}

                {hoveredIndex !== null && slices[hoveredIndex] && (
                  <text
                    x={centerX}
                    y={centerY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-white font-bold text-xs pointer-events-none drop-shadow-md bg-black/50"
                  >
                    {slices[hoveredIndex].value} ({slices[hoveredIndex].percentage}%)
                  </text>
                )}
              </svg>
            </div>

            <div className="w-full mt-2">
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5">
                {slices.map((slice, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: slice.color }}
                    />
                    <span className="text-gray-700 text-xs">{slice.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Tampilan Fallback Jika Kosong / Total 0 */
          <div className="flex items-center justify-center flex-1 h-80 text-gray-400">
            <p className="text-sm">No donor location data yet</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-4 flex min-h-[400px] w-full flex-col rounded-sm border border-card-border bg-surface p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-2 border-b border-card-border pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-poppins text-lg font-medium text-text-main">{title}</h2>
          {subtitle && <p className="mt-1 font-inter text-xs text-text-muted">{subtitle}</p>}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center">
        {/* Pie Chart */}
        <div className="relative">
          <svg width="300" height="300" viewBox="0 0 300 300">
            {slices.map((slice, index) => (
              <g key={index}>
                <path
                  d={getSlicePath(slice.startAngle, slice.endAngle)}
                  fill={slice.color}
                  className="transition-all duration-200 cursor-pointer"
                  style={{
                    opacity: hoveredIndex === null ? 1 : hoveredIndex === index ? 1 : 0.3,
                    transform: hoveredIndex === index ? "scale(1.05)" : "scale(1)",
                    transformOrigin: `${centerX}px ${centerY}px`,
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
                {hoveredIndex === index && (
                  <text
                    x={slice.centroidX}
                    y={slice.centroidY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-white font-bold text-sm pointer-events-none drop-shadow-md"
                  >
                    {slice.value} ({slice.percentage}%)
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>

        <div className="flex-1 w-full sm:w-auto min-w-0 overflow-hidden">
          <div className="space-y-3">
            {slices.map((slice, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 min-w-0"
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-sm font-medium text-gray-700 truncate">{slice.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}