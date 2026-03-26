"use client";

import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, Package, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useIdeaValidation } from "@/app/idea-validation/_context/IdeaValidationContext";
import type { ContextType } from "@/app/idea-validation/_types";

interface CardOption {
  icon: LucideIcon;
  title: string;
  description: string;
  value: ContextType;
}

const OPTIONS: CardOption[] = [
  {
    icon: Lightbulb,
    title: "Validate a New Idea",
    description: "I want to validate a NEW BUSINESS IDEA before I start",
    value: "new_idea",
  },
  {
    icon: TrendingUp,
    title: "Analyze Existing Business",
    description:
      "I want to analyze my EXISTING BUSINESS and find growth opportunities",
    value: "existing_business",
  },
  {
    icon: Package,
    title: "New Product/Service",
    description:
      "I want to explore a NEW PRODUCT/SERVICE for my existing business",
    value: "new_product",
  },
  {
    icon: RefreshCw,
    title: "Pivot My Business",
    description:
      "I want to PIVOT my current business to a new direction",
    value: "pivot",
  },
];

export default function QuestionStep1() {
  const { state, setInput } = useIdeaValidation();
  const selected = state.inputs.context_type;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          What brings you here today?
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Understanding whether this is a new idea or an existing business helps
          us tailor the analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        {OPTIONS.map((option) => {
          const isSelected = selected === option.value;
          const Icon = option.icon;

          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => setInput("context_type", option.value)}
              className={`relative flex flex-col items-start gap-3 p-6 rounded-2xl border text-left transition-colors cursor-pointer ${
                isSelected
                  ? "border-red-500/40 bg-red-500/10 shadow-[0_0_30px_rgba(239,68,68,0.15)]"
                  : "border-white/10 bg-[#0A0A0A] hover:border-white/20 hover:bg-[#111]"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              animate={{
                scale: isSelected ? 1.02 : 1,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div
                className={`p-3 rounded-xl ${
                  isSelected ? "bg-red-500/20" : "bg-white/5"
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isSelected ? "text-red-500" : "text-gray-400"
                  }`}
                />
              </div>
              <div>
                <h3
                  className={`text-lg font-bold ${
                    isSelected ? "text-white" : "text-gray-200"
                  }`}
                >
                  {option.title}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  {option.description}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
