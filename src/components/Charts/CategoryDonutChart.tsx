import React, { useState } from 'react';
import { CategorySpend } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { useFinance } from '../../context/FinanceContext';
import { CategoryIcon } from '../CategoryIcon';

interface DonutChartProps {
  data: CategorySpend[];
  totalExpense: number;
}

export const CategoryDonutChart: React.FC<DonutChartProps> = ({ data, totalExpense }) => {
  const { settings } = useFinance();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Filter only categories with spending
  const activeCategories = data.filter((item) => item.amount > 0);

  if (activeCategories.length === 0 || totalExpense === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-400">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
        </div>
        <p className="text-sm font-medium">No expenses logged for this month</p>
        <span className="text-xs text-slate-400 mt-1">Tap + to add your first expense</span>
      </div>
    );
  }

  // Calculate SVG arc paths for donut
  const size = 200;
  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  const hoveredItem = hoveredIdx !== null ? activeCategories[hoveredIdx] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-between">
      {/* Donut graphic */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800/80"
          />
          {activeCategories.map((item, idx) => {
            const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += item.percentage;
            const isHovered = hoveredIdx === idx;

            return (
              <circle
                key={item.category.id}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={item.category.color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {hoveredItem ? hoveredItem.category.name : 'Total Spent'}
          </span>
          <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tabular-nums tracking-tight">
            {formatCurrency(hoveredItem ? hoveredItem.amount : totalExpense, settings.currency, false)}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums font-medium">
            {hoveredItem ? `${hoveredItem.percentage.toFixed(1)}%` : `${activeCategories.length} categories`}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full space-y-2 max-h-52 overflow-y-auto pr-1">
        {activeCategories.slice(0, 5).map((item, idx) => {
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={item.category.id}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                isHovered
                  ? 'bg-slate-100 dark:bg-slate-800'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.category.color }}
                />
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                  {item.category.name}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-right">
                <span className="tabular-nums font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(item.amount, settings.currency, false)}
                </span>
                <span className="tabular-nums text-slate-500 w-10 text-right font-medium">
                  {item.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
        {activeCategories.length > 5 && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center pt-1">
            +{activeCategories.length - 5} more categories in Budgets tab
          </p>
        )}
      </div>
    </div>
  );
};
