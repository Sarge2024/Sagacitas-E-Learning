import { create } from 'zustand';

interface DiagnosticState {
  currentStep: number;
  score: number;
  totalQuestions: number;
  answers: Record<number, boolean>;
  isFinished: boolean;
  
  answerQuestion: (questionIndex: number, isCorrect: boolean) => void;
  nextStep: () => void;
  reset: () => void;
  setTotalQuestions: (total: number) => void;
}

export const useDiagnosticStore = create<DiagnosticState>((set) => ({
  currentStep: 0,
  score: 0,
  totalQuestions: 0,
  answers: {},
  isFinished: false,

  answerQuestion: (questionIndex, isCorrect) => set((state) => {
    // Prevent answering the same question multiple times
    if (state.answers[questionIndex] !== undefined) return state;

    const newScore = isCorrect ? state.score + 1 : state.score;
    return {
      answers: { ...state.answers, [questionIndex]: isCorrect },
      score: newScore,
    };
  }),

  nextStep: () => set((state) => {
    const nextIndex = state.currentStep + 1;
    if (nextIndex >= state.totalQuestions) {
      return { isFinished: true };
    }
    return { currentStep: nextIndex };
  }),

  reset: () => set({ currentStep: 0, score: 0, answers: {}, isFinished: false }),
  setTotalQuestions: (total) => set({ totalQuestions: total }),
}));
