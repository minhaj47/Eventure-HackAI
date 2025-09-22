import React from "react";
import { ReminderColor } from "../types";

interface ReminderCardProps {
  title: string;
  icon: React.ReactNode;
  color: ReminderColor;
  items: string[];
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  title,
  icon,
  color,
  items,
}) => {
  const colorMap = {
    white: {
      bg: "bg-white/5",
      text: "text-white",
      border: "border-white/20",
      dot: "bg-white",
      iconBg: "bg-white",
      iconText: "text-black",
    },
    cyan: {
      bg: "bg-cyan-500/10",
      text: "text-cyan-200",
      border: "border-cyan-400/20",
      dot: "bg-cyan-400",
      iconBg: "bg-cyan-500",
      iconText: "text-white",
    },
    gray: {
      bg: "bg-gray-500/10",
      text: "text-gray-200",
      border: "border-gray-400/20",
      dot: "bg-gray-400",
      iconBg: "bg-gray-600",
      iconText: "text-white",
    },
  };

  const { bg, text, border, dot, iconBg, iconText } = colorMap[color];

  return (
    <div className={`p-6 rounded-2xl ${bg} border ${border} backdrop-blur-sm`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className={`p-2 ${iconBg} rounded-lg ${iconText}`}>{icon}</div>
        <h3 className={`text-lg font-bold ${text}`}>{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-center space-x-3 text-sm">
            <div className={`w-2 h-2 ${dot} rounded-full`}></div>
            <span className={text}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
