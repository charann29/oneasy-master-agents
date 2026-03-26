"use client";

import React from "react";
import { useIdeaValidation } from "@/app/idea-validation/_context/IdeaValidationContext";
import WordCountTextarea from "./WordCountTextarea";

const PLACEHOLDER = `Example: Farmers lose 25-40% of their income to middlemen at mandis. They have no direct access to bulk buyers like restaurants, which need consistent, fresh supply. On the other side, restaurants spend 2-3 hours daily at mandis, deal with price volatility, inconsistent quality, and lack traceability. There's no efficient, transparent marketplace connecting farmers directly to commercial food businesses in Tier-2 Indian cities.`;

export default function QuestionStep4() {
  const { state, setInput } = useIdeaValidation();

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

      <div className="mt-8">
        <WordCountTextarea
          value={state.inputs.problem_statement}
          onChange={(v) => setInput("problem_statement", v)}
          placeholder={PLACEHOLDER}
          wordLimit={200}
          warnThreshold={180}
        />
      </div>
    </div>
  );
}
