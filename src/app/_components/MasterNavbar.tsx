"use client";

import React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function MasterNavbar() {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-20">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-2xl font-black text-white tracking-tighter">
                            On<span className="text-red-600">Easy</span>
                        </span>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-2 border-l border-white/20 pl-2">
                            Master Agents
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <Link href="#agents" className="text-gray-300 hover:text-white transition-colors">Explore Agents</Link>
                        <Link href="#agents" className="text-gray-300 hover:text-white transition-colors">Capabilities</Link>
                        <Link href="https://startup.oneasy.ai/" target="_blank" className="relative group px-6 py-2.5 rounded-xl font-bold text-white overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 transition-transform group-hover:scale-105" />
                            <div className="relative flex items-center gap-2">
                                Get Started Free
                            </div>
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white">
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Nav */}
            {isOpen && (
                <div className="md:hidden bg-[#0A0A0A] border-b border-white/10 p-6 space-y-4">
                    <Link href="#agents" className="block text-xl font-bold text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>Explore Agents</Link>
                    <Link href="#agents" className="block text-xl font-bold text-gray-300 hover:text-white" onClick={() => setIsOpen(false)}>Capabilities</Link>
                    <Link href="https://startup.oneasy.ai/" target="_blank" className="block w-full text-center mt-6 px-5 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold rounded-xl hover:opacity-90 transition-opacity" onClick={() => setIsOpen(false)}>
                        Get Started Free
                    </Link>
                </div>
            )}
        </nav>
    );
}
