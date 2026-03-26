"use client";

import React from "react";
import { useIdeaValidation } from "@/app/idea-validation/_context/IdeaValidationContext";
import WordCountTextarea from "./WordCountTextarea";

const CUSTOMER_PLACEHOLDER = `Example: Our primary customers are mid-size restaurants (₹10L-1Cr monthly revenue) and cloud kitchens in Hyderabad who currently buy vegetables from Bowenpally and Gudimalkapur mandis through middlemen. They are frustrated with inconsistent quality, price markups (30-40%), and unreliable supply. Secondary customers are farmers within 100km of Hyderabad who grow seasonal vegetables and currently sell at mandi at low prices.`;

export default function QuestionStep3() {
  const { state, setInput } = useIdeaValidation();

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Who is your target customer and where will you operate?
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Tell us who will pay for your product/service and where you plan to
          start. Be specific — &quot;everyone&quot; is not a customer.
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {/* Target customer textarea */}
        <WordCountTextarea
          value={state.inputs.target_customer}
          onChange={(v) => setInput("target_customer", v)}
          placeholder={CUSTOMER_PLACEHOLDER}
          wordLimit={200}
          warnThreshold={180}
        />

        {/* Location input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Primary Location / Geography
          </label>
          <input
            type="text"
            value={state.inputs.target_location}
            onChange={(e) => setInput("target_location", e.target.value)}
            placeholder="e.g., Hyderabad, India"
            className="w-full bg-[#0A0A0A] border border-white/10 focus:border-red-500/50 focus:outline-none rounded-xl px-4 py-3 text-white placeholder:text-gray-600 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
