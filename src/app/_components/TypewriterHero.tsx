"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const taglines = [
    "Autopilot. No CAs. No Wait.",
    "Your CFO That Never Sleeps.",
    "AI That Thinks Like a CA.",
    "From Idea to IPO. AI‑First.",
    "Zero Paperwork. Full Control.",
];

export default function TypewriterHero() {
    const [lineIndex, setLineIndex] = useState(0);
    const [displayText, setDisplayText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentLine = taglines[lineIndex];
        let timeout: NodeJS.Timeout;

        if (!isDeleting) {
            // Typing
            if (displayText.length < currentLine.length) {
                timeout = setTimeout(() => {
                    setDisplayText(currentLine.slice(0, displayText.length + 1));
                }, 60);
            } else {
                // Pause at full text before deleting
                timeout = setTimeout(() => setIsDeleting(true), 2000);
            }
        } else {
            // Deleting
            if (displayText.length > 0) {
                timeout = setTimeout(() => {
                    setDisplayText(displayText.slice(0, -1));
                }, 30);
            } else {
                // Move to next line
                setIsDeleting(false);
                setLineIndex((prev) => (prev + 1) % taglines.length);
            }
        }

        return () => clearTimeout(timeout);
    }, [displayText, isDeleting, lineIndex]);

    return (
        <h1 className="text-[3rem] sm:text-[4.5rem] lg:text-[5.5rem] font-black leading-[1.1] tracking-tight text-white mb-6">
            Your Finances on <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-600">
                {displayText}
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6 }}
                    className="inline-block w-[3px] h-[0.9em] bg-red-500 ml-1 align-middle rounded-full"
                />
            </span>
        </h1>
    );
}
