"use client";

import { countWords } from "@/app/idea-validation/_lib/utils";

import React, { useMemo } from "react";
import { useIdeaValidation } from "@/app/idea-validation/_context/IdeaValidationContext";

const PLACEHOLDER = `Example: Farmers lose 25-40% of their income to middlemen at mandis. They have no direct access to bulk buyers like restaurants, which need consistent, fresh supply. On the other side, restaurants spend 2-3 hours daily at mandis, deal with price volatility, inconsistent quality, and lack traceability. There's no efficient, transparent marketplace connecting farmers directly to commercial food businesses in Tier-2 Indian cities.`;

const WORD_LIMIT = 200;
const WARN_THRESHOLD = 180;


export default function QuestionStep4() {
  const { state, setInput } = useIdeaValidation();
  const value = state.inputs.problem_statement;

  const wordCount = useMemo(() => countWords(value), [value]);
  const isNearLimit = wordCount > WARN_THRESHOLD;
  const isOverLimit = wordCount > WORD_LIMIT;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          What problem are you solving?
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Every successful business solves a real problem. What pain point do
          your customers face today? Why is the current situation not good
          enough?
        </p>
      </div>

      <div className="mt-8 space-y-2">
        <textarea
          value={value}
          onChange={(e) => setInput("problem_statement", e.target.value)}
          placeholder={PLACEHOLDER}
          className="w-full min-h-[200px] bg-[#0A0A0A] border border-white/10 focus:border-red-500/50 focus:outline-none rounded-2xl p-4 text-white placeholder:text-gray-600 resize-y transition-colors"
        />
        <div className="flex justify-end">
          <span
            className={`text-sm font-medium ${
              isOverLimit
                ? "text-red-400"
                : isNearLimit
                  ? "text-red-500"
                  : "text-gray-500"
            }`}
          >
            {wordCount} / {WORD_LIMIT} words
          </span>
        </div>
      </div>
    </div>
  );
}
