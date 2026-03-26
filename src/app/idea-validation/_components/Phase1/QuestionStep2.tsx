"use client";

import { countWords } from "@/app/idea-validation/_lib/utils";

import React, { useMemo } from "react";
import { useIdeaValidation } from "@/app/idea-validation/_context/IdeaValidationContext";

const PLACEHOLDER = `Example: FarmConnect is an online B2B marketplace that directly connects small and mid-size farmers with restaurants, cloud kitchens, and grocery retailers in Hyderabad. Farmers list their produce with prices, and buyers place orders for next-day delivery. We handle logistics through a network of mini-trucks. Revenue model: 8% commission on every transaction + optional premium listing for farmers. We start with vegetables and fruits, expanding to dairy and grains in Phase 2.`;

const WORD_LIMIT = 500;
const WARN_THRESHOLD = 450;


export default function QuestionStep2() {
  const { state, setInput } = useIdeaValidation();
  const value = state.inputs.business_idea;

  const wordCount = useMemo(() => countWords(value), [value]);
  const isNearLimit = wordCount > WARN_THRESHOLD;
  const isOverLimit = wordCount > WORD_LIMIT;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Tell us about your business idea
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Describe what you&apos;re building, what product or service you&apos;ll
          offer, and how it will work. Be as detailed as possible — the more you
          share, the better our analysis.
        </p>
      </div>

      <div className="mt-8 space-y-2">
        <textarea
          value={value}
          onChange={(e) => setInput("business_idea", e.target.value)}
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
