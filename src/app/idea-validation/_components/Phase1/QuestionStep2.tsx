"use client";

import React from "react";
import { useIdeaValidation } from "@/app/idea-validation/_context/IdeaValidationContext";
import WordCountTextarea from "./WordCountTextarea";

const PLACEHOLDER = `Example: FarmConnect is an online B2B marketplace that directly connects small and mid-size farmers with restaurants, cloud kitchens, and grocery retailers in Hyderabad. Farmers list their produce with prices, and buyers place orders for next-day delivery. We handle logistics through a network of mini-trucks. Revenue model: 8% commission on every transaction + optional premium listing for farmers. We start with vegetables and fruits, expanding to dairy and grains in Phase 2.`;

export default function QuestionStep2() {
  const { state, setInput } = useIdeaValidation();

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

      <div className="mt-8">
        <WordCountTextarea
          value={state.inputs.business_idea}
          onChange={(v) => setInput("business_idea", v)}
          placeholder={PLACEHOLDER}
          wordLimit={500}
          warnThreshold={450}
        />
      </div>
    </div>
  );
}
