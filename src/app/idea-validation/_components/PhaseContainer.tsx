"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useIdeaValidation } from "@/app/idea-validation/_context/IdeaValidationContext";
import { generateReports } from "@/app/idea-validation/_lib/generateReports";
import QuestionForm from "./Phase1/QuestionForm";
import AnalysisChat from "./Phase2/AnalysisChat";
import ReportsDashboard from "./Phase3/ReportsDashboard";

// ---------------------------------------------------------------------------
// Phase metadata
// ---------------------------------------------------------------------------

const phaseNames: Record<1 | 2 | 3, string> = {
  1: "Questions",
  2: "AI Analysis",
  3: "Reports",
};

// ---------------------------------------------------------------------------
// Phase dot indicator
// ---------------------------------------------------------------------------

function PhaseDot({ phase, current }: { phase: 1 | 2 | 3; current: 1 | 2 | 3 }) {
  const isCompleted = phase < current;
  const isCurrent = phase === current;

  return (
    <span className="relative flex h-2.5 w-2.5">
      {isCurrent && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
      )}
      <span
        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
          isCompleted || isCurrent ? "bg-red-500" : "bg-gray-700"
        }`}
      />
    </span>
  );
}

// ---------------------------------------------------------------------------
// PhaseContainer
// ---------------------------------------------------------------------------

export default function PhaseContainer() {
  const { state, setOutputs, resetAll, setPhase } = useIdeaValidation();
  const { currentPhase, inputs, refinements, outputs } = state;
  const generatingRef = useRef(false);

  // Generate reports when transitioning to Phase 3 and outputs are not yet set
  useEffect(() => {
    if (currentPhase === 3 && outputs === null && !generatingRef.current) {
      generatingRef.current = true;
      const result = generateReports(inputs, refinements);
      setOutputs(result);
      generatingRef.current = false;
    }
  }, [currentPhase, outputs, inputs, refinements, setOutputs]);

  const handleStartOver = () => {
    resetAll(); // resets state to initialState which already has currentPhase: 1
  };

  return (
    <>
      {/* ── Top navigation bar ── */}
      <nav className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-black/50 px-4 backdrop-blur-lg sm:px-6">
        {/* Left: OnEasy branding */}
        <Link href="/" className="text-lg font-bold tracking-tight text-white">
          On<span className="text-red-500">Easy</span>
        </Link>

        {/* Center: Phase indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {([1, 2, 3] as const).map((p) => (
              <PhaseDot key={p} phase={p} current={currentPhase} />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-300">
            Phase {currentPhase}: {phaseNames[currentPhase]}
          </span>
        </div>

        {/* Right: Start Over (only in Phase 2 & 3) */}
        {currentPhase > 1 ? (
          <button
            type="button"
            onClick={handleStartOver}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-400 transition-colors hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
            Start Over
          </button>
        ) : (
          <div className="w-[104px]" /> /* spacer to keep center alignment */
        )}
      </nav>

      {/* ── Phase content ── */}
      <div className="px-4 pb-12 pt-6 sm:px-6">
        <AnimatePresence mode="wait">
          {currentPhase === 1 && (
            <motion.div
              key="phase-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <QuestionForm />
            </motion.div>
          )}

          {currentPhase === 2 && (
            <motion.div
              key="phase-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AnalysisChat />
            </motion.div>
          )}

          {currentPhase === 3 && (
            <motion.div
              key="phase-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mx-auto max-w-5xl"
            >
              <ReportsDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
