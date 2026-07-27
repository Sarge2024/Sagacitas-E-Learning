import React, { useState, useEffect } from 'react';
import { ViewMode, Course, Certificate, InstructorQuestion, Slide, OAuthUser } from './types';
import { useCoursesFromDB } from './hooks/useCoursesFromDB';
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
import { EdTechExpertView } from './components/expert/EdTechExpertView';
import { SlideQuestionModal } from './components/SlideQuestionModal';
import { OAuthLoginModal } from './components/OAuthLoginModal';
import { LoginPortal } from './components/LoginPortal';
import { AITutorChat } from './components/AITutorChat';
import { ProModal } from './components/ProModal';
import { CertificateModal } from './components/CertificateModal';
import { ReportsView } from './components/ReportsView';
import { Lock } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, auth } from './lib/firebase';
import { signOut } from 'firebase/auth';
import { getPermissionsForRole } from './utils/rbac';

// Zustand stores
import { useAuthStore } from './store/useAuthStore';
import { useNavigationStore } from './store/useNavigationStore';
import { useCourseStore } from './store/useCourseStore';

export default function App() {
  // Navigation State
  const currentView = useNavigationStore(state => state.currentView);
  const isSidebarCollapsed = useNavigationStore(state => state.isSidebarCollapsed);
  const managerActiveTab = useNavigationStore(state => state.managerActiveTab);
  const expertActiveTab = useNavigationStore(state => state.expertActiveTab);
  const reportsActiveTab = useNavigationStore(state => state.reportsActiveTab);
  const searchQuery = useNavigationStore(state => state.searchQuery);
  const setView = useNavigationStore(state => state.setView);
  const toggleSidebar = useNavigationStore(state => state.toggleSidebar);
  const setManagerTab = useNavigationStore(state => state.setManagerTab);
  const setExpertTab = useNavigationStore(state => state.setExpertTab);
  const setSearchQuery = useNavigationStore(state => state.setSearchQuery);

  // Auth State
  const oauthUser = useAuthStore(state => state.oauthUser);
  const simulatedUser = useAuthStore(state => state.simulatedUser);
  const setOauthUser = useAuthStore(state => state.setOauthUser);
  const setSimulatedUser = useAuthStore(state => state.setSimulatedUser);
  const logout = useAuthStore(state => state.logout);
  const getActiveUser = useAuthStore(state => state.getActiveUser);
  const checkViewPermission = useAuthStore(state => state.checkViewPermission);
  
  // Course State
  const { courses, setCourses, isLoading: isLoadingCourses } = useCoursesFromDB(); // Hook populates DB data automatically
  const selectedCourse = useCourseStore(state => state.selectedCourse);
  const selectCourse = useCourseStore(state => state.selectCourse);
  const certificates = useCourseStore(state => state.certificates);
  const addCertificate = useCourseStore(state => state.addCertificate);
  
  const instructorQuestions = useCourseStore(state => state.instructorQuestions);
  const addInstructorQuestion = useCourseStore(state => state.addInstructorQuestion);
  const replyInstructorQuestion = useCourseStore(state => state.replyInstructorQuestion);
  
  const activeSlideForQuestion = useCourseStore(state => state.activeSlideForQuestion);
  const isSlideQuestionModalOpen = useCourseStore(state => state.isSlideQuestionModalOpen);
  const openSlideQuestionModal = useCourseStore(state => state.openSlideQuestionModal);
  const closeSlideQuestionModal = useCourseStore(state => state.closeSlideQuestionModal);
  
  const unidades = useCourseStore(state => state.unidades);
  const setUnidades = useCourseStore(state => state.setUnidades);

  // Local UI State for Modals that don't need global state
  const [isOAuthModalOpen, setIsOAuthModalOpen] = useState(false);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [aiTutorInitialOpen, setAiTutorInitialOpen] = useState(false);

  // Preserve server info bootId tracking without logging out the user
  useEffect(() => {
    const checkServerRestart = async () => {
      try {
        const response = await fetch('/api/server-info');
        if (response.ok) {
          const { bootId } = await response.json();
          localStorage.setItem('sagacitas_last_server_boot_id', bootId);
        }
      } catch (err) {
        // Quiet fallback
      }
    };
    
    checkServerRestart();
  }, []);

  // Sync active user with Firestore
  useEffect(() => {
    if (!oauthUser?.id) return;
    
    const unsubscribe = onSnapshot(doc(db, 'users', oauthUser.id), (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data() as Partial<OAuthUser>;
        
        // Se for um e-mail admin de semente ou tiver role Admin Master no Firestore
        const lowerEmail = (oauthUser.email || '').toLowerCase();
        const isSeedAdmin = lowerEmail === 'admin.master@sagacitas.com.br' || 
                            lowerEmail === 'sagacitas.assessoria@gmail.com' || 
                            lowerEmail === 'gabriel.mendes@sagacitas.edu.br' || 
                            lowerEmail === 'sergio.stulzer@sagacitas.com.br';
        
        if (isSeedAdmin || userData.role === 'Admin Master') {
          userData.role = 'Admin Master';
          userData.permissions = getPermissionsForRole('Admin Master');
          
          // Corrige no Firestore em segundo plano se necessário
          const userRef = doc(db, 'users', oauthUser.id);
          setDoc(userRef, { role: 'Admin Master', permissions: userData.permissions }, { merge: true }).catch(err => {
            console.warn('⚠️ Erro ao forçar Admin Master no Firestore:', err.message);
          });
        }

        // We merge with current oauthUser but passing it fully so the store sets it correctly
        setOauthUser({ ...oauthUser, ...userData } as OAuthUser);
      } else {
        // Se o usuário não existir no Firestore, cadastra-o automaticamente no Firestore
        const lowerEmail = (oauthUser.email || '').toLowerCase();
        const isSeedAdmin = lowerEmail === 'admin.master@sagacitas.com.br' || 
                            lowerEmail === 'sagacitas.assessoria@gmail.com' || 
                            lowerEmail === 'gabriel.mendes@sagacitas.edu.br' || 
                            lowerEmail === 'sergio.stulzer@sagacitas.com.br';
        const initialRole = isSeedAdmin ? 'Admin Master' : 'Visitante';
        const initialPermissions = getPermissionsForRole(initialRole);

        const userRef = doc(db, 'users', oauthUser.id);
        setDoc(userRef, {
          id: oauthUser.id,
          name: oauthUser.name,
          email: oauthUser.email,
          avatar: oauthUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(oauthUser.name)}`,
          provider: oauthUser.provider || 'OAuth 2.0',
          role: initialRole,
          status: 'active',
          company_name: oauthUser.company_name || 'Nenhuma (Inscrição Individual)',
          enrollment_type: oauthUser.enrollment_type || 'individual',
          permissions: initialPermissions,
          authenticatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        }, { merge: true }).catch(err => {
          console.warn('⚠️ Erro ao registrar visitante no Firestore:', err.message);
        });
      }
    }, (error) => {
      // Firestore offline or permission error — don't crash, just log
      console.warn('⚠️ Firestore sync listener error (offline?):', error.message);
    });

    return () => unsubscribe();
  }, [oauthUser?.id]);

  // OAuth postMessage listener
  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      // Validate origin is from preview container or localhost
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1') && origin !== window.location.origin) {
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.user) {
        setOauthUser(event.data.user as OAuthUser);
        setIsOAuthModalOpen(false);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [setOauthUser]);

  const handleOAuthLogout = async () => {
    logout();
    try {
      await signOut(auth);
    } catch (e) {
      // Ignore
    }
  };

  const handleSelectCourse = (course: Course) => {
    selectCourse(course);
    setView('lesson');
  };

  const handleOpenAITutorWithQuery = (query?: string) => {
    setAiTutorInitialOpen(true);
  };

  const activeUser = getActiveUser();
  const pendingQuestionsCount = instructorQuestions.filter((q) => q.status === 'pendente').length;

  if (!oauthUser) {
    return (
      <LoginPortal 
        onLoginSuccess={(user) => {
          setOauthUser(user);
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] font-sans antialiased selection:bg-[#2fd9f4] selection:text-[#001f25]">
      {/* Sidebar navigation */}
      <Sidebar
        currentView={currentView}
        managerActiveTab={managerActiveTab}
        expertActiveTab={expertActiveTab}
        reportsActiveTab={reportsActiveTab}
        onSelectView={setView}
        onOpenProModal={() => setIsProModalOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        pendingQuestionsCount={pendingQuestionsCount}
      />

      {/* Header bar */}
      {currentView !== 'lesson' && (
        <Header
          onSelectView={setView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          oauthUser={oauthUser}
          onOpenOAuthModal={() => setIsOAuthModalOpen(true)}
          onLogout={handleOAuthLogout}
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
            onSelectView={setView}
            currentUser={activeUser}
          />
        )}

        {currentView === 'lesson' && selectedCourse && (
          <LessonPlayerView
            course={selectedCourse}
            onBackToDashboard={() => setView('dashboard')}
            onOpenAITutor={handleOpenAITutorWithQuery}
            onOpenSlideQuestionModal={openSlideQuestionModal}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebar}
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
            oauthUser={oauthUser}
          />
        )}

        {/* Permission Restricted Views Container */}
        {!checkViewPermission(currentView) ? (
          <div className="pt-24 px-5 text-center max-w-md mx-auto space-y-6 animate-fadeIn min-h-[60vh] flex flex-col justify-center">
            <div className="w-16 h-16 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10 animate-pulse">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white">Acesso Negado</h2>
              <p className="text-xs text-[#94a3b8] leading-normal font-medium">
                Sua conta atual (<strong>{activeUser?.name}</strong>) não possui permissão de leitura para acessar esta área do sistema.
              </p>
            </div>
            {simulatedUser ? (
              <button
                onClick={() => setSimulatedUser(null)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-xs uppercase transition-all cursor-pointer shadow-2xs self-center"
              >
                Voltar para Admin Geral
              </button>
            ) : (
              <button
                onClick={() => setView('dashboard')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-white/10 rounded font-bold text-xs uppercase transition-all cursor-pointer self-center"
              >
                Ir para o Dashboard
              </button>
            )}
          </div>
        ) : (
          <>
            {currentView === 'assignments' && <DRESimulatorView />}

            {currentView === 'calendar' && <DRERitualMatrixView />}

            {currentView === 'expert' && (
              <EdTechExpertView 
                activeTab={expertActiveTab} 
                onTabChange={setExpertTab} 
                unidades={unidades}
                onUpdateUnidades={setUnidades}
                currentUser={activeUser}
                onSimulateLogin={setSimulatedUser}
                onRestoreAdmin={() => setSimulatedUser(null)}
                isSimulated={simulatedUser !== null}
              />
            )}

            {currentView === 'instructor-portfolio' && (
              <InstructorPortfolioView
                questions={instructorQuestions}
                certificates={certificates}
                onReplyQuestion={replyInstructorQuestion}
                onAddQuestion={addInstructorQuestion}
                onRegisterCertificate={addCertificate}
                onSelectLessonView={() => setView('lesson')}
                onOpenCertificateModal={(cert) => setSelectedCertificate(cert)}
              />
            )}

            {currentView === 'manager' && (
              <ManagerToolsView
                courses={courses}
                certificates={certificates}
                onRegisterCertificate={addCertificate}
                onSelectView={setView}
                onOpenCertificateModal={(cert) => setSelectedCertificate(cert)}
                oauthUser={activeUser}
                activeTab={managerActiveTab}
                onTabChange={setManagerTab}
                onUpdateCourses={(updatedCourses) => {
                  setCourses(updatedCourses);
                  // Sincronizar o curso selecionado no Zustand caso ele tenha sido atualizado
                  const currentSel = useCourseStore.getState().selectedCourse;
                  if (currentSel) {
                    const match = updatedCourses.find(c => c.id === currentSel.id);
                    if (match) {
                      useCourseStore.getState().selectCourse(match);
                    }
                  }
                }}
                unidades={unidades}
              />
            )}

            {currentView === 'reports' && (
              <ReportsView 
                currentUser={activeUser}
              />
            )}
          </>
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
      {activeSlideForQuestion && selectedCourse && (
        <SlideQuestionModal
          isOpen={isSlideQuestionModalOpen}
          onClose={closeSlideQuestionModal}
          slide={activeSlideForQuestion}
          lessonTitle={selectedCourse.modules?.[0]?.lessons?.[0]?.title || 'Aula'}
          lessonNumber="01"
          courseTitle={selectedCourse.title}
          onSubmitQuestion={addInstructorQuestion}
          onNavigateToPortfolio={() => setView('instructor-portfolio')}
        />
      )}

      {/* Global Interactive Floating AI Tutor Widget */}
      {selectedCourse && (
        <AITutorChat
          initialOpen={aiTutorInitialOpen}
          lessonTitle={selectedCourse.title}
          moduleTitle={selectedCourse.modules?.[0]?.title || 'Módulo'}
        />
      )}

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
