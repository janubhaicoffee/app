"use client";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const colorMap = {
  green: "border-t-green-700",
  red: "border-t-[var(--accent-red)]",
  gold: "border-t-[var(--accent-gold)]",
  blue: "border-t-blue-600",
  default: "border-t-[var(--primary-color)]",
};

const trendIcons = {
  up: TrendingUp,
  down: TrendingDown,
  flat: Minus,
};

const trendColors = {
  up: "text-green-600",
  down: "text-red-500",
  flat: "text-gray-400",
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  trend = "flat",
  trendValue,
  color = "default",
  className = "",
}) {
  const TrendIcon = trendIcons[trend] || Minus;
  const topBorder = colorMap[color] || colorMap.default;

  return (
    <div
      className={`bg-white rounded-xl border border-[var(--border-color)] shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-5 border-t-3 ${topBorder} transition-transform hover:-translate-y-0.5 ${className}`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="m-0 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">
          {label}
        </h3>
        {Icon && (
          <div className="text-gray-400 flex-shrink-0 ml-2">
            <Icon size={18} />
          </div>
        )}
      </div>
      <p className="m-0 text-2xl font-bold text-[var(--primary-color)]">{value}</p>
      {trendValue && (
        <div className={`flex items-center gap-1 mt-1.5 text-xs font-semibold ${trendColors[trend] || trendColors.flat}`}>
          <TrendIcon size={14} />
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  );
}
