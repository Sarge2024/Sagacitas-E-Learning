export type ViewMode = 'dashboard' | 'lesson' | 'courses' | 'profile' | 'dre-simulator' | 'matrix' | 'instructor-portfolio' | 'manager' | 'expert' | 'reports';

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
  course_code?: string;
  status?: 'active' | 'blocked' | 'cancelled';
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

export interface DBCourseCategory {
  id: string;
  code: string; // 3-digit code format
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
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
}

export interface DBDiscipline {
  id: string;
  course_id: string;
  title: string;
  sequence_order: number;
  created_at: string;
  updated_at: string;
}

export interface DBLesson {
  id: string;
  title: string;
  content?: string;
  video_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DBDisciplineLesson {
  id: string;
  discipline_id: string;
  lesson_id: string;
  sequence_order: number;
  created_at: string;
}

export interface DBQuestion {
  id: string;
  lesson_id: string;
  question_type: 'multiple_choice' | 'true_false' | 'association' | 'fill_blanks' | 'discursive' | 'case_study';
  statement: string;
  metadata: Record<string, any>;
  correct_answer?: any;
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

export interface DBClass {
  id: string;
  discipline_id: string;
  instructor_id: string;
  title: string;
  start_date: string;
  end_date: string;
  max_students: number;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface DBClassEnrollment {
  id: string;
  class_id: string;
  student_id: string;
  enrollment_date: string;
  enrollment_number?: string;
}


