"use client";

import { containerVariants, itemVariants } from "@/app/idea-validation/_lib/animations";

import { motion } from "framer-motion";
import { Globe, TrendingUp, Users } from "lucide-react";
import type { MarketAnalysis } from "@/app/idea-validation/_types";

interface MarketAnalysisReportProps {
  data: MarketAnalysis;
}



export default function MarketAnalysisReport({ data }: MarketAnalysisReportProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Global Market Overview */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6"
      >
        <div className="mb-4 flex items-center gap-3">
          <Globe className="h-5 w-5 text-red-500" />
          <h3 className="text-xl font-bold text-white">Global Market Overview</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/5 bg-white/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Market Size</p>
            <p className="mt-1 text-lg font-bold text-white">{data.global.size}</p>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Growth Rate (CAGR)
              </p>
            </div>
            <p className="mt-1 text-lg font-bold text-green-400">{data.global.growth_rate}</p>
          </div>
        </div>

        {/* Key Players */}
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            Key Players
          </p>
          <div className="flex flex-wrap gap-2">
            {data.global.key_players.map((player, i) => (
              <span
                key={i}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-gray-300"
              >
                {player}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* TAM / SAM / SOM Funnel */}
      <motion.div variants={itemVariants} className="space-y-0">
        <h3 className="mb-4 text-xl font-bold text-white">TAM / SAM / SOM</h3>

        <div className="flex flex-col items-center space-y-3">
          {/* TAM - Full Width */}
          <div className="w-full rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-red-400">
              {data.tam.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-white">{data.tam.value_inr}</p>
            <p className="text-sm text-gray-400">{data.tam.value_usd}</p>
            <p className="mt-2 text-xs text-gray-500">{data.tam.definition}</p>
            <p className="mt-1 text-xs italic text-gray-600">Source: {data.tam.source}</p>
          </div>

          {/* SAM - ~70% Width */}
          <div className="w-[70%] rounded-2xl border border-red-500/30 bg-red-500/20 p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-red-400">
              {data.sam.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-white">{data.sam.value_inr}</p>
            <p className="text-sm text-gray-400">{data.sam.value_usd}</p>
            <p className="mt-2 text-xs text-gray-500">{data.sam.definition}</p>
            <p className="mt-1 text-xs italic text-gray-600">Source: {data.sam.source}</p>
          </div>

          {/* SOM - ~40% Width */}
          <div className="w-[40%] rounded-2xl border border-red-500/40 bg-red-500/30 p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-red-400">
              {data.som.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-white">{data.som.value_inr}</p>
            <p className="text-sm text-gray-400">{data.som.value_usd}</p>
            <p className="mt-2 text-xs text-gray-500">{data.som.definition}</p>
            <p className="mt-1 text-xs italic text-gray-600">Source: {data.som.source}</p>
          </div>
        </div>
      </motion.div>

      {/* Customer Count */}
      <motion.div
        variants={itemVariants}
        className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 text-center"
      >
        <Users className="mx-auto mb-3 h-8 w-8 text-red-500" />
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
          Estimated Customers in Target Segment
        </p>
        <p className="mt-2 text-3xl font-bold text-white">{data.customer_count}</p>
      </motion.div>
    </motion.div>
  );
}
