import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { useFinance } from '../../context/FinanceContext';

interface DailyTrendChartProps {
  data: { day: number; date: string; amount: number }[];
}

export const DailyTrendChart: React.FC<DailyTrendChartProps> = ({ data }) => {
  const { settings } = useFinance();
  const [hoveredDay, setHoveredDay] = useState<{ day: number; date: string; amount: number } | null>(null);

  const maxAmount = Math.max(...data.map((d) => d.amount), 50);
  const totalDays = data.length;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 text-xs">
        <span className="text-slate-500 dark:text-slate-400">
          Daily Spending Flow (1 – {totalDays})
        </span>
        {hoveredDay ? (
          <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
            Day {hoveredDay.day}: {formatCurrency(hoveredDay.amount, settings.currency, false)}
          </span>
        ) : (
          <span className="text-slate-400 text-[11px]">Hover or tap bars for details</span>
        )}
      </div>

      <div className="relative h-32 w-full flex items-end gap-1 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        {data.map((item) => {
          const heightPercent = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
          const isSelected = hoveredDay?.day === item.day;
          const hasSpend = item.amount > 0;

          return (
            <div
              key={item.day}
              className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer"
              onMouseEnter={() => setHoveredDay(item)}
              onMouseLeave={() => setHoveredDay(null)}
              onClick={() => setHoveredDay(item)}
            >
              {/* Bar */}
              <div
                style={{ height: `${Math.max(heightPercent, hasSpend ? 6 : 2)}%` }}
                className={`w-full rounded-t-sm transition-all duration-150 ${
                  isSelected
                    ? 'bg-rose-500 scale-x-125 z-10 shadow-sm'
                    : hasSpend
                    ? 'bg-slate-800 dark:bg-slate-300 group-hover:bg-rose-400'
                    : 'bg-slate-100 dark:bg-slate-800/60'
                }`}
              />

              {/* Tooltip on active */}
              {isSelected && (
                <div className="absolute -top-7 px-2 py-1 bg-slate-900 text-white text-[10px] rounded shadow-md whitespace-nowrap z-20 pointer-events-none tabular-nums">
                  Day {item.day}: {formatCurrency(item.amount, settings.currency, false)}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Axis markers */}
      <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
        <span>Day 1</span>
        <span>Day 10</span>
        <span>Day 20</span>
        <span>Day {totalDays}</span>
      </div>
    </div>
  );
};
