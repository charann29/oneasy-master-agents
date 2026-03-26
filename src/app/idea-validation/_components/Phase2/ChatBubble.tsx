"use client";

import React from "react";
import { motion } from "framer-motion";
import type { ChatMessage } from "@/app/idea-validation/_types";

interface ChatBubbleProps {
  message: ChatMessage;
}

/** Render a single line of chat content with basic markdown‑like formatting. */
function renderLine(line: string, idx: number): React.ReactNode {
  // Bullet / list items
  const bulletMatch = line.match(/^(\s*[-*])\s+(.*)/);
  const numberedMatch = line.match(/^(\s*\d+[.)]\s*)(.*)/);
  // Lines starting with a checkmark symbol (✓ ✔ ☑)
  const checkMatch = line.match(/^(\s*[✓✔☑])\s*(.*)/);

  let content: string;
  let prefix: React.ReactNode = null;

  if (bulletMatch) {
    content = bulletMatch[2];
    prefix = <span className="mr-2 text-red-400">•</span>;
  } else if (numberedMatch) {
    content = numberedMatch[2];
    prefix = <span className="mr-2 text-red-400">{numberedMatch[1].trim()}</span>;
  } else if (checkMatch) {
    content = checkMatch[2];
    prefix = <span className="mr-2 text-green-400">✓</span>;
  } else {
    content = line;
  }

  // Bold text: **text**
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  const rendered = parts.map((part, i) => {
    const boldMatch = part.match(/^\*\*(.+)\*\*$/);
    if (boldMatch) {
      return <strong key={i} className="font-semibold">{boldMatch[1]}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });

  return (
    <div key={idx} className={`${prefix ? "flex items-start pl-2" : ""}`}>
      {prefix}
      <span>{rendered}</span>
    </div>
  );
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isAi = message.role === "ai";
  const lines = message.content.split("\n");

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
      className={`flex ${isAi ? "justify-start" : "justify-end"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isAi
            ? "bg-red-950/40 text-red-100 rounded-bl-none border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
            : "bg-white/10 text-white rounded-br-none border border-white/5"
        }`}
      >
        {lines.map((line, idx) => {
          if (line.trim() === "") {
            return <div key={idx} className="h-2" />;
          }
          return renderLine(line, idx);
        })}
      </div>
    </motion.div>
  );
}
