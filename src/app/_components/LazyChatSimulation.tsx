"use client";

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const ChatSimulation = dynamic(() => import('./ChatSimulation'), {
  ssr: false,
  loading: () => null,
});

function ChatSimulationSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading chat simulation"
      className="p-6 space-y-4 min-h-[250px] flex flex-col justify-end"
    >
      <div className="flex justify-end">
        <div className="h-10 w-3/4 rounded-2xl bg-white/5 animate-pulse" />
      </div>
      <div className="flex justify-start">
        <div className="h-10 w-4/5 rounded-2xl bg-red-950/20 animate-pulse" />
      </div>
      <div className="flex justify-end">
        <div className="h-10 w-2/3 rounded-2xl bg-white/5 animate-pulse" />
      </div>
      <div className="flex justify-start">
        <div className="h-10 w-3/4 rounded-2xl bg-red-950/20 animate-pulse" />
      </div>
    </div>
  );
}

export default function LazyChatSimulation({ example }: { example: string }) {
  const [isNearViewport, setIsNearViewport] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef}>
      {isNearViewport ? (
        <ChatSimulation example={example} />
      ) : (
        <ChatSimulationSkeleton />
      )}
    </div>
  );
}
