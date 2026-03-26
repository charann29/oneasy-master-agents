"use client";

import React from "react";
import { useIdeaValidation } from "@/app/idea-validation/_context/IdeaValidationContext";
import WordCountTextarea from "./WordCountTextarea";

const PLACEHOLDER = `Example: FarmConnect solves this by providing a simple WhatsApp + web-based ordering system where restaurants can browse available produce from verified farmers, compare prices, and order for next-day delivery. Unlike Ninjacart or DeHaat (who focus on large-scale supply chain), we focus on hyperlocal Hyderabad market with personal relationship managers for every buyer. Our 8% commission is lower than the 30-40% mandi middleman cut, creating a win-win. Defensible moat: network effects — more farmers attract more buyers and vice versa — plus exclusive supply contracts with farmer cooperatives.`;

export default function QuestionStep5() {
  const { state, setInput } = useIdeaValidation();

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

      <div className="mt-8">
        <WordCountTextarea
          value={state.inputs.solution_differentiation}
          onChange={(v) => setInput("solution_differentiation", v)}
          placeholder={PLACEHOLDER}
          wordLimit={300}
          warnThreshold={270}
        />
      </div>
    </div>
  );
}
