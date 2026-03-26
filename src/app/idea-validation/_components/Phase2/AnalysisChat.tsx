"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIdeaValidation } from "@/app/idea-validation/_context/IdeaValidationContext";
import type { ChatMessage } from "@/app/idea-validation/_types";
import AnalysisLoader from "./AnalysisLoader";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMessage(role: "ai" | "user", content: string): ChatMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    timestamp: Date.now(),
  };
}

/** Small delay helper */
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// Question categories for conversational refinement
// ---------------------------------------------------------------------------

type QuestionCategory =
  | "target_audience"
  | "competitors"
  | "validation"
  | "unfair_advantage";

interface QuestionDef {
  category: QuestionCategory;
  question: string;
}

function pickQuestions(inputs: {
  target_customer: string;
  solution_differentiation: string;
  problem_statement: string;
  business_idea: string;
  target_location: string;
}): QuestionDef[] {
  const questions: QuestionDef[] = [];

  // Determine which question to ask first based on inputs
  const wordCount = (s: string) => s.trim().split(/\s+/).length;

  if (wordCount(inputs.target_customer) < 50) {
    questions.push({
      category: "target_audience",
      question: `You mentioned your target customers are **"${inputs.target_customer}"**. Can you narrow that down a bit more? For example, what specific segment within that group would be your ideal early adopters — think demographics, behaviors, or pain intensity. The more specific, the sharper our analysis will be.`,
    });
  }

  if (
    !inputs.solution_differentiation.toLowerCase().includes("competitor") &&
    !inputs.solution_differentiation.toLowerCase().includes("vs") &&
    !inputs.solution_differentiation.toLowerCase().includes("compared")
  ) {
    questions.push({
      category: "competitors",
      question: `I want to map your competitive landscape accurately. Who do you see as your **top 2-3 competitors** (direct or indirect) in ${inputs.target_location || "your target market"}? And what specifically makes your approach different from theirs?`,
    });
  }

  if (
    !inputs.problem_statement.toLowerCase().includes("interview") &&
    !inputs.problem_statement.toLowerCase().includes("talk") &&
    !inputs.problem_statement.toLowerCase().includes("survey") &&
    !inputs.problem_statement.toLowerCase().includes("validat")
  ) {
    questions.push({
      category: "validation",
      question: `Have you had any conversations with potential customers about this problem? Even informal chats count — I'm looking for any early signals like people saying "I'd pay for that" or showing strong interest. If yes, roughly how many people have you spoken with?`,
    });
  }

  questions.push({
    category: "unfair_advantage",
    question: `What's your **unfair advantage** here? This could be domain expertise, unique relationships, proprietary tech, or a personal experience that gives you a unique insight into this problem. What makes *you* the right person or team to build this?`,
  });

  return questions;
}

// ---------------------------------------------------------------------------
// Typing Indicator
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex justify-start"
    >
      <div className="bg-red-950/40 rounded-2xl px-4 py-3 rounded-bl-none border border-red-500/20 flex gap-1.5 items-center h-[44px]">
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
          className="w-1.5 h-1.5 bg-red-400 rounded-full"
        />
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }}
          className="w-1.5 h-1.5 bg-red-400 rounded-full"
        />
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }}
          className="w-1.5 h-1.5 bg-red-400 rounded-full"
        />
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// AnalysisChat Component
// ---------------------------------------------------------------------------

