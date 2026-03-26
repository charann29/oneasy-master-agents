"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type {
  IdeaValidationInputs,
  IdeaValidationState,
  Refinements,
  AllOutputs,
  ChatMessage,
} from '@/app/idea-validation/_types';

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------

type Action =
  | { type: 'SET_INPUT'; payload: { field: keyof IdeaValidationInputs; value: string } }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_PHASE'; payload: 1 | 2 | 3 }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_REFINEMENTS'; payload: Partial<Refinements> }
  | { type: 'SET_OUTPUTS'; payload: AllOutputs }
  | { type: 'SET_ANALYSIS_COMPLETE' }
  | { type: 'RESET_ALL' }
  | { type: 'HYDRATE'; payload: IdeaValidationState };

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: IdeaValidationState = {
  inputs: {
    context_type: '',
    business_idea: '',
    target_customer: '',
    target_location: '',
    problem_statement: '',
    solution_differentiation: '',
  },
  refinements: {
    target_narrowed: '',
    differentiation_clarified: '',
    validation_evidence: {
      interviews: 0,
      confirmed_interest: 0,
      beta_testers: 0,
    },
    additional_context: '',
  },
  outputs: null,
  currentPhase: 1,
  currentStep: 1,
  chatMessages: [],
  isAnalysisComplete: false,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

function reducer(state: IdeaValidationState, action: Action): IdeaValidationState {
  switch (action.type) {
    case 'SET_INPUT':
      return {
        ...state,
        inputs: {
          ...state.inputs,
          [action.payload.field]: action.payload.value,
        },
      };

    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, 5),
      };

    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1),
      };

    case 'SET_PHASE':
      return {
        ...state,
        currentPhase: action.payload,
      };

    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chatMessages: [...state.chatMessages, action.payload],
      };

    case 'SET_REFINEMENTS':
      return {
        ...state,
        refinements: {
          ...state.refinements,
          ...action.payload,
        },
      };

    case 'SET_OUTPUTS':
      return {
        ...state,
        outputs: action.payload,
      };

    case 'SET_ANALYSIS_COMPLETE':
      return {
        ...state,
        isAnalysisComplete: true,
      };

    case 'RESET_ALL':
      return { ...initialState };

    case 'HYDRATE':
      return action.payload;

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface IdeaValidationContextType {
  state: IdeaValidationState;
  setInput: (field: keyof IdeaValidationInputs, value: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  setPhase: (phase: 1 | 2 | 3) => void;
  addChatMessage: (message: ChatMessage) => void;
  setRefinements: (refinements: Partial<Refinements>) => void;
  setOutputs: (outputs: AllOutputs) => void;
  setAnalysisComplete: () => void;
  resetAll: () => void;
}

const IdeaValidationContext = createContext<IdeaValidationContextType | undefined>(undefined);

// ---------------------------------------------------------------------------
// Session storage key
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'idea-validation-state';

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function IdeaValidationProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: IdeaValidationState = JSON.parse(stored);
        dispatch({ type: 'HYDRATE', payload: parsed });
      }
    } catch {
      // sessionStorage unavailable (SSR) or corrupt data – use initial state
    }
  }, []);

  // Persist to sessionStorage on every state change
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // sessionStorage unavailable – silently ignore
    }
  }, [state]);

  // Stable action callbacks
  const setInput = useCallback(
    (field: keyof IdeaValidationInputs, value: string) => {
      dispatch({ type: 'SET_INPUT', payload: { field, value } });
    },
    [],
  );

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const setPhase = useCallback((phase: 1 | 2 | 3) => {
    dispatch({ type: 'SET_PHASE', payload: phase });
  }, []);

  const addChatMessage = useCallback((message: ChatMessage) => {
    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: message });
  }, []);

  const setRefinements = useCallback((refinements: Partial<Refinements>) => {
    dispatch({ type: 'SET_REFINEMENTS', payload: refinements });
  }, []);

  const setOutputs = useCallback((outputs: AllOutputs) => {
    dispatch({ type: 'SET_OUTPUTS', payload: outputs });
  }, []);

  const setAnalysisComplete = useCallback(() => {
    dispatch({ type: 'SET_ANALYSIS_COMPLETE' });
  }, []);

  const resetAll = useCallback(() => {
    dispatch({ type: 'RESET_ALL' });
  }, []);

  const value: IdeaValidationContextType = {
    state,
    setInput,
    nextStep,
    prevStep,
    setPhase,
    addChatMessage,
    setRefinements,
    setOutputs,
    setAnalysisComplete,
    resetAll,
  };

  return (
    <IdeaValidationContext.Provider value={value}>
      {children}
    </IdeaValidationContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Custom hook
// ---------------------------------------------------------------------------

export function useIdeaValidation(): IdeaValidationContextType {
  const context = useContext(IdeaValidationContext);
  if (context === undefined) {
    throw new Error('useIdeaValidation must be used within an IdeaValidationProvider');
  }
  return context;
}
