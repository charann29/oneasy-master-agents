import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

// Mock next/dynamic to render the component synchronously in tests
vi.mock('next/dynamic', () => ({
  __esModule: true,
  default: (loader: () => Promise<{ default: React.ComponentType<unknown> }>) => {
    let Component: React.ComponentType<unknown> | null = null;
    loader().then((mod) => {
      Component = mod.default;
    });
    return function DynamicWrapper(props: Record<string, unknown>) {
      if (Component) return <Component {...props} />;
      return null;
    };
  },
}));

// Mock ChatSimulation to avoid framer-motion complexity in unit tests
vi.mock('../ChatSimulation', () => ({
  __esModule: true,
  default: ({ example }: { example: string }) => (
    <div data-testid="chat-simulation" data-example={example}>
      chat-loaded
    </div>
  ),
}));

import LazyChatSimulation from '../LazyChatSimulation';

type IntersectionCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

let intersectionCallback: IntersectionCallback;
let observedElements: Element[] = [];
let disconnectSpy: ReturnType<typeof vi.fn>;
let observeSpy: ReturnType<typeof vi.fn>;
let constructorSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  observedElements = [];
  disconnectSpy = vi.fn();
  observeSpy = vi.fn((el: Element) => {
    observedElements.push(el);
  });
  constructorSpy = vi.fn();

  // Use a proper function constructor (not arrow) so `new` works
  function MockIntersectionObserver(
    this: IntersectionObserver,
    callback: IntersectionCallback,
    options?: IntersectionObserverInit
  ) {
    constructorSpy(callback, options);
    intersectionCallback = callback;
    this.observe = observeSpy;
    this.unobserve = vi.fn();
    this.disconnect = disconnectSpy;
    this.root = null;
    this.rootMargin = '';
    this.thresholds = [];
    this.takeRecords = vi.fn(() => []);
  }

  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('LazyChatSimulation', () => {
  it('renders skeleton placeholder initially when not in viewport', () => {
    render(<LazyChatSimulation example="User: Hello\nAI: Hi there!" />);

    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-label', 'Loading chat simulation');
    expect(screen.queryByTestId('chat-simulation')).not.toBeInTheDocument();
  });

  it('observes the container element with IntersectionObserver', () => {
    render(<LazyChatSimulation example="User: Hello\nAI: Hi there!" />);

    expect(observedElements).toHaveLength(1);
    expect(observeSpy).toHaveBeenCalledTimes(1);
  });

  it('creates IntersectionObserver with 200px rootMargin', () => {
    render(<LazyChatSimulation example="User: Hello\nAI: Hi there!" />);

    expect(constructorSpy).toHaveBeenCalledWith(
      expect.any(Function),
      { rootMargin: '200px' }
    );
  });

  it('renders ChatSimulation when element enters viewport', () => {
    render(<LazyChatSimulation example="User: Hello\nAI: Hi there!" />);

    // Verify skeleton is shown initially
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-simulation')).not.toBeInTheDocument();

    // Simulate intersection
    act(() => {
      intersectionCallback([{ isIntersecting: true } as IntersectionObserverEntry]);
    });

    // ChatSimulation should now be rendered
    expect(screen.getByTestId('chat-simulation')).toBeInTheDocument();
    // Skeleton should be gone
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('disconnects observer after first intersection', () => {
    render(<LazyChatSimulation example="User: Test" />);

    act(() => {
      intersectionCallback([{ isIntersecting: true } as IntersectionObserverEntry]);
    });

    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });

  it('does not render ChatSimulation when not intersecting', () => {
    render(<LazyChatSimulation example="User: Test" />);

    act(() => {
      intersectionCallback([{ isIntersecting: false } as IntersectionObserverEntry]);
    });

    expect(screen.queryByTestId('chat-simulation')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('disconnects observer on unmount (cleanup)', () => {
    const { unmount } = render(<LazyChatSimulation example="User: Test" />);

    unmount();

    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('passes the example prop through to ChatSimulation', () => {
    const exampleText = 'User: I want to start a tech company.\nAI: Great! Are you planning to raise funding?';
    render(<LazyChatSimulation example={exampleText} />);

    act(() => {
      intersectionCallback([{ isIntersecting: true } as IntersectionObserverEntry]);
    });

    const chatEl = screen.getByTestId('chat-simulation');
    expect(chatEl).toBeInTheDocument();
    expect(chatEl).toHaveAttribute('data-example', exampleText);
  });
});
