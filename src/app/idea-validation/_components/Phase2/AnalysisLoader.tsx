"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Users,
  Target,
  CheckCircle,
  Rocket,
  Search,
  Loader2,
} from "lucide-react";

interface AnalysisLoaderProps {
  onComplete: () => void;
}

interface AnalysisItem {
  label: string;
  icon: React.ElementType;
}

const ITEMS: AnalysisItem[] = [
  { label: "Market Research", icon: TrendingUp },
  { label: "Competitor Mapping", icon: Users },
  { label: "Target Audience Analysis", icon: Target },
  { label: "Problem Validation", icon: CheckCircle },
  { label: "GTM Strategy Draft", icon: Rocket },
  { label: "Gap Identification", icon: Search },
];

export default function AnalysisLoader({ onComplete }: AnalysisLoaderProps) {
  const [completedCount, setCompletedCount] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    ITEMS.forEach((_, index) => {
      const timer = setTimeout(() => {
        if (cancelled) return;
        setCompletedCount((prev) => prev + 1);
      }, (index + 1) * 1000);
      timers.push(timer);
    });

    // After all items complete, wait 1 second then call onComplete
    const finalTimer = setTimeout(() => {
      if (cancelled) return;
      onCompleteRef.current();
    }, ITEMS.length * 1000 + 1000);
    timers.push(finalTimer);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full bg-[#0A0A0A] rounded-2xl border border-white/10 p-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Analyzing your idea...
          </h2>
          <p className="text-gray-400 text-sm">
            Our AI is researching your market, competitors, and opportunities
          </p>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {ITEMS.map((item, index) => {
              const isComplete = index < completedCount;
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-500 ${
                      isComplete
                        ? "bg-green-500/20"
                        : "bg-white/5"
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Icon className="w-4 h-4 text-gray-500" />
                    )}
                  </div>

                  <span
                    className={`text-sm font-medium transition-colors duration-500 ${
                      isComplete ? "text-green-400" : "text-gray-500"
                    }`}
                  >
                    {item.label}
                  </span>

                  <div className="ml-auto">
                    {isComplete ? (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-xs text-green-400 font-medium"
                      >
                        Complete
                      </motion.span>
                    ) : (
                      <span className="text-xs text-gray-500 flex items-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Analyzing...
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="mt-8">
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-red-600 rounded-full"
              initial={{ width: "0%" }}
              animate={{
                width: `${(completedCount / ITEMS.length) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
