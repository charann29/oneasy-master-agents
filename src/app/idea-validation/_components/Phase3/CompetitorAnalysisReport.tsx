"use client";

import { containerVariants, itemVariants } from "@/app/idea-validation/_lib/animations";

import { motion } from "framer-motion";
import { Globe, MapPin, Building2, CheckCircle, Shield } from "lucide-react";
import type { Competitor, CompetitorAnalysis } from "@/app/idea-validation/_types";

interface CompetitorAnalysisReportProps {
  data: CompetitorAnalysis;
}



function CompetitorCard({ competitor }: { competitor: Competitor }) {
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-xl border border-white/10 bg-[#0A0A0A] p-5"
    >
      <h4 className="font-bold text-white">{competitor.name}</h4>
      <p className="mt-1 text-sm text-gray-400">{competitor.description}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-300">
          {competitor.funding}
        </span>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-300">
          {competitor.scale}
        </span>
      </div>

      <p className="mt-3 text-sm italic text-gray-500">
        <span className="font-medium not-italic text-red-400">Gap:</span> {competitor.gap}
      </p>
    </motion.div>
  );
}

function CompetitorSection({
  title,
  icon: Icon,
  competitors,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  competitors: Competitor[];
}) {
  if (competitors.length === 0) return null;

  return (
    <motion.div variants={itemVariants} className="space-y-4">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-red-500" />
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {competitors.map((competitor, i) => (
          <CompetitorCard key={i} competitor={competitor} />
        ))}
      </div>
    </motion.div>
  );
}

export default function CompetitorAnalysisReport({ data }: CompetitorAnalysisReportProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <CompetitorSection
        title="Global Competitors"
        icon={Globe}
        competitors={data.global}
      />

      <CompetitorSection
        title="Regional Competitors - India"
        icon={MapPin}
        competitors={data.regional}
      />

      <CompetitorSection
        title="Local Competitors"
        icon={Building2}
        competitors={data.local}
      />

      {/* Your Value Creation */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-950/30 to-red-900/10 p-6"
      >
        <h3 className="mb-4 text-xl font-bold text-white">Your Value Creation</h3>

        {/* Differentiators */}
        <div className="mb-5">
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-400">
            Differentiators
          </h4>
          <ul className="space-y-2">
            {data.your_value.differentiators.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Why customers choose you */}
        <div className="mb-5">
          <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-gray-400">
            Why Customers Choose You
          </h4>
          <p className="text-sm leading-relaxed text-gray-300">
            {data.your_value.why_customers_choose_you}
          </p>
        </div>

        {/* Defensible Moat */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-red-400" />
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Defensible Moat
            </h4>
          </div>
          <p className="text-sm leading-relaxed text-gray-300">
            {data.your_value.defensible_moat}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
