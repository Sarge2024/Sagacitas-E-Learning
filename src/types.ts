export type ViewMode = 'dashboard' | 'lesson' | 'courses' | 'profile' | 'dre-simulator' | 'matrix';

export interface LessonAttachment {
  id: string;
  name: string;
  type: 'pdf' | 'excel' | 'doc' | 'link';
  size?: string;
  url?: string;
}

export interface Slide {
  id: string;
  slideNumber: number;
  title: string;
  subtitle?: string;
  
  // Master Prompt 6-Slide Pattern & Quizzes
  slideCategory?: 'capa' | 'operacao' | 'conceito' | 'alchymist' | 'ancoragem' | 'resumo' | 'quiz_pergunta' | 'quiz_opcoes' | 'quiz_gabarito';
  
  provocationQuestion?: string;
  practicalScenario?: string;
  identifiedPain?: string;
  metaphorName?: string;
  metaphorDescription?: string;
  systemLocation?: string;
  numericalExample?: string;
  goldenRule?: string;

  // Quiz / Assessment fields
  quizCase?: string;
  quizQuestion?: string;
  quizOptions?: { key: string; text: string; isCorrect?: boolean }[];
  correctOptionKey?: string;
  quizJustification?: string;
  quizActionRequired?: string;

  // General slide fields
  bulletPoints?: string[];
  keyFormula?: string;
  takeaway?: string;
  diagramType?: 'formula' | 'chart' | 'flow' | 'table';
  tableData?: { label: string; value: string; highlight?: boolean }[];
  speakerNotes?: string;
}

export interface Lesson {
  id: string;
  number: string;
  title: string;
  duration: string;
  completed: boolean;
  active?: boolean;
  locked?: boolean;
  description?: string;
  videoUrl?: string;
  videoPoster?: string;
  attachments?: LessonAttachment[];
  slides?: Slide[];
}

export interface Module {
  id: string;
  title: string;
  focus?: string;
  duration?: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  category: string;
  progress: number; // 0 to 100
  image: string;
  badge?: 'TRENDING' | 'NEW RELEASE' | 'POPULAR' | 'RECOMMENDED';
  description?: string;
  completedLessons?: number;
  totalLessons?: number;
  totalHours?: string;
  level?: 'Iniciante' | 'Intermediário' | 'Avançado';
  modules?: Module[];
}

export interface Certificate {
  id: string;
  courseTitle: string;
  issueDate: string;
  credentialId: string;
  hours: number;
  pdfName: string;
}

export interface Comment {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  timestamp: string;
  likes: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
}
