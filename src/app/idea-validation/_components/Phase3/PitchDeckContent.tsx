"use client";

import { motion } from "framer-motion";
import { Presentation } from "lucide-react";
import type { PitchDeckOutput, SlideContent } from "@/app/idea-validation/_types";

interface PitchDeckContentProps {
  data: PitchDeckOutput;
}

interface SlideCardProps {
  slide: SlideContent;
  accentColor: string;
  index: number;
}

const slideConfig: { key: keyof PitchDeckOutput; accent: string }[] = [
  { key: "problem_slide", accent: "bg-red-500" },
  { key: "solution_slide", accent: "bg-green-500" },
  { key: "market_slide", accent: "bg-blue-500" },
  { key: "competition_slide", accent: "bg-orange-500" },
  { key: "why_now_slide", accent: "bg-purple-500" },
  { key: "target_customer_slide", accent: "bg-yellow-500" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function SlideCard({ slide, accentColor, index }: SlideCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      custom={index}
      className="overflow-hidden rounded-2xl border border-white/10 bg-[#0A0A0A]"
    >
      {/* Top accent strip */}
      <div className={`h-1.5 ${accentColor}`} />

      {/* Slide content - aspect-video */}
      <div className="aspect-video p-5 flex flex-col justify-between">
        <div>
          <h4 className="mb-3 text-lg font-bold text-white">{slide.title}</h4>
          <ul className="space-y-2">
            {slide.bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gray-500" />
                {bullet}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-3 text-xs italic text-gray-600">Source: {slide.source}</p>
      </div>
    </motion.div>
  );
}

export default function PitchDeckContent({ data }: PitchDeckContentProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3">
          <Presentation className="h-6 w-6 text-red-500" />
          <h2 className="text-xl font-bold text-white">Pitch Deck Ready Content</h2>
        </div>
        <p className="mt-1 text-sm text-gray-400">
          Content formatted for direct use in your pitch deck slides
        </p>
      </motion.div>

      {/* Slide Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {slideConfig.map(({ key, accent }, index) => (
          <SlideCard
            key={key}
            slide={data[key]}
            accentColor={accent}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  );
}
