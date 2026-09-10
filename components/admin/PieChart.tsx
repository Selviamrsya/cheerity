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

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const centerX = compact ? 100 : 150;
  const centerY = compact ? 100 : 150;
  const radius = compact ? 80 : 120;

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
  const slices = data.map((item, index) => {
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
    return (
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h2 className="chart-title">{title}</h2>
            {subtitle && <p className="chart-subtitle">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center">
          <div className="relative shrink-0">
            <svg width="200" height="200" viewBox="0 0 200 200" className="chart-svg">
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
                      className="fill-white font-bold text-xs pointer-events-none drop-shadow-md"
                    >
                      {slice.value} ({slice.percentage}%)
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div className="space-y-2">
              {slices.map((slice, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 min-w-0 p-1.5"
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-gray-700 text-sm truncate">{slice.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h2 className="chart-title">{title}</h2>
          {subtitle && <p className="chart-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-2">
        {/* Pie Chart */}
        <div className="relative">
          <svg width="300" height="300" viewBox="0 0 300 300" className="chart-svg">
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

        <div className="flex-1 w-full sm:w-auto">
          <div className="space-y-3">
            {slices.map((slice, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2"
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-sm font-medium text-gray-700">{slice.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}