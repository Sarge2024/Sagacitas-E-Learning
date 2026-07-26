import { create } from 'zustand';
import { Course, Certificate, InstructorQuestion, Slide } from '../types';
import { INITIAL_COURSES, INITIAL_CERTIFICATES } from '../data/coursesData';
import { INITIAL_INSTRUCTOR_QUESTIONS } from '../data/instructorQuestionsData';
import { UnidadeConhecimento } from '../types/edtechExpert';
import { MOCK_UNIDADES_CONHECIMENTO } from '../services/expertService';

interface CourseState {
  courses: Course[];
  selectedCourse: Course | null;
  certificates: Certificate[];
  instructorQuestions: InstructorQuestion[];
  activeSlideForQuestion: Slide | null;
  isSlideQuestionModalOpen: boolean;
  unidades: UnidadeConhecimento[];

  // Actions
  setCourses: (courses: Course[]) => void;
  selectCourse: (course: Course) => void;
  addCertificate: (cert: Omit<Certificate, 'id'>) => void;
  
  // Instructor actions
  addInstructorQuestion: (question: Omit<InstructorQuestion, 'id' | 'timestamp' | 'status'>) => void;
  replyInstructorQuestion: (questionId: string, replyText: string) => void;
  
  // Slide Modal actions
  openSlideQuestionModal: (slide: Slide) => void;
  closeSlideQuestionModal: () => void;

  // Expert Unidades
  setUnidades: (unidades: UnidadeConhecimento[]) => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: INITIAL_COURSES,
  selectedCourse: INITIAL_COURSES.length > 0 ? INITIAL_COURSES[0] : null,
  certificates: INITIAL_CERTIFICATES,
  instructorQuestions: INITIAL_INSTRUCTOR_QUESTIONS,
  activeSlideForQuestion: null,
  isSlideQuestionModalOpen: false,
  unidades: MOCK_UNIDADES_CONHECIMENTO,

  setCourses: (courses) => set({ courses }),
  
  selectCourse: (course) => set({ selectedCourse: course }),
  
  addCertificate: (newCert) => set((state) => ({
    certificates: [{ ...newCert, id: `cert-${Date.now()}` }, ...state.certificates]
  })),

  addInstructorQuestion: (newQ) => set((state) => ({
    instructorQuestions: [{
      ...newQ,
      id: `q-${Date.now()}`,
      timestamp: 'Agora mesmo',
      status: 'pendente',
    }, ...state.instructorQuestions]
  })),

  replyInstructorQuestion: (questionId, replyText) => set((state) => ({
    instructorQuestions: state.instructorQuestions.map(q => 
      q.id === questionId
        ? {
            ...q,
            status: 'respondida',
            instructorResponse: replyText,
            responseTimestamp: 'Agora mesmo',
          }
        : q
    )
  })),

  openSlideQuestionModal: (slide) => set({ activeSlideForQuestion: slide, isSlideQuestionModalOpen: true }),
  
  closeSlideQuestionModal: () => set({ isSlideQuestionModalOpen: false, activeSlideForQuestion: null }),

  setUnidades: (unidades) => set({ unidades })
}));
