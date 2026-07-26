import type { Presentation } from './types/presentation';

export type ViewMode = 'dashboard' | 'lesson' | 'courses' | 'profile' | 'assignments' | 'calendar' | 'instructor-portfolio' | 'manager' | 'expert' | 'reports';

export interface InstructorQuestion {
  id: string;
  studentName: string;
  studentAvatar?: string;
  courseTitle: string;
  lessonTitle: string;
  lessonNumber: string;
  slideNumber: number;
  slideTitle: string;
  slideCategory?: string;
  questionText: string;
  timestamp: string;
  status: 'pendente' | 'respondida';
  instructorResponse?: string;
  responseTimestamp?: string;
}

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

/**
 * Payload tipado para conteúdo de Objetos de Aprendizagem.
 * Usa Record<string, unknown> para flexibilidade de schema JSONB
 * sem sacrificar a segurança de tipos — o consumidor deve fazer type narrowing.
 */
export type LearningObjectContentPayload = Record<string, unknown>;

export interface LearningObject {
  id: string;
  knowledge_unit_id: string;
  title: string;
  bloom_level: 1 | 2 | 3 | 4 | 5 | 6;
  object_type: 'video' | 'reading' | 'quiz' | 'dre_simulation' | 'case_study' | 'interactive';
  content_payload: LearningObjectContentPayload;
  sequence_order?: number;
}

export interface KnowledgeUnit {
  id: string;
  tenant_id?: string;
  code?: string;
  title: string;
  description?: string;
  learning_objects?: LearningObject[];
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
  learning_objects?: LearningObject[];
  slides?: unknown[];         // Slides dinâmicos carregados do editor
  videoPoster?: string;       // URL do poster de vídeo da aula
  attachments?: LessonAttachment[];  // Materiais complementares da aula
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
  duration?: string;           // Duração legível do curso (ex: "40 horas")
  level?: 'Iniciante' | 'Intermediário' | 'Avançado';
  modules?: Module[];
  course_code?: string;
  status?: 'active' | 'blocked' | 'cancelled';
  presentation?: Presentation; // Tipagem forte — referencia o tipo do editor de slides
}

export interface Certificate {
  id: string;
  courseTitle: string;
  issueDate: string;
  credentialId: string;
  hours: number;
  pdfName: string;
  studentName?: string;
  studentEmail?: string;
  institutionName?: string;
  registrationNumber?: string;
  description?: string;
  imageUrl?: string;
  templateType?: 'oficial_alchymist' | 'pergaminho_sagacitas' | 'custom_upload';
  signatoryRole?: string;
  signatoryName?: string;
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

export interface SystemPermission {
  resourceId: string;
  resourceName: string;
  resourceType: 'ui' | 'report';
  c: boolean; // Create
  r: boolean; // Read
  u: boolean; // Update
  d: boolean; // Delete
}

export type PermissionHash = Record<string, {
  c: boolean;
  r: boolean;
  u: boolean;
  d: boolean;
}>;

export interface RoleProfile {
  id: string;
  name: string;
  permissionsHash: PermissionHash;
}

export interface OAuthUser {
  id: string;
  name: string;
  email: string;
  provider: string;
  avatar: string;
  role: string;
  authenticatedAt: string;
  token?: string;
  company_name?: string;
  enrollment_type?: string;
  enrollment_number?: string;
  permissions?: SystemPermission[]; // Legacy
  permissionsHash?: PermissionHash;
  status?: 'active' | 'blocked';
  company_id?: string;
}

// Database Entities (Supabase Schema Alignment)
export interface DBCompany {
  id: string;
  name: string;
  cnpj?: string;
  domain?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyRecord {
  id: string;
  name: string;
  cnpj?: string;
  domain?: string;
  active: boolean;
  tenant_id?: string;
  created_at?: string;
}

export interface DBCourseCategory {
  id: string;
  code: string; // 3-digit code format
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Schema da tabela `courses` no Supabase.
 * Campos JSONB (`modules`, `presentation`) são tipados com interfaces concretas.
 */
export interface DBModuleLesson {
  id: string;
  title: string;
  objectives?: string;
}

export interface DBModule {
  id: string;
  title: string;
  focus?: string;
  lessons: DBModuleLesson[];
}

export interface DBCourse {
  id: string;
  title: string;
  course_code?: string;
  category_id?: string;
  level?: string;
  description?: string;
  duration_minutes?: number;
  status: 'active' | 'blocked' | 'cancelled';
  created_at: string;
  updated_at: string;
  modules?: DBModule[];
  presentation?: Presentation;
  category?: string;
}


export interface DBQuestion {
  id: string;
  lesson_id: string;
  question_type: 'multiple_choice' | 'true_false' | 'association' | 'fill_blanks' | 'discursive' | 'case_study';
  statement: string;
  metadata: Record<string, unknown>;
  correct_answer?: string | string[];
  created_at: string;
  updated_at: string;
}

export interface DBInstructor {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}




