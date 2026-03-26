"use client";

import { motion } from "framer-motion";

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e"; // green-500
  if (score >= 60) return "#eab308"; // yellow-500
  if (score >= 40) return "#f97316"; // orange-500
  return "#ef4444"; // red-500
}

export default function ScoreGauge({ score, size = 180 }: ScoreGaugeProps) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  const color = getScoreColor(score);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(31,41,55,0.3)"
          strokeWidth={strokeWidth}
        />
        {/* Animated score circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-black text-white"
          style={{ fontSize: size * 0.28 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-gray-500" style={{ fontSize: size * 0.1 }}>
          /100
        </span>
      </div>
    </div>
  );
}
