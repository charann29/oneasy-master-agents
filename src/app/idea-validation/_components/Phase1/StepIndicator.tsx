"use client";

import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

const STEP_LABELS = ["Context", "Your Idea", "Target", "Problem", "Solution"];

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

export default function StepIndicator({
  currentStep,
  totalSteps = 5,
}: StepIndicatorProps) {
  const steps = STEP_LABELS.slice(0, totalSteps);

  return (
    <>
      {/* Desktop indicator */}
      <div className="hidden sm:flex items-center justify-center w-full">
        {steps.map((label, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;

          return (
            <React.Fragment key={stepNum}>
              {/* Step circle + label */}
              <div className="flex flex-col items-center gap-2">
                <motion.div
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold transition-colors ${
                    isCompleted
                      ? "bg-red-500 text-white"
                      : isActive
                        ? "border-2 border-red-500 text-red-500 bg-transparent"
                        : "bg-gray-700 text-gray-500"
                  }`}
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
                    >
                      <Check className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    stepNum
                  )}
                </motion.div>
                <span
                  className={`text-xs font-medium whitespace-nowrap ${
                    isCompleted
                      ? "text-red-500"
                      : isActive
                        ? "text-red-500"
                        : "text-gray-500"
                  }`}
                >
                  {label}
                </span>
              </div>

              {/* Connecting line */}
              {stepNum < totalSteps && (
                <div className="relative mx-2 flex-1 max-w-[80px] h-[2px] bg-gray-700 rounded-full overflow-hidden self-start mt-5">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-red-500 rounded-full"
                    initial={false}
                    animate={{
                      width: isCompleted ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Mobile indicator */}
      <div className="flex sm:hidden flex-col items-center gap-3 w-full">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-red-500">
            Step {currentStep}
          </span>
          <span className="text-sm text-gray-500">of {totalSteps}</span>
          <span className="text-sm font-medium text-white">
            — {steps[currentStep - 1]}
          </span>
        </div>
        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-red-500 rounded-full"
            initial={false}
            animate={{
              width: `${(currentStep / totalSteps) * 100}%`,
            }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </div>
      </div>
    </>
  );
}
