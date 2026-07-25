import React, { useState, useEffect } from 'react';
import { ViewMode, Course, Certificate, InstructorQuestion, Slide, OAuthUser } from './types';
import { INITIAL_CERTIFICATES } from './data/coursesData';
import { INITIAL_COURSES } from './data/coursesData';
import { INITIAL_INSTRUCTOR_QUESTIONS } from './data/instructorQuestionsData';
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
import { MOCK_UNIDADES_CONHECIMENTO } from './services/expertService';
import { UnidadeConhecimento } from './types/edtechExpert';
import { ReportsView } from './components/ReportsView';
import { Lock } from 'lucide-react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db, auth } from './lib/firebase';
import { signOut } from 'firebase/auth';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const { courses, setCourses, isLoading: isLoadingCourses, dataSource } = useCoursesFromDB();
  const [selectedCourse, setSelectedCourse] = useState<Course>(INITIAL_COURSES[0]);
  const [certificates, setCertificates] = useState<Certificate[]>(INITIAL_CERTIFICATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [managerActiveTab, setManagerActiveTab] = useState<'students' | 'trainings' | 'certificates' | 'settings' | 'logs'>('students');
  const [expertActiveTab, setExpertActiveTab] = useState<'ucs' | 'bloom' | 'reverse' | 'dnt' | 'synthesis' | 'multitenant' | 'settings' | 'users'>('ucs');
  const [unidades, setUnidades] = useState<UnidadeConhecimento[]>(MOCK_UNIDADES_CONHECIMENTO);
  
  // Simulated Login State
  const [simulatedUser, setSimulatedUser] = useState<OAuthUser | null>(null);

  // OAuth Authentication State
  const [oauthUser, setOauthUser] = useState<OAuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('sagacitas_oauth_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) {
          return parsed;
        }
      }
    } catch (e) {
      // Ignore
    }
    // Default initial user for authenticated environment demonstration
    return null;
  });
  const [isOAuthModalOpen, setIsOAuthModalOpen] = useState(false);

  // Automatically log out if the server was restarted (such as via npm run dev:repair)
  useEffect(() => {
    const checkServerRestart = async () => {
      try {
        const response = await fetch('/api/server-info');
        if (response.ok) {
          const { bootId } = await response.json();
          const lastBootId = localStorage.getItem('sagacitas_last_server_boot_id');
          
          if (lastBootId && lastBootId !== bootId) {
            console.log('🔄 Servidor reiniciado (dev:repair detectado). Limpando logins e sessões...');
            // Executa logout limpo
            setOauthUser(null);
            localStorage.removeItem('sagacitas_oauth_user');
            try {
              await signOut(auth);
            } catch (_) {}
          }
          
          localStorage.setItem('sagacitas_last_server_boot_id', bootId);
        }
      } catch (err) {
        console.warn('⚠️ Não foi possível verificar o status de reinicialização do servidor:', err);
      }
    };
    
    checkServerRestart();
  }, []);

  // Sync active user with Firestore
  useEffect(() => {
    if (!oauthUser) return;
    
    const unsubscribe = onSnapshot(doc(db, 'users', oauthUser.id), (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data() as Partial<OAuthUser>;
        
        // Se for um e-mail admin de semente, garante que ele sempre tenha o papel de Administrador no Firestore e localmente
        const lowerEmail = (oauthUser.email || '').toLowerCase();
        const isSeedAdmin = lowerEmail === 'admin.master@sagacitas.com.br' || lowerEmail === 'sagacitas.assessoria@gmail.com' || lowerEmail === 'gabriel.mendes@sagacitas.edu.br' || lowerEmail === 'sergio.stulzer@sagacitas.com.br';
        
        if (isSeedAdmin && userData.role !== 'Administrador') {
          userData.role = 'Administrador';
          const defaultPermissions = [
            { resourceId: 'dre-simulator', resourceName: 'Simulador de DRE', resourceType: 'ui' as const, c: true, r: true, u: true, d: true },
            { resourceId: 'matrix', resourceName: 'Matriz de Rituais DRE', resourceType: 'ui' as const, c: true, r: true, u: true, d: true },
            { resourceId: 'courses', resourceName: 'Central de Cursos', resourceType: 'ui' as const, c: true, r: true, u: true, d: true },
            { resourceId: 'expert', resourceName: 'Núcleo Expert', resourceType: 'ui' as const, c: true, r: true, u: true, d: true },
            { resourceId: 'instructor-portfolio', resourceName: 'Carteira do Instrutor', resourceType: 'ui' as const, c: true, r: true, u: true, d: true },
            { resourceId: 'rep-performance', resourceName: 'Desempenho de Alunos', resourceType: 'report' as const, c: true, r: true, u: true, d: true },
            { resourceId: 'rep-completion', resourceName: 'Conclusão de Treinamentos', resourceType: 'report' as const, c: true, r: true, u: true, d: true },
            { resourceId: 'rep-ia', resourceName: 'Engajamento & Tutor de IA', resourceType: 'report' as const, c: true, r: true, u: true, d: true },
            { resourceId: 'rep-finance', resourceName: 'Financeiro & Faturamento', resourceType: 'report' as const, c: true, r: true, u: true, d: true },
          ];
          userData.permissions = defaultPermissions;
          
          // Corrige no Firestore em segundo plano
          const userRef = doc(db, 'users', oauthUser.id);
          setDoc(userRef, { role: 'Administrador', permissions: defaultPermissions }, { merge: true }).catch(err => {
            console.warn('⚠️ Erro ao forçar Administrador no Firestore:', err.message);
          });
        }

        setOauthUser(prev => {
          if (!prev) return prev;
          // Avoid infinite loops by only updating if permissions or role changed
          const updatedUser = { ...prev, ...userData };
          try {
            localStorage.setItem('sagacitas_oauth_user', JSON.stringify(updatedUser));
          } catch (e) {}
          return updatedUser;
        });
      } else {
        // Se o usuário não existir no Firestore, cadastra-o automaticamente como "Visitante"
        // com permissões totalmente restritivas (liberação manual pelo Admin Master)
        const defaultPermissions = [
          { resourceId: 'dre-simulator', resourceName: 'Simulador de DRE', resourceType: 'ui', c: false, r: false, u: false, d: false },
          { resourceId: 'matrix', resourceName: 'Matriz de Rituais DRE', resourceType: 'ui', c: false, r: false, u: false, d: false },
          { resourceId: 'courses', resourceName: 'Central de Cursos', resourceType: 'ui', c: false, r: true, u: false, d: false },
          { resourceId: 'expert', resourceName: 'Núcleo Expert', resourceType: 'ui', c: false, r: false, u: false, d: false },
          { resourceId: 'instructor-portfolio', resourceName: 'Carteira do Instrutor', resourceType: 'ui', c: false, r: false, u: false, d: false },
          { resourceId: 'rep-performance', resourceName: 'Desempenho de Alunos', resourceType: 'report', c: false, r: false, u: false, d: false },
          { resourceId: 'rep-completion', resourceName: 'Conclusão de Treinamentos', resourceType: 'report', c: false, r: false, u: false, d: false },
          { resourceId: 'rep-ia', resourceName: 'Engajamento & Tutor de IA', resourceType: 'report', c: false, r: false, u: false, d: false },
          { resourceId: 'rep-finance', resourceName: 'Financeiro & Faturamento', resourceType: 'report', c: false, r: false, u: false, d: false },
        ];

        // Semente de inicialização amigável de e-mails de admins e gestores para testes
        const lowerEmail = (oauthUser.email || '').toLowerCase();
        let initialRole = 'Visitante';
        let initialPermissions = defaultPermissions;

        if (lowerEmail === 'admin.master@sagacitas.com.br' || lowerEmail === 'sagacitas.assessoria@gmail.com' || lowerEmail === 'gabriel.mendes@sagacitas.edu.br' || lowerEmail === 'sergio.stulzer@sagacitas.com.br') {
          initialRole = 'Administrador';
          initialPermissions = defaultPermissions.map(p => ({ ...p, c: true, r: true, u: true, d: true }));
        }

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

  const handleOAuthLogout = async () => {
    setOauthUser(null);
    try {
      localStorage.removeItem('sagacitas_oauth_user');
    } catch (e) {
      // Ignore
    }
    try {
      await signOut(auth);
    } catch (e) {
      // Ignore
    }
  };

  // Computed Active User
  const activeUser = simulatedUser || oauthUser;

  // View Permission Check
  const checkViewPermission = (view: ViewMode): boolean => {
    if (!activeUser) return true;
    if (activeUser.role === 'Administrador') return true;
    
    // Non-restricted views
    if (
      view === 'dashboard' ||
      view === 'lesson' ||
      view === 'courses' ||
      view === 'profile' ||
      view === 'reports'
    ) {
      return true;
    }

    // Map ViewMode to resourceId
    let resourceId = '';
    if (view === 'dre-simulator') resourceId = 'dre-simulator';
    else if (view === 'matrix') resourceId = 'matrix';
    else if (view === 'manager') resourceId = 'courses';
    else if (view === 'expert') resourceId = 'expert';
    else if (view === 'instructor-portfolio') resourceId = 'instructor-portfolio';

    if (!resourceId) return true;

    if (!activeUser.permissions) return true;
    const perm = activeUser.permissions.find(p => p.resourceId === resourceId);
    return perm ? perm.r : false;
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
    if (view === 'expert' && subTab) {
      setExpertActiveTab(subTab as any);
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

  if (!oauthUser) {
    return (
      <LoginPortal 
        onLoginSuccess={(user) => {
          setOauthUser(user);
          try {
            localStorage.setItem('sagacitas_oauth_user', JSON.stringify(user));
          } catch (e) {
            // Ignore
          }
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
            onSelectView={handleSelectView}
            currentUser={activeUser}
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
            oauthUser={oauthUser}
          />
        )}

        {/* Permission Restricted Views Container */}
        {!checkViewPermission(currentView) ? (
          <div className="pt-24 px-5 text-center max-w-md mx-auto space-y-6 animate-fadeIn min-h-[60vh] flex flex-col justify-center">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10 animate-pulse">
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
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded font-bold text-xs uppercase transition-all cursor-pointer shadow-md self-center"
              >
                Voltar para Admin Geral
              </button>
            ) : (
              <button
                onClick={() => setCurrentView('dashboard')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-white/10 rounded font-bold text-xs uppercase transition-all cursor-pointer self-center"
              >
                Ir para o Dashboard
              </button>
            )}
          </div>
        ) : (
          <>
            {currentView === 'dre-simulator' && <DRESimulatorView />}

            {currentView === 'matrix' && <DRERitualMatrixView />}

            {currentView === 'expert' && (
              <EdTechExpertView 
                activeTab={expertActiveTab} 
                onTabChange={(tab) => setExpertActiveTab(tab)} 
                unidades={unidades}
                onUpdateUnidades={setUnidades}
                currentUser={activeUser}
                onSimulateLogin={(user) => setSimulatedUser(user)}
                onRestoreAdmin={() => setSimulatedUser(null)}
                isSimulated={simulatedUser !== null}
              />
            )}

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
                oauthUser={activeUser}
                activeTab={managerActiveTab}
                onTabChange={(tab) => setManagerActiveTab(tab)}
                onUpdateCourses={(updated) => setCourses(updated)}
                unidades={unidades}
              />
            )}

            {currentView === 'reports' && (
              <ReportsView currentUser={activeUser} />
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

