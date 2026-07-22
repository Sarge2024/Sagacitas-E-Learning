import React, { useState, useEffect } from 'react';
import { ViewMode, Course, Certificate } from './types';
import { INITIAL_COURSES } from './data/coursesData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { LessonPlayerView } from './components/LessonPlayerView';
import { CoursesView } from './components/CoursesView';
import { ProfileView } from './components/ProfileView';
import { DRESimulatorView } from './components/DRESimulatorView';
import { DRERitualMatrixView } from './components/DRERitualMatrixView';
import { AITutorChat } from './components/AITutorChat';
import { ProModal } from './components/ProModal';
import { CertificateModal } from './components/CertificateModal';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [selectedCourse, setSelectedCourse] = useState<Course>(INITIAL_COURSES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

  const handleSelectView = (view: ViewMode) => {
    setCurrentView(view);
    if (view === 'lesson') {
      setIsSidebarCollapsed(true);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAITutorWithQuery = (query?: string) => {
    setAiTutorInitialOpen(true);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] font-sans antialiased selection:bg-[#2fd9f4] selection:text-[#001f25]">
      {/* Sidebar navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={handleSelectView}
        onOpenProModal={() => setIsProModalOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* Header bar (hidden in full lesson mode for maximum immersion, or present in other views) */}
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
        />
      )}

      {/* View router */}
      <div className={`transition-all duration-300 min-h-screen ${
        isSidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}>
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
            onOpenCertificateModal={(cert) => setSelectedCertificate(cert)}
            onOpenProModal={() => setIsProModalOpen(true)}
          />
        )}

        {currentView === 'dre-simulator' && (
          <DRESimulatorView />
        )}

        {currentView === 'matrix' && (
          <DRERitualMatrixView />
        )}
      </div>

      {/* Global Interactive Floating AI Tutor Widget */}
      <AITutorChat
        initialOpen={aiTutorInitialOpen}
        lessonTitle={selectedCourse.title}
        moduleTitle={selectedCourse.modules?.[0]?.title || 'Módulo 1: Introdução'}
      />

      {/* Pro Modal */}
      <ProModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
      />

      {/* Certificate Modal */}
      <CertificateModal
        certificate={selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
      />
    </div>
  );
}
