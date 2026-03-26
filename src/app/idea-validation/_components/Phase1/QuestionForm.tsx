"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useIdeaValidation } from "@/app/idea-validation/_context/IdeaValidationContext";
import StepIndicator from "./StepIndicator";
import QuestionStep1 from "./QuestionStep1";
import QuestionStep2 from "./QuestionStep2";
import QuestionStep3 from "./QuestionStep3";
import QuestionStep4 from "./QuestionStep4";
import QuestionStep5 from "./QuestionStep5";

const TOTAL_STEPS = 5;

/**
 * Returns a validation error message for the given step, or null if valid.
 */
function getValidationError(
  step: number,
  inputs: {
    context_type: string;
    business_idea: string;
    target_customer: string;
    target_location: string;
    problem_statement: string;
    solution_differentiation: string;
  },
): string | null {
  switch (step) {
    case 1:
      return inputs.context_type
        ? null
        : "Please select an option to continue.";
    case 2:
      return inputs.business_idea.trim()
        ? null
        : "Please describe your business idea to continue.";
    case 3:
      if (!inputs.target_customer.trim())
        return "Please describe your target customer to continue.";
      if (!inputs.target_location.trim())
        return "Please enter your target location to continue.";
      return null;
    case 4:
      return inputs.problem_statement.trim()
        ? null
        : "Please describe the problem you're solving to continue.";
    case 5:
      return inputs.solution_differentiation.trim()
        ? null
        : "Please describe your solution and what makes it different.";
    default:
      return null;
  }
}

const stepComponents: Record<number, React.FC> = {
  1: QuestionStep1,
  2: QuestionStep2,
  3: QuestionStep3,
  4: QuestionStep4,
  5: QuestionStep5,
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

export default function QuestionForm() {
  const { state, nextStep, prevStep, setPhase } = useIdeaValidation();
  const { currentStep, inputs } = state;

  const [error, setError] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const [direction, setDirection] = useState(1);

  const handleNext = useCallback(() => {
    const validationError = getValidationError(currentStep, inputs);

    if (validationError) {
      setError(validationError);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      return;
    }

    setError(null);

    if (currentStep === TOTAL_STEPS) {
      setPhase(2);
    } else {
      setDirection(1);
      nextStep();
    }
  }, [currentStep, inputs, nextStep, setPhase]);

  const handleBack = useCallback(() => {
    setError(null);
    setDirection(-1);
    prevStep();
  }, [prevStep]);

  const StepComponent = stepComponents[currentStep];
  const isLastStep = currentStep === TOTAL_STEPS;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
      {/* Step indicator */}
      <div className="mb-10">
        <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      </div>

      {/* Step content with animation */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {StepComponent && <StepComponent />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Validation error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{
              opacity: 1,
              y: 0,
              x: shaking ? [0, -6, 6, -4, 4, 0] : 0,
            }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="mt-4 text-center"
          >
            <p className="text-red-500 text-sm font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="mt-10 flex items-center justify-between">
        {/* Back button */}
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        ) : (
          <div />
        )}

        {/* Next / Generate button */}
        <button
          type="button"
          onClick={handleNext}
          className="group relative px-8 py-3 rounded-xl font-bold text-white overflow-hidden shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_40px_rgba(220,38,38,0.5)] transition-shadow cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 transition-transform group-hover:scale-105" />
          <div className="relative flex items-center gap-2 text-sm">
            {isLastStep ? (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Analysis
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
