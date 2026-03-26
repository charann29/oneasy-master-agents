"use client";

import { motion } from "framer-motion";
import { useIdeaValidation } from "@/app/idea-validation/_context/IdeaValidationContext";
import { containerVariants, itemVariants } from "@/app/idea-validation/_lib/animations";

interface PositioningStatementProps {
  positioning: string;
}

const breakdownItems = [
  { label: "Company", colorClass: "bg-red-500/10 border-red-500/30 text-red-400" },
  { label: "Category", colorClass: "bg-blue-500/10 border-blue-500/30 text-blue-400" },
  { label: "Target Customer", colorClass: "bg-green-500/10 border-green-500/30 text-green-400" },
  { label: "Problem", colorClass: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" },
  { label: "Unique Approach", colorClass: "bg-purple-500/10 border-purple-500/30 text-purple-400" },
  { label: "Competitor Limitation", colorClass: "bg-orange-500/10 border-orange-500/30 text-orange-400" },
] as const;

export default function PositioningStatement({ positioning }: PositioningStatementProps) {
  const { state } = useIdeaValidation();
  const { inputs } = state;

  // Map breakdown items to actual values from inputs
  const breakdownValues: Record<string, string> = {
    Company: inputs.business_idea || "Your Company",
    Category: inputs.context_type
      ? inputs.context_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Your Category",
    "Target Customer": inputs.target_customer || "Your Target Customer",
    Problem: inputs.problem_statement || "The Problem You Solve",
    "Unique Approach": inputs.solution_differentiation || "Your Unique Approach",
    "Competitor Limitation": "What competitors fail to address",
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Statement Display */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-8"
      >
        <span className="font-serif text-6xl leading-none text-red-500/30">&ldquo;</span>
        <p className="mt-2 text-xl font-medium italic leading-relaxed text-white md:text-2xl">
          {positioning}
        </p>
      </motion.div>

      {/* Statement Breakdown */}
      <motion.div variants={itemVariants}>
        <h3 className="mb-4 text-xl font-bold text-white">Statement Breakdown</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {breakdownItems.map(({ label, colorClass }) => (
            <div
              key={label}
              className={`rounded-xl border p-4 ${colorClass}`}
            >
              <p className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</p>
              <p className="mt-1 text-sm font-medium text-white">
                {breakdownValues[label]}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
