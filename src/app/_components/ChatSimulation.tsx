"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

export default function ChatSimulation({ example }: { example: string }) {
    const lines = example.split('\n').filter(line => line.trim() !== '');
    const [visibleIndexes, setVisibleIndexes] = useState<number[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { margin: "-100px" });

    useEffect(() => {
        if (!isInView) return;

        let mounted = true;

        const runSimulation = async () => {
            while (mounted) {
                // Reset for new loop
                setVisibleIndexes([]);
                setIsTyping(false);

                await new Promise(r => setTimeout(r, 800));

                for (let i = 0; i < lines.length; i++) {
                    if (!mounted) return;

                    const line = lines[i];
                    const isUser = line.toLowerCase().startsWith('user:') || (i === 0 && !line.includes(':'));

                    if (!isUser) {
                        setIsTyping(true);
                        const typingTime = Math.floor(Math.random() * 800) + 1000;
                        await new Promise(r => setTimeout(r, typingTime));
                        if (!mounted) return;
                        setIsTyping(false);
                    } else if (i !== 0) {
                        await new Promise(r => setTimeout(r, 800));
                    }

                    if (!mounted) return;
                    setVisibleIndexes(prev => [...prev, i]);

                    await new Promise(r => setTimeout(r, 600));
                }

                // Pause 3 seconds before restarting
                await new Promise(r => setTimeout(r, 3000));
            }
        };

        runSimulation();

        return () => { mounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isInView, example]);

    return (
        <div ref={containerRef} className="p-6 space-y-4 min-h-[250px] bg-[url('/grid-pattern.svg')] bg-center flex flex-col justify-end overflow-hidden">
            <AnimatePresence>
                {lines.map((line, i) => {
                    if (!visibleIndexes.includes(i)) return null;

                    const isUser = line.toLowerCase().startsWith('user:') || (i === 0 && !line.includes(':'));
                    const text = line.replace(/^(User|AI):\s*/i, '');

                    return (
                        <motion.div
                            key={`${i}-${visibleIndexes.length}`}
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
                        <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                            className="w-1.5 h-1.5 bg-red-400 rounded-full"
                        />
                        <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: 0.15 }}
                            className="w-1.5 h-1.5 bg-red-400 rounded-full"
                        />
                        <motion.div
                            animate={{ y: [0, -4, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: 0.3 }}
                            className="w-1.5 h-1.5 bg-red-400 rounded-full"
                        />
                    </div>
                </motion.div>
            )}
        </div>
    );
}
