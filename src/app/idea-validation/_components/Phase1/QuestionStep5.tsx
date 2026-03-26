"use client";

import React, { useMemo } from "react";
import { useIdeaValidation } from "@/app/idea-validation/_context/IdeaValidationContext";

const PLACEHOLDER = `Example: FarmConnect solves this by providing a simple WhatsApp + web-based ordering system where restaurants can browse available produce from verified farmers, compare prices, and order for next-day delivery. Unlike Ninjacart or DeHaat (who focus on large-scale supply chain), we focus on hyperlocal Hyderabad market with personal relationship managers for every buyer. Our 8% commission is lower than the 30-40% mandi middleman cut, creating a win-win. Defensible moat: network effects — more farmers attract more buyers and vice versa — plus exclusive supply contracts with farmer cooperatives.`;

const WORD_LIMIT = 300;
const WARN_THRESHOLD = 270;

function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
}

export default function QuestionStep5() {
  const { state, setInput } = useIdeaValidation();
  const value = state.inputs.solution_differentiation;

  const wordCount = useMemo(() => countWords(value), [value]);
  const isNearLimit = wordCount > WARN_THRESHOLD;
  const isOverLimit = wordCount > WORD_LIMIT;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          How does your solution solve this problem, and what makes it different?
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Explain how your product/service addresses the problem AND why
          customers would choose you over current alternatives.
        </p>
      </div>

      <div className="mt-8 space-y-2">
        <textarea
          value={value}
          onChange={(e) =>
            setInput("solution_differentiation", e.target.value)
          }
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
