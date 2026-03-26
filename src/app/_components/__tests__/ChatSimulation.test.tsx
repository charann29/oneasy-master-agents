import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';
import React from 'react';
import ChatSimulation, {
    cancellableSleep,
    parseLine,
    CancelToken,
} from '../ChatSimulation';

// ─── Mock framer-motion ────────────────────────────────────────────────────────
// We mock framer-motion so tests don't depend on animation internals.
// `useInView` is the critical hook — we control it via a module-level flag.

let mockInView = true;

vi.mock('framer-motion', () => ({
    motion: {
        div: React.forwardRef(
            (props: React.HTMLAttributes<HTMLDivElement>, ref: React.Ref<HTMLDivElement>) => {
                const { children, ...rest } = props;
                // Strip framer-motion-specific props that would warn on a real DOM element
                const cleaned = Object.fromEntries(
                    Object.entries(rest).filter(
                        ([k]) =>
                            !['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap'].includes(k),
                    ),
                );
                return <div ref={ref} {...cleaned}>{children}</div>;
            },
        ),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useInView: () => mockInView,
}));

// ─── cancellableSleep tests ────────────────────────────────────────────────────

describe('cancellableSleep', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    afterEach(() => {
        vi.useRealTimers();
    });

    it('resolves after the specified delay', async () => {
        const token: CancelToken = { current: false };
        let resolved = false;

        const p = cancellableSleep(300, token).then(() => {
            resolved = true;
        });

        await vi.advanceTimersByTimeAsync(300);
        await p;
        expect(resolved).toBe(true);
    });

    it('rejects immediately if token is already cancelled', async () => {
        const token: CancelToken = { current: true };

        await expect(cancellableSleep(1000, token)).rejects.toThrow('Cancelled');
    });

    it('rejects within ~100ms when token is cancelled mid-sleep', async () => {
        const token: CancelToken = { current: false };
        let rejected = false;

        const p = cancellableSleep(5000, token).catch(() => {
            rejected = true;
        });

        await vi.advanceTimersByTimeAsync(50);
        expect(rejected).toBe(false);

        token.current = true;
        await vi.advanceTimersByTimeAsync(100);
        await p;
        expect(rejected).toBe(true);
    });

    it('resolves immediately when ms is 0', async () => {
        const token: CancelToken = { current: false };
        let resolved = false;

        const p = cancellableSleep(0, token).then(() => {
            resolved = true;
        });

        // Should resolve synchronously (no timers needed)
        await p;
        expect(resolved).toBe(true);
    });

    it('resolves immediately when ms is negative', async () => {
        const token: CancelToken = { current: false };
        let resolved = false;

        const p = cancellableSleep(-100, token).then(() => {
            resolved = true;
        });

        await p;
        expect(resolved).toBe(true);
    });
});

// ─── parseLine tests ───────────────────────────────────────────────────────────

describe('parseLine', () => {
    it('identifies a line starting with "User:" as a user message', () => {
        const result = parseLine('User: Hello there', 1);
        expect(result.isUser).toBe(true);
        expect(result.text).toBe('Hello there');
    });

    it('identifies a line starting with "AI:" as a non-user message', () => {
        const result = parseLine('AI: How can I help?', 1);
        expect(result.isUser).toBe(false);
        expect(result.text).toBe('How can I help?');
    });

    it('treats the first line without a colon as a user message', () => {
        const result = parseLine('Hello world', 0);
        expect(result.isUser).toBe(true);
        expect(result.text).toBe('Hello world');
    });

    it('is case-insensitive for the User/AI prefix', () => {
        expect(parseLine('user: test', 1).isUser).toBe(true);
        expect(parseLine('ai: test', 1).isUser).toBe(false);
    });

    it('does not treat a non-first line without a colon as a user message', () => {
        const result = parseLine('Some random text', 2);
        expect(result.isUser).toBe(false);
        expect(result.text).toBe('Some random text');
    });

    it('treats "AI:" at index 0 as a non-user message', () => {
        const result = parseLine('AI: response', 0);
        expect(result.isUser).toBe(false);
        expect(result.text).toBe('response');
    });

    it('leaves unrecognized prefixes in the display text', () => {
        const result = parseLine('System: reboot', 1);
        expect(result.isUser).toBe(false);
        expect(result.text).toBe('System: reboot');
    });
});

// ─── ChatSimulation component tests ────────────────────────────────────────────

describe('ChatSimulation', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        mockInView = true;
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
        vi.restoreAllMocks();
        mockInView = true;
    });

    const example = `User: Hello
AI: Hi there!
User: How are you?`;

    it('renders the container without any messages initially', () => {
        render(<ChatSimulation example={example} />);
        // No messages should be visible at visibleCount=0
        expect(screen.queryByText('Hello')).not.toBeInTheDocument();
        expect(screen.queryByText('Hi there!')).not.toBeInTheDocument();
    });

    it('shows the first message after the initial delay', async () => {
        render(<ChatSimulation example={example} />);

        // Initial 800ms delay before first message (user message, index 0, no extra delay)
        await act(async () => {
            await vi.advanceTimersByTimeAsync(900);
        });

        expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('shows subsequent messages as the simulation progresses', async () => {
        // Math.random mocked to 0.5 → typing delay = floor(0.5 * 800) + 1000 = 1400ms
        render(<ChatSimulation example={example} />);

        // 800ms initial delay → first user message appears
        await act(async () => {
            await vi.advanceTimersByTimeAsync(900);
        });
        expect(screen.getByText('Hello')).toBeInTheDocument();

        // 600ms post-message delay + 1400ms typing delay → AI message appears
        // Total from first message: 600 + 1400 = 2000ms
        await act(async () => {
            await vi.advanceTimersByTimeAsync(2100);
        });
        expect(screen.getByText('Hi there!')).toBeInTheDocument();
    });

    it('does not run the simulation when off-screen', async () => {
        mockInView = false;
        render(<ChatSimulation example={example} />);

        // Advance well past when messages would appear
        await act(async () => {
            await vi.advanceTimersByTimeAsync(10000);
        });

        expect(screen.queryByText('Hello')).not.toBeInTheDocument();
    });

    it('stops the simulation on unmount without errors', async () => {
        const { unmount } = render(<ChatSimulation example={example} />);

        // Let simulation start
        await act(async () => {
            await vi.advanceTimersByTimeAsync(500);
        });

        // Unmount should cancel cleanly — no errors or warnings
        unmount();

        // Advance timers to ensure no lingering intervals throw
        await act(async () => {
            await vi.advanceTimersByTimeAsync(5000);
        });
    });

    it('handles empty example string gracefully', () => {
        render(<ChatSimulation example="" />);
        // Should render the container without crashing
        expect(screen.queryByText('Hello')).not.toBeInTheDocument();
    });

    it('filters out blank lines from the example', async () => {
        const exampleWithBlanks = `User: First

User: Second`;
        render(<ChatSimulation example={exampleWithBlanks} />);

        // After initial delay, first message appears
        await act(async () => {
            await vi.advanceTimersByTimeAsync(900);
        });
        expect(screen.getByText('First')).toBeInTheDocument();

        // Second user message after 600ms + 800ms delay
        await act(async () => {
            await vi.advanceTimersByTimeAsync(1500);
        });
        expect(screen.getByText('Second')).toBeInTheDocument();
    });
});
