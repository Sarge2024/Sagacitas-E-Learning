import React, { useState, useEffect } from 'react';
import { ViewMode, Course, Certificate, InstructorQuestion, Slide, OAuthUser } from './types';
import { INITIAL_COURSES, INITIAL_CERTIFICATES } from './data/coursesData';
import { INITIAL_INSTRUCTOR_QUESTIONS } from './data/instructorQuestionsData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { LessonPlayerView } from './components/LessonPlayerView';
import { CoursesView } from './components/CoursesView';
import { ProfileView } from './components/ProfileView';
import { DRESimulatorView } from './components/DRESimulatorView';
import { DRERitualMatrixView } from './components/DRERitualMatrixView';
import { InstructorPortfolioView } from './components/InstructorPortfolioView';
import { ManagerToolsView } from './components/ManagerToolsView';
import { SlideQuestionModal } from './components/SlideQuestionModal';
import { OAuthLoginModal } from './components/OAuthLoginModal';
import { AITutorChat } from './components/AITutorChat';
import { ProModal } from './components/ProModal';
import { CertificateModal } from './components/CertificateModal';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<Course>(INITIAL_COURSES[0]);
  const [certificates, setCertificates] = useState<Certificate[]>(INITIAL_CERTIFICATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [managerActiveTab, setManagerActiveTab] = useState<'students' | 'trainings' | 'certificates' | 'settings' | 'logs'>('students');

  // OAuth Authentication State
  const [oauthUser, setOauthUser] = useState<OAuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('sagacitas_oauth_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // Ignore
    }
    // Default initial user for authenticated environment demonstration
    return {
      id: 'usr_sagacitas_default',
      name: 'Gabriel Mendes',
      email: 'sagacitas.assessoria@gmail.com',
      provider: 'Google OAuth 2.0',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      role: 'Aluno Autenticado Sagacitas',
      authenticatedAt: new Date().toISOString(),
    };
  });
  const [isOAuthModalOpen, setIsOAuthModalOpen] = useState(false);

  // OAuth postMessage listener
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      // Validate origin is from preview container or localhost
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && origin !== window.location.origin) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.user) {
        const user = event.data.user as OAuthUser;
        setOauthUser(user);
        try {
          localStorage.setItem('sagacitas_oauth_user', JSON.stringify(user));
        } catch (e) {
          // Ignore
        }
        setIsOAuthModalOpen(false);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  const handleOAuthLogout = () => {
    setOauthUser(null);
    try {
      localStorage.removeItem('sagacitas_oauth_user');
    } catch (e) {
      // Ignore
    }
  };

  // Instructor Questions State (Carteira do Instrutor)
  const [instructorQuestions, setInstructorQuestions] = useState<InstructorQuestion[]>(
    INITIAL_INSTRUCTOR_QUESTIONS
  );

  // Slide Question Modal State
  const [isSlideQuestionModalOpen, setIsSlideQuestionModalOpen] = useState(false);
  const [activeSlideForQuestion, setActiveSlideForQuestion] = useState<Slide | null>(null);

  // Automatically collapse left sidebar whenever user accesses classroom/lesson view
  useEffect(() => {
    if (currentView === 'lesson') {
      setIsSidebarCollapsed(true);
    }
  }, [currentView]);

  // Modals
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);

  // Trigger AI Tutor chat with query if needed
  const [aiTutorInitialOpen, setAiTutorInitialOpen] = useState(false);

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setCurrentView('lesson');
    setIsSidebarCollapsed(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectView = (view: ViewMode, subTab?: string) => {
    setCurrentView(view);
    if (view === 'manager' && subTab) {
      setManagerActiveTab(subTab as any);
    }
    if (view === 'lesson') {
      setIsSidebarCollapsed(true);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAITutorWithQuery = (query?: string) => {
    setAiTutorInitialOpen(true);
  };

  const handleOpenSlideQuestionModal = (slide: Slide) => {
    setActiveSlideForQuestion(slide);
    setIsSlideQuestionModalOpen(true);
  };

  const handleAddQuestion = (
    newQ: Omit<InstructorQuestion, 'id' | 'timestamp' | 'status'>
  ) => {
    const createdQuestion: InstructorQuestion = {
      ...newQ,
      id: `q-${Date.now()}`,
      timestamp: 'Agora mesmo',
      status: 'pendente',
    };
    setInstructorQuestions([createdQuestion, ...instructorQuestions]);
  };

  const handleRegisterCertificate = (newCert: Omit<Certificate, 'id'>) => {
    const createdCert: Certificate = {
      ...newCert,
      id: `cert-${Date.now()}`,
    };
    setCertificates((prev) => [createdCert, ...prev]);
  };

  const handleReplyQuestion = (questionId: string, replyText: string) => {
    setInstructorQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? {
              ...q,
              status: 'respondida',
              instructorResponse: replyText,
              responseTimestamp: 'Agora mesmo',
            }
          : q
      )
    );
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const pendingQuestionsCount = instructorQuestions.filter((q) => q.status === 'pendente').length;

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] font-sans antialiased selection:bg-[#2fd9f4] selection:text-[#001f25]">
      {/* Sidebar navigation */}
      <Sidebar
        currentView={currentView}
        managerActiveTab={managerActiveTab}
        onSelectView={handleSelectView}
        onOpenProModal={() => setIsProModalOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        pendingQuestionsCount={pendingQuestionsCount}
      />

      {/* Header bar */}
      {currentView !== 'lesson' && (
        <Header
          onSelectView={handleSelectView}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (currentView !== 'courses' && q.trim().length > 0) {
              setCurrentView('courses');
            }
          }}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          oauthUser={oauthUser}
          onOpenOAuthModal={() => setIsOAuthModalOpen(true)}
        />
      )}

      {/* View router */}
      <div
        className={`transition-all duration-300 min-h-screen ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {currentView === 'dashboard' && (
          <DashboardView
            courses={courses}
            onSelectCourse={handleSelectCourse}
            onSelectView={handleSelectView}
          />
        )}

        {currentView === 'lesson' && (
          <LessonPlayerView
            course={selectedCourse}
            onBackToDashboard={() => handleSelectView('dashboard')}
            onOpenAITutor={handleOpenAITutorWithQuery}
            onOpenSlideQuestionModal={handleOpenSlideQuestionModal}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
          />
        )}

        {currentView === 'courses' && (
          <CoursesView
            courses={courses}
            onSelectCourse={handleSelectCourse}
            searchQuery={searchQuery}
          />
        )}

        {currentView === 'profile' && (
          <ProfileView
            certificates={certificates}
            onOpenCertificateModal={(cert) => setSelectedCertificate(cert)}
            onOpenProModal={() => setIsProModalOpen(true)}
          />
        )}

        {currentView === 'dre-simulator' && <DRESimulatorView />}

        {currentView === 'matrix' && <DRERitualMatrixView />}

        {currentView === 'instructor-portfolio' && (
          <InstructorPortfolioView
            questions={instructorQuestions}
            certificates={certificates}
            onReplyQuestion={handleReplyQuestion}
            onAddQuestion={handleAddQuestion}
            onRegisterCertificate={handleRegisterCertificate}
            onSelectLessonView={() => handleSelectView('lesson')}
            onOpenCertificateModal={(cert) => setSelectedCertificate(cert)}
          />
        )}

        {currentView === 'manager' && (
          <ManagerToolsView
            courses={courses}
            certificates={certificates}
            onRegisterCertificate={handleRegisterCertificate}
            onSelectView={handleSelectView}
            onOpenCertificateModal={(cert) => setSelectedCertificate(cert)}
            oauthUser={oauthUser}
            activeTab={managerActiveTab}
            onTabChange={(tab) => setManagerActiveTab(tab)}
            onUpdateCourses={(updated) => setCourses(updated)}
          />
        )}
      </div>

      {/* OAuth Login / Manage Modal */}
      <OAuthLoginModal
        isOpen={isOAuthModalOpen}
        onClose={() => setIsOAuthModalOpen(false)}
        user={oauthUser}
        onLoginSuccess={(user) => {
          setOauthUser(user);
          setIsOAuthModalOpen(false);
        }}
        onLogout={handleOAuthLogout}
      />

      {/* Slide Question Modal */}
      {activeSlideForQuestion && (
        <SlideQuestionModal
          isOpen={isSlideQuestionModalOpen}
          onClose={() => setIsSlideQuestionModalOpen(false)}
          slide={activeSlideForQuestion}
          lessonTitle={selectedCourse.modules?.[0]?.lessons?.[0]?.title || 'Aula 04: CMV'}
          lessonNumber="04"
          courseTitle={selectedCourse.title}
          onSubmitQuestion={handleAddQuestion}
          onNavigateToPortfolio={() => handleSelectView('instructor-portfolio')}
        />
      )}

      {/* Global Interactive Floating AI Tutor Widget */}
      <AITutorChat
        initialOpen={aiTutorInitialOpen}
        lessonTitle={selectedCourse.title}
        moduleTitle={selectedCourse.modules?.[0]?.title || 'Módulo 1: Introdução'}
      />

      {/* Pro Modal */}
      <ProModal isOpen={isProModalOpen} onClose={() => setIsProModalOpen(false)} />

      {/* Certificate Modal */}
      <CertificateModal
        certificate={selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
      />
    </div>
  );
}

