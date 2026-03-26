"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck,
  BarChart3,
  Users,
  MessageSquare,
  Layout,
  AlertCircle,
} from "lucide-react";
import { useIdeaValidation } from "@/app/idea-validation/_context/IdeaValidationContext";
import ValidationScorecard from "./ValidationScorecard";
import MarketAnalysisReport from "./MarketAnalysisReport";
import CompetitorAnalysisReport from "./CompetitorAnalysisReport";
import PositioningStatement from "./PositioningStatement";
import PitchDeckContent from "./PitchDeckContent";

const tabs = [
  { id: "validation", label: "Validation", icon: ClipboardCheck },
  { id: "market", label: "Market Analysis", icon: BarChart3 },
  { id: "competitors", label: "Competitors", icon: Users },
  { id: "positioning", label: "Positioning", icon: MessageSquare },
  { id: "pitch_deck", label: "Pitch Deck", icon: Layout },
] as const;

type TabId = (typeof tabs)[number]["id"];

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-400 bg-green-500/10 border-green-500/30";
  if (score >= 60) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
  if (score >= 40) return "text-orange-400 bg-orange-500/10 border-orange-500/30";
  return "text-red-400 bg-red-500/10 border-red-500/30";
}

export default function ReportsDashboard() {
  const { state } = useIdeaValidation();
  const [activeTab, setActiveTab] = useState<TabId>("validation");

  const { outputs } = state;

  // Loading / error state
  if (!outputs) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#0A0A0A] px-6 py-20 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-gray-600" />
        <h3 className="text-lg font-bold text-white">No Report Data Available</h3>
        <p className="mt-2 text-sm text-gray-400">
          Complete the analysis to view your validation reports.
        </p>
      </div>
    );
  }

  const score = outputs.validation.score;
  const scoreColorClasses = getScoreColor(score);

  return (
    <div className="space-y-6">
      {/* Header with score badge */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Output Reports</h2>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold ${scoreColorClasses}`}
        >
          Score: {score}/100
        </span>
      </div>

      {/* Tab Bar */}
      <div className="overflow-x-auto border-b border-white/10">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-red-500 bg-red-500/5 text-red-500"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === "validation" && (
            <ValidationScorecard data={outputs.validation} />
          )}
          {activeTab === "market" && (
            <MarketAnalysisReport data={outputs.market} />
          )}
          {activeTab === "competitors" && (
            <CompetitorAnalysisReport data={outputs.competitors} />
          )}
          {activeTab === "positioning" && (
            <PositioningStatement positioning={outputs.positioning} />
          )}
          {activeTab === "pitch_deck" && (
            <PitchDeckContent data={outputs.pitch_deck} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
