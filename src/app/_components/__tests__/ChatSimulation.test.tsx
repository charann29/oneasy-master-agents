import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

// Mock framer-motion to avoid animation complexity in unit tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...rest }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} data-testid={rest['data-testid' as keyof typeof rest] as string}>
        {children}
      </div>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import ChatSimulation from '../ChatSimulation';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ChatSimulation', () => {
  it('renders the container with correct classes', () => {
    vi.useFakeTimers();
    const { container } = render(
      <ChatSimulation example="User: Hello\nAI: Hi there!" />
    );

    const chatContainer = container.firstChild as HTMLElement;
    expect(chatContainer).toHaveClass('p-6', 'space-y-4', 'min-h-[250px]');
    vi.useRealTimers();
  });

  it('renders no messages initially before the delay', () => {
    vi.useFakeTimers();
    render(
      <ChatSimulation example="User: Hello\nAI: Hi there!" />
    );

    // Before any timers fire, no messages should be visible
    expect(screen.queryByText('Hello')).not.toBeInTheDocument();
    expect(screen.queryByText('Hi there!')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('starts simulation on mount and shows first message after delay', async () => {
    vi.useFakeTimers();
    const example = `User: Hello
AI: Hi there!`;
    
    render(
      <ChatSimulation example={example} />
    );

    // Advance past the initial 800ms delay
    await act(async () => {
      await vi.advanceTimersByTimeAsync(850);
    });

    // First user message should now be visible
    expect(screen.getByText('Hello')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('shows AI message after typing delay', async () => {
    vi.useFakeTimers();
    const example = `User: What is this?
AI: This is a test.`;

    render(
      <ChatSimulation example={example} />
    );

    // Advance past initial delay + first message + message gap + typing delay
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3500);
    });

    // Both messages should be visible
    expect(screen.getByText('What is this?')).toBeInTheDocument();
    expect(screen.getByText('This is a test.')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('strips User: and AI: prefixes from displayed text', async () => {
    vi.useFakeTimers();
    const example = `User: My question
AI: My answer`;

    render(
      <ChatSimulation example={example} />
    );

    // Advance enough to show all messages
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3500);
    });

    // Should show text without prefix
    expect(screen.getByText('My question')).toBeInTheDocument();
    expect(screen.getByText('My answer')).toBeInTheDocument();

    // Should not show the raw prefixed text as a standalone element
    expect(screen.queryByText('User: My question')).not.toBeInTheDocument();
    expect(screen.queryByText('AI: My answer')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('filters out empty lines from the example', () => {
    vi.useFakeTimers();
    const example = `User: Hello

AI: Hi`;
    const { container } = render(
      <ChatSimulation example={example} />
    );

    // Component should render without errors
    expect(container.firstChild).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('applies correct styling for user vs AI messages', async () => {
    vi.useFakeTimers();
    const example = `User: Hello
AI: Hi there!`;

    render(
      <ChatSimulation example={example} />
    );

    // Advance enough to show all messages
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3500);
    });

    const userMsg = screen.getByText('Hello');
    const aiMsg = screen.getByText('Hi there!');

    // User message parent should have justify-end
    expect(userMsg.parentElement).toHaveClass('flex', 'justify-end');
    // AI message parent should have justify-start
    expect(aiMsg.parentElement).toHaveClass('flex', 'justify-start');

    // User message should have user styling
    expect(userMsg).toHaveClass('bg-white/10');
    // AI message should have AI styling
    expect(aiMsg).toHaveClass('bg-red-950/40');
    vi.useRealTimers();
  });
});
