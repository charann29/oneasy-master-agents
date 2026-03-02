import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'OnEasy AI Master Agents | One Point of Contact for Financial Needs',
  description: "World's First Human-less AI-based Financial Consultant & CA Firm. From startup incorporation to pitch decks, and tax filing.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} font-inter bg-[#050505] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
