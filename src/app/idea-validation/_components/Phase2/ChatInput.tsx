"use client";

import React, { useState, useCallback } from "react";
import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Type your response...",
}: ChatInputProps) {
  const [value, setValue] = useState("");

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div className="bg-black/40 border-t border-white/10 p-4">
      <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder:text-gray-500 outline-none font-mono text-sm"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            disabled || !value.trim()
              ? "bg-red-600/50 opacity-50 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700 cursor-pointer"
          }`}
        >
          <ArrowUp className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
