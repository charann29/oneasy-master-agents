"use client";

import { containerVariants, itemVariants } from "@/app/idea-validation/_lib/animations";

import { motion } from "framer-motion";
import type { ValidationOutput, Verdict } from "@/app/idea-validation/_types";
import ScoreGauge from "./ScoreGauge";

interface ValidationScorecardProps {
  data: ValidationOutput;
}

const verdictConfig: Record<Verdict, { label: string; color: string; bg: string; border: string }> = {
  strong_fit: {
    label: "STRONG FIT - Proceed with confidence",
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
  },
  moderate_fit: {
    label: "MODERATE FIT - Proceed with adjustments",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
  },
  weak_fit: {
    label: "WEAK FIT - Significant changes needed",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
  },
  no_fit: {
    label: "NO FIT - Reconsider the idea",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
  },
};

const breakdownLabels: { key: keyof ValidationOutput["breakdown"]; label: string }[] = [
  { key: "problem_clarity", label: "Problem Clarity" },
  { key: "solution_fit", label: "Solution Fit" },
  { key: "market_opportunity", label: "Market Opportunity" },
  { key: "competitive_advantage", label: "Competitive Advantage" },
];



export default function ValidationScorecard({ data }: ValidationScorecardProps) {
  const verdict = verdictConfig[data.verdict];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Top Section: Score + Verdict */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center"
      >
        <ScoreGauge score={data.score} />
        <div
          className={`inline-flex items-center rounded-full border px-5 py-2.5 text-sm font-semibold ${verdict.bg} ${verdict.border} ${verdict.color}`}
        >
          {verdict.label}
        </div>
      </motion.div>

      {/* Score Breakdown - 2x2 Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {breakdownLabels.map(({ key, label }) => {
          const value = data.breakdown[key];
          return (
            <div key={key} className="rounded-xl border border-white/10 bg-[#0A0A0A] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-300">{label}</span>
                <span className="text-sm font-bold text-white">{value}/25</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-800">
                <motion.div
                  className="h-full rounded-full bg-red-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(value / 25) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                />
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Key Findings */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Strengths */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-green-500/20 bg-green-500/5 p-4"
        >
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-green-400">
            Strengths
          </h3>
          <ul className="space-y-2">
            {data.strengths.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-500" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Weaknesses */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4"
        >
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-yellow-400">
            Weaknesses
          </h3>
          <ul className="space-y-2">
            {data.weaknesses.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-yellow-500" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Risks */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-red-500/20 bg-red-500/5 p-4"
        >
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-red-400">
            Risks
          </h3>
          <ul className="space-y-3">
            {data.risks.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                <div>
                  <p className="text-sm text-gray-300">{item.risk}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    <span className="font-medium text-gray-500">Mitigation:</span> {item.mitigation}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4"
        >
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-blue-400">
            Recommendations
          </h3>
          <ul className="space-y-2">
            {data.recommendations.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
}
