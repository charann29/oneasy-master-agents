import React from 'react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t border-white/10 bg-[#050505] pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="md:col-span-2">
                        <Link href="/" className="inline-block mb-6">
                            <span className="text-3xl font-black text-white tracking-tighter">
                                On<span className="text-red-600">Easy</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 max-w-sm">
                            World's First Human-less AI-based Financial Consultant & CA Firm. Automating everything from incorporation to taxes.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6">AI Agents</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><Link href="#incorporation-demo" className="hover:text-red-500 transition-colors">Startup Incorporation</Link></li>
                            <li><Link href="#business-financial-model-demo" className="hover:text-red-500 transition-colors">Business Models</Link></li>
                            <li><Link href="#document-writer-demo" className="hover:text-red-500 transition-colors">Legal Documents</Link></li>
                            <li><Link href="#tax-filing-demo" className="hover:text-red-500 transition-colors">Tax Filing</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-6">Company</h4>
                        <ul className="space-y-4 text-sm text-gray-400">
                            <li><Link href="#" className="hover:text-red-500 transition-colors">About</Link></li>
                            <li><Link href="#" className="hover:text-red-500 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-red-500 transition-colors">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-red-500 transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
                    <p>© {new Date().getFullYear()} OnEasy Master Agents. All rights reserved.</p>
                    <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <span>Secured by AI</span>
                        <div className="w-1 h-1 rounded-full bg-red-500" />
                        <span>CA Certified Models</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
