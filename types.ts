export interface Flashcard {
  front: string;
  back: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface DailyPlan {
  day: number;
  topic: string;
  summary: string;
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
}

export interface StudyPlanResponse {
  planName: string;
  totalDays: number;
  schedule: DailyPlan[];
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  READY = 'READY',
  ERROR = 'ERROR'
}