export default function AnalysisChat() {
  const { state, addChatMessage, setPhase } = useIdeaValidation();
  const { inputs, chatMessages } = state;

  const [showLoader, setShowLoader] = useState(() => chatMessages.length === 0);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [conversationRound, setConversationRound] = useState(() => {
    // Recover round from existing messages if user navigated away and back
    const userMessages = chatMessages.filter((m) => m.role === "user");
    return Math.min(userMessages.length, 3);
  });
  const [isComplete, setIsComplete] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const hasInitializedRef = useRef(chatMessages.length > 0);
  const questionsRef = useRef<QuestionDef[]>(pickQuestions(inputs));
  // Track which categories have been used
  const usedCategoriesRef = useRef<Set<QuestionCategory>>(new Set());

  // -----------------------------------------------------------------------
  // Auto-scroll to bottom when messages change or typing state changes
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatMessages, isAiTyping]);

  // -----------------------------------------------------------------------
  // Helper: send an AI message with typing simulation
  // -----------------------------------------------------------------------
  const sendAiMessage = useCallback(
    async (content: string, delayBefore = 1500) => {
      setIsAiTyping(true);
      await wait(delayBefore);
      const msg = createMessage("ai", content);
      addChatMessage(msg);
      setIsAiTyping(false);
      return msg;
    },
    [addChatMessage],
  );

  // -----------------------------------------------------------------------
  // Pick the next question, avoiding already-used categories
  // -----------------------------------------------------------------------
  const getNextQuestion = useCallback((): string => {
    const available = questionsRef.current.filter(
      (q) => !usedCategoriesRef.current.has(q.category),
    );
    if (available.length === 0) {
      // Fallback
      return "Is there anything else about your idea that you think would be important for me to know?";
    }
    const pick = available[0];
    usedCategoriesRef.current.add(pick.category);
    return pick.question;
  }, []);

  // -----------------------------------------------------------------------
  // Initial conversation flow after loader completes
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (showLoader || hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const contextLabel =
      inputs.context_type === "new_idea"
        ? "new idea"
        : inputs.context_type === "existing_business"
          ? "existing business"
          : inputs.context_type === "new_product"
            ? "new product"
            : inputs.context_type === "pivot"
              ? "pivot"
              : "idea";

    const summaryContent = `I've completed my initial analysis of your **${contextLabel}** idea. Here's what I found so far:\n\n**Business Idea:** ${inputs.business_idea || "Your concept"}\n**Target Market:** ${inputs.target_customer || "Not specified"} in ${inputs.target_location || "your chosen market"}\n**Core Problem:** ${inputs.problem_statement ? inputs.problem_statement.slice(0, 120) + (inputs.problem_statement.length > 120 ? "..." : "") : "Not specified"}\n\nI've identified some promising market signals and a few areas that need deeper exploration. I have a few questions to refine my analysis...`;

    let cancelled = false;

    (async () => {
      // Send summary
      await sendAiMessage(summaryContent, 1000);
      if (cancelled) return;

      // Send first clarifying question after a short pause
      const firstQuestion = getNextQuestion();
      await sendAiMessage(firstQuestion, 1500);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLoader]);

  // -----------------------------------------------------------------------
  // Handle user message
  // -----------------------------------------------------------------------
  const handleUserSend = useCallback(
    async (text: string) => {
      if (isComplete || isAiTyping) return;

      // Add user message
      const userMsg = createMessage("user", text);
      addChatMessage(userMsg);

      const nextRound = conversationRound + 1;
      setConversationRound(nextRound);

      if (nextRound >= 2) {
        // Final summary — conversation is done
        setIsComplete(true);

        const finalContent = `Excellent! I now have a comprehensive understanding of your idea. Here's what I've captured:\n\n✓ **Business concept:** ${inputs.business_idea || "Your idea"}\n✓ **Target market:** ${inputs.target_customer || "Your target audience"} in ${inputs.target_location || "your market"}\n✓ **Key problem:** ${inputs.problem_statement ? inputs.problem_statement.slice(0, 80) + "..." : "As described"}\n✓ **Differentiation:** ${inputs.solution_differentiation ? inputs.solution_differentiation.slice(0, 80) + "..." : "As described"}\n✓ **Refined insights from our conversation**\n\nGenerating your detailed reports now...`;

        await sendAiMessage(finalContent, 1500);

        // Transition to Phase 3 after a short delay
        await wait(2000);
        setPhase(3);
      } else {
        // Ask next question
        const acknowledgments = [
          "That's really helpful context, thank you!",
          "Great, that gives me a much clearer picture.",
          "Perfect, that's exactly what I needed to sharpen the analysis.",
        ];
        const ack =
          acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
        const nextQ = getNextQuestion();
        const aiContent = `${ack}\n\n${nextQ}`;
        await sendAiMessage(aiContent, 1500);
      }
    },
    [
      isComplete,
      isAiTyping,
      conversationRound,
      addChatMessage,
      sendAiMessage,
      getNextQuestion,
      inputs,
      setPhase,
    ],
  );

  // -----------------------------------------------------------------------
  // Loader complete handler
  // -----------------------------------------------------------------------
  const handleLoaderComplete = useCallback(() => {
    setShowLoader(false);
  }, []);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  if (showLoader) {
    return <AnalysisLoader onComplete={handleLoaderComplete} />;
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-full">
      {/* Window chrome */}
      <div className="bg-[#0A0A0A] rounded-2xl border border-white/10 overflow-hidden flex flex-col min-h-[60vh]">
        {/* Header bar */}
        <div className="bg-black/40 px-4 py-3 border-b border-white/10 flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs text-gray-500 font-mono ml-2">
            AI Analysis Terminal
          </span>
        </div>

        {/* Chat messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          <AnimatePresence mode="popLayout">
            {chatMessages.map((msg, idx) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                isLatest={idx === chatMessages.length - 1}
              />
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>{isAiTyping && <TypingIndicator />}</AnimatePresence>
        </div>

        {/* Input */}
        <ChatInput
          onSend={handleUserSend}
          disabled={isAiTyping || isComplete}
          placeholder={
            isComplete
              ? "Analysis complete — generating reports..."
              : "Type your response..."
          }
        />
      </div>
    </div>
  );
}
