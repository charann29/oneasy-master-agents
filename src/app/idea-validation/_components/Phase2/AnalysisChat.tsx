"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIdeaValidation } from "@/app/idea-validation/_context/IdeaValidationContext";
import type { ChatMessage } from "@/app/idea-validation/_types";
import {
  getInitialSummary,
  getClarifyingQuestions,
  getFinalSummary,
  type ConversationQuestion,
} from "@/app/idea-validation/_lib/conversationEngine";
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
// Map question categories to refinement fields
// ---------------------------------------------------------------------------

function storeRefinementFromResponse(
  category: string,
  userResponse: string,
  setRefinements: (r: Record<string, string>) => void,
  currentAdditionalContext: string,
) {
  switch (category) {
    case "target_audience":
      setRefinements({ target_narrowed: userResponse });
      break;
    case "competitors":
      setRefinements({ differentiation_clarified: userResponse });
      break;
    case "validation":
    case "unfair_advantage":
      // Append rather than overwrite so both validation and unfair_advantage
      // answers are preserved if both categories are asked.
      setRefinements({
        additional_context: currentAdditionalContext
          ? `${currentAdditionalContext}. ${userResponse}`
          : userResponse,
      });
      break;
  }
}

// ---------------------------------------------------------------------------
// AnalysisChat Component
// ---------------------------------------------------------------------------

export default function AnalysisChat() {
  const { state, addChatMessage, setPhase, setRefinements } = useIdeaValidation();
  const { inputs, chatMessages } = state;

  const [showLoader, setShowLoader] = useState(() => chatMessages.length === 0);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Use refs for conversation tracking to avoid stale closure issues
  const roundRef = useRef(
    Math.min(chatMessages.filter((m) => m.role === "user").length, 3),
  );

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const hasInitializedRef = useRef(chatMessages.length > 0);
  const additionalContextRef = useRef(state.refinements.additional_context);

  // Get questions from the conversation engine
  const questionsRef = useRef<ConversationQuestion[]>(
    getClarifyingQuestions(inputs),
  );

  // Reconstruct used categories from restored chat history so we don't
  // repeat questions after a page refresh during Phase 2.
  const usedCategoriesRef = useRef<Set<string>>(
    (() => {
      const set = new Set<string>();
      if (chatMessages.length > 0) {
        const questions = getClarifyingQuestions(inputs);
        // Each AI message that matches a question's text means that category was used
        const aiMessages = chatMessages.filter((m) => m.role === "ai").map((m) => m.content);
        for (const q of questions) {
          if (aiMessages.some((msg) => msg.includes(q.question))) {
            set.add(q.category);
          }
        }
      }
      return set;
    })(),
  );

  // Keep additional context ref in sync with state
  useEffect(() => {
    additionalContextRef.current = state.refinements.additional_context;
  }, [state.refinements.additional_context]);

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
  const getNextQuestion = useCallback((): ConversationQuestion => {
    const available = questionsRef.current.filter(
      (q) => !usedCategoriesRef.current.has(q.category),
    );
    if (available.length === 0) {
      return {
        category: "general",
        question:
          "Is there anything else about your idea that you think would be important for me to know?",
      };
    }
    const pick = available[0];
    usedCategoriesRef.current.add(pick.category);
    return pick;
  }, []);

  // -----------------------------------------------------------------------
  // Initial conversation flow after loader completes
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (showLoader || hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    // Use conversation engine for initial summary
    const summaryContent = getInitialSummary(inputs);

    let cancelled = false;

    (async () => {
      // Send summary
      await sendAiMessage(summaryContent, 1000);
      if (cancelled) return;

      // Send first clarifying question after a short pause
      const firstQ = getNextQuestion();
      await sendAiMessage(firstQ.question, 1500);
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

      // Store the user's response as a refinement based on the last question category
      const lastUsedCategories = Array.from(usedCategoriesRef.current);
      const lastCategory = lastUsedCategories[lastUsedCategories.length - 1];
      if (lastCategory) {
        storeRefinementFromResponse(
          lastCategory,
          text,
          setRefinements,
          additionalContextRef.current,
        );
      }

      const nextRound = roundRef.current + 1;
      roundRef.current = nextRound;

      if (nextRound >= 2) {
        // Final summary — conversation is done
        setIsComplete(true);

        // Use conversation engine for final summary
        const finalContent = getFinalSummary(inputs);
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
        const aiContent = `${ack}\n\n${nextQ.question}`;
        await sendAiMessage(aiContent, 1500);
      }
    },
    [
      isComplete,
      isAiTyping,
      addChatMessage,
      sendAiMessage,
      getNextQuestion,
      inputs,
      setPhase,
      setRefinements,
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
            {chatMessages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
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
