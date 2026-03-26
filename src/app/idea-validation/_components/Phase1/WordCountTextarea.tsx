"use client";

import React, { useMemo } from "react";
import { countWords } from "@/app/idea-validation/_lib/utils";

interface WordCountTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  wordLimit: number;
  warnThreshold?: number;
}

/**
 * Textarea with a word-count indicator that changes color near/over the limit.
 * Used by QuestionStep2-5 to avoid duplicating the counting + styling logic.
 */
export default function WordCountTextarea({
  value,
  onChange,
  placeholder,
  wordLimit,
  warnThreshold,
}: WordCountTextareaProps) {
  const warn = warnThreshold ?? Math.floor(wordLimit * 0.9);
  const words = useMemo(() => countWords(value), [value]);
  const isNearLimit = words > warn;
  const isOverLimit = words > wordLimit;

  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
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
          {words} / {wordLimit} words
        </span>
      </div>
    </div>
  );
}
