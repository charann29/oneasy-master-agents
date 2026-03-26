"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

/** Lightweight cancellation token — one per simulation run. */
export type CancelToken = { current: boolean };

const TYPING_DOT_DELAYS = [0, 0.15, 0.3];

/**
 * Sleeps for `ms` milliseconds, but rejects early if `token.current` becomes true.
 * Polls every 100 ms so an off-screen or unmounted component stops within ~100 ms.
 */
export function cancellableSleep(ms: number, token: CancelToken): Promise<void> {
    return new Promise((resolve, reject) => {
        if (token.current) {
            reject(new DOMException('Cancelled', 'AbortError'));
            return;
        }
        if (ms <= 0) {
            resolve();
            return;
        }

        let elapsed = 0;
        const step = Math.min(100, ms);
        const id = setInterval(() => {
            elapsed += step;
            if (token.current) {
                clearInterval(id);
                reject(new DOMException('Cancelled', 'AbortError'));
            } else if (elapsed >= ms) {
                clearInterval(id);
                resolve();
            }
        }, step);
    });
}

/**
 * Parses a chat line into its display properties.
 * A line is treated as a user message if it starts with "user:" (case-insensitive),
 * or if it's the first line and contains no colon (implicit user input).
 * The "User:" / "AI:" prefix is stripped from the display text.
 */
export function parseLine(line: string, index: number) {
    const isUser = line.toLowerCase().startsWith('user:') || (index === 0 && !line.includes(':'));
    const text = line.replace(/^(User|AI):\s*/i, '');
    return { isUser, text };
}

export default function ChatSimulation({ example }: { example: string }) {
    const lines = useMemo(
        () => example.split('\n').filter(line => line.trim() !== ''),
        [example]
    );

    const parsed = useMemo(
        () => lines.map((line, i) => parseLine(line, i)),
        [lines]
    );

    const [visibleCount, setVisibleCount] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [round, setRound] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { margin: "-100px" });

    useEffect(() => {
        if (!isInView) {
            // Off-screen: nothing to start. Any prior run is already cancelled
            // by its own cleanup function below.
            return;
        }

        // Each run gets its own token so rapid isInView toggling can never
        // revive a stale simulation — the old token stays cancelled forever.
        const token: CancelToken = { current: false };

        const runSimulation = async () => {
            try {
                while (!token.current) {
                    // Reset for new loop iteration
                    setVisibleCount(0);
                    setIsTyping(false);
                    setRound(r => r + 1);

                    await cancellableSleep(800, token);

                    for (let i = 0; i < parsed.length; i++) {
                        if (token.current) return;

                        const { isUser } = parsed[i];

                        if (!isUser) {
                            setIsTyping(true);
                            const typingTime = Math.floor(Math.random() * 800) + 1000;
                            await cancellableSleep(typingTime, token);
                            if (token.current) return;
                            setIsTyping(false);
                        } else if (i !== 0) {
                            await cancellableSleep(800, token);
                        }

                        if (token.current) return;
                        setVisibleCount(i + 1);

                        await cancellableSleep(600, token);
                    }

                    // Pause before restarting
                    await cancellableSleep(3000, token);
                }
            } catch (err) {
                // AbortError from cancellableSleep — expected when cancelled
                if (err instanceof DOMException && err.name === 'AbortError') return;
                throw err;
            }
        };

        runSimulation();

        return () => {
            token.current = true;
            setIsTyping(false);
        };
    }, [isInView, parsed]);

    return (
        <div ref={containerRef} className="p-6 space-y-4 min-h-[250px] bg-[url('/grid-pattern.svg')] bg-center flex flex-col justify-end overflow-hidden">
            <AnimatePresence>
                {parsed.map(({ isUser, text }, i) => {
                    if (i >= visibleCount) return null;

                    return (
                        <motion.div
                            key={`${round}-${i}`}
                            initial={{ opacity: 0, y: 15, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
                            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser
                                    ? 'bg-white/10 text-white rounded-br-none border border-white/5'
                                    : 'bg-red-950/40 text-red-100 rounded-bl-none border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                                }`}>
                                {text}
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {/* Typing Indicator */}
            {isTyping && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-start"
                >
                    <div className="bg-red-950/40 rounded-2xl px-4 py-3 rounded-bl-none border border-red-500/20 flex gap-1.5 items-center h-[44px]">
                        {TYPING_DOT_DELAYS.map((delay) => (
                            <motion.div
                                key={delay}
                                animate={{ y: [0, -4, 0] }}
                                transition={{ repeat: Infinity, duration: 0.8, delay }}
                                className="w-1.5 h-1.5 bg-red-400 rounded-full"
                            />
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
