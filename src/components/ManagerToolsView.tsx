import React, { useState, useEffect } from 'react';
import { Course, Certificate, OAuthUser } from '../types';
import {
  ShieldCheck,
  Users,
  BookOpen,
  Award,
  Sliders,
  FileText,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  UserX,
  Sparkles,
  TrendingUp,
  Activity,
  BarChart3,
  Key,
  Database,
  Lock,
  Mail,
  RefreshCw,
  Eye,
  Settings,
  Zap,
  GraduationCap,
  Briefcase,
  Layers,
  Clock,
  Edit3,
  Copy,
  Trash2,
  ChevronRight,
  Filter,
  Check,
  Presentation,
  FolderPlus,
} from 'lucide-react';
import { RegisterCertificateModal } from './RegisterCertificateModal';
import { CourseSlideEditorModal } from './presentation/CourseSlideEditorModal';
import { CourseUCComposerView } from './expert/CourseUCComposerView';
import { UnidadeConhecimento } from '../types/edtechExpert';

export type ManagerTabType = 'students' | 'trainings' | 'certificates' | 'settings' | 'logs';

interface ManagerToolsViewProps {
  courses: Course[];
  certificates: Certificate[];
  onRegisterCertificate: (certificate: Omit<Certificate, 'id'>) => void;
  onSelectView: (view: any, subTab?: string) => void;
  onOpenCertificateModal: (cert: Certificate) => void;
  oauthUser: OAuthUser | null;
  activeTab?: ManagerTabType;
  onTabChange?: (tab: ManagerTabType) => void;
  onUpdateCourses?: (courses: Course[]) => void;
  unidades?: UnidadeConhecimento[];
}

export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  enrolledCourseTitle: string;
  progressPercent: number;
  completedLessonsText: string;
  dreGrade: string;
  status: 'Ativo' | 'Em Andamento' | 'Concluído' | 'Inativo';
  certificateIssued: boolean;
  lastAccess: string;
}

const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: 'std-1',
    name: 'Gabriel Mendes',
    email: 'sagacitas.assessoria@gmail.com',
    company: 'Sagacitas Assessoria',
    role: 'Gestor Gastronômico',
    enrolledCourseTitle: 'Engenharia de Cardápio & Lucratividade',
    progressPercent: 100,
    completedLessonsText: '12 de 12 aulas',
    dreGrade: '9.8 / 10',
    status: 'Concluído',
    certificateIssued: true,
    lastAccess: 'Hoje às 10:24',
  },
  {
    id: 'std-2',
    name: 'Mariana Costa',
    email: 'mariana.costa@alchymist.com.br',
    company: 'Alchymist Beach Club',
    role: 'Chef Executiva',
    enrolledCourseTitle: 'Dominando a DRE no Seu Restaurante',
    progressPercent: 85,
    completedLessonsText: '10 de 12 aulas',
    dreGrade: '9.2 / 10',
    status: 'Em Andamento',
    certificateIssued: false,
    lastAccess: 'Hoje às 08:15',
  },
  {
    id: 'std-3',
    name: 'Lucas Oliveira',
    email: 'lucas.oliveira@sagacitas.edu.br',
    company: 'Bistrô Sabor & Arte',
    role: 'Gerente Operacional',
    enrolledCourseTitle: 'Engenharia de Cardápio & Lucratividade',
    progressPercent: 60,
    completedLessonsText: '7 de 12 aulas',
    dreGrade: '8.5 / 10',
    status: 'Em Andamento',
    certificateIssued: false,
    lastAccess: 'Ontem às 18:40',
  },
  {
    id: 'std-4',
    name: 'Beatriz Santos',
    email: 'beatriz.santos@gastronomia.com.br',
    company: 'Gastronomia Santos',
    role: 'Consultora de Alimentos',
    enrolledCourseTitle: 'Gestão Eficiente de Estoque e CMV',
    progressPercent: 100,
    completedLessonsText: '8 de 8 aulas',
    dreGrade: '9.6 / 10',
    status: 'Concluído',
    certificateIssued: true,
    lastAccess: 'Há 2 dias',
  },
  {
    id: 'std-5',
    name: 'Rodrigo Silva',
    email: 'rodrigo.silva@restaurante.com.br',
    company: 'Restaurante Varanda Gourmet',
    role: 'Proprietário',
    enrolledCourseTitle: 'Dominando a DRE no Seu Restaurante',
    progressPercent: 35,
    completedLessonsText: '4 de 12 aulas',
    dreGrade: '7.8 / 10',
    status: 'Em Andamento',
    certificateIssued: false,
    lastAccess: 'Há 3 dias',
  },
  {
    id: 'std-6',
    name: 'Aline Vasconcelos',
    email: 'aline.v@sagacitas.edu.br',
    company: 'Café & Coquetelaria',
    role: 'Supervisora de Salão',
    enrolledCourseTitle: 'Fluxo de Caixa e Planejamento Financeiro',
    progressPercent: 15,
    completedLessonsText: '2 de 10 aulas',
    dreGrade: '7.0 / 10',
    status: 'Inativo',
    certificateIssued: false,
    lastAccess: 'Há 14 dias',
  },
];

interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  type: 'cert' | 'user' | 'course' | 'system';
}

const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: 'Hoje, 10:18',
    actor: 'Gabriel Mendes (Gestor)',
    action: 'Emitiu certificado para Mariana Costa no curso Engenharia de Cardápio',
    type: 'cert',
  },
  {
    id: 'log-2',
    timestamp: 'Hoje, 09:05',
    actor: 'Gabriel Mendes (Gestor)',
    action: 'Atualizou configurações de aprovação da DRE para 70%',
    type: 'system',
  },
  {
    id: 'log-3',
    timestamp: 'Ontem, 16:42',
    actor: 'Mariana Costa (Coordenador)',
    action: 'Ativou o módulo de Inteligência Artificial Alchymist Tutor para todos os alunos',
    type: 'system',
  },
];

export const ManagerToolsView: React.FC<ManagerToolsViewProps> = ({
  courses,
  certificates,
  onRegisterCertificate,
  onSelectView,
  onOpenCertificateModal,
  oauthUser,
  activeTab: externalTab,
  onTabChange,
  onUpdateCourses,
  unidades = [],
}) => {
  const [internalTab, setInternalTab] = useState<ManagerTabType>('students');
  const currentTab = externalTab || internalTab;

  const handleSetTab = (tab: ManagerTabType) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  // Student State
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentCourseFilter, setStudentCourseFilter] = useState('Todos');
  const [studentStatusFilter, setStudentStatusFilter] = useState('Todos');

  // Modals state for Students
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [newStdName, setNewStdName] = useState('');
  const [newStdEmail, setNewStdEmail] = useState('');
  const [newStdCompany, setNewStdCompany] = useState('');
  const [newStdRole, setNewStdRole] = useState('Aluno Gastronômico');
  const [newStdCourse, setNewStdCourse] = useState(courses[0]?.title || 'Engenharia de Cardápio');

  // Student details modal
  const [selectedStudentForDetails, setSelectedStudentForDetails] = useState<StudentRecord | null>(null);

  // Student Edit / Delete state
  const [editingStudent, setEditingStudent] = useState<StudentRecord | null>(null);
  const [editStdName, setEditStdName] = useState('');
  const [editStdEmail, setEditStdEmail] = useState('');
  const [editStdCompany, setEditStdCompany] = useState('');
  const [editStdRole, setEditStdRole] = useState('');
  const [editStdCourse, setEditStdCourse] = useState('');
  const [editStdProgress, setEditStdProgress] = useState(0);
  const [editStdStatus, setEditStdStatus] = useState<StudentRecord['status']>('Em Andamento');
  const [editStdGrade, setEditStdGrade] = useState('');
  const [studentToDelete, setStudentToDelete] = useState<StudentRecord | null>(null);

  // Trainings State
  const [trainingSearch, setTrainingSearch] = useState('');
  const [trainingCategoryFilter, setTrainingCategoryFilter] = useState('Todas');

  // Modals state for Trainings
  const [isTrainingModalOpen, setIsTrainingModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [trainingTitle, setTrainingTitle] = useState('');
  const [trainingCategory, setTrainingCategory] = useState('Finanças & DRE');
  const [trainingLevel, setTrainingLevel] = useState<'Iniciante' | 'Intermediário' | 'Avançado'>('Intermediário');
  const [trainingWorkload, setTrainingWorkload] = useState('20h');
  const [trainingDescription, setTrainingDescription] = useState('');

  // Register Cert Modal
  const [isRegisterCertModalOpen, setIsRegisterCertModalOpen] = useState(false);
  const [certSearch, setCertSearch] = useState('');

  // Course Slide Editor State
  const [selectedCourseForSlides, setSelectedCourseForSlides] = useState<Course | null>(null);
  const [selectedUcIdForSlides, setSelectedUcIdForSlides] = useState<string>('');
  const [isSlideEditorOpen, setIsSlideEditorOpen] = useState(false);

  // Course UC Composer state
  const [composingCourse, setComposingCourse] = useState<Course | null>(null);

  // Categories management state
  const [categories, setCategories] = useState<string[]>([
    'Finanças & DRE',
    'Engenharia de Cardápio',
    'Gestão de Custos & CMV',
    'Gestão de Equipes'
  ]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  useEffect(() => {
    if (courses && courses.length > 0) {
      const existingCats = Array.from(new Set(courses.map(c => c.category).filter(Boolean) as string[]));
      setCategories(prev => {
        const merged = Array.from(new Set([...prev, ...existingCats]));
        return merged;
      });
    }
  }, [courses]);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // System Settings
  const [aiTutorEnabled, setAiTutorEnabled] = useState(true);
  const [oauthRequired, setOauthRequired] = useState(false);
  const [autoIssueCertificates, setAutoIssueCertificates] = useState(true);

  // Logs
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_LOGS);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Student Actions
  const handleOpenEditStudentModal = (student: StudentRecord) => {
    setEditingStudent(student);
    setEditStdName(student.name);
    setEditStdEmail(student.email);
    setEditStdCompany(student.company);
    setEditStdRole(student.role);
    setEditStdCourse(student.enrolledCourseTitle);
    setEditStdProgress(student.progressPercent);
    setEditStdStatus(student.status);
    setEditStdGrade(student.dreGrade);
  };

  const handleEditStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent || !editStdName.trim() || !editStdEmail.trim()) return;

    setStudents((prev) =>
      prev.map((s) =>
        s.id === editingStudent.id
          ? {
              ...s,
              name: editStdName,
              email: editStdEmail,
              company: editStdCompany || 'Restaurante Parceiro',
              role: editStdRole,
              enrolledCourseTitle: editStdCourse,
              progressPercent: editStdProgress,
              completedLessonsText: `${Math.floor((editStdProgress / 100) * 12)} de 12 aulas`,
              status: editStdStatus,
              dreGrade: editStdGrade,
            }
          : s
      )
    );

    setLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: 'Agora mesmo',
        actor: `${oauthUser?.name || 'Gabriel Mendes'} (Gestor)`,
        action: `Editou os dados do aluno ${editStdName}`,
        type: 'user',
      },
      ...logs,
    ]);

    setEditingStudent(null);
    showToast(`Aluno ${editStdName} atualizado com sucesso!`);
  };

  const handleDeleteStudentClick = (student: StudentRecord) => {
    setStudentToDelete(student);
  };

  const handleDeleteStudentConfirm = () => {
    if (!studentToDelete) return;

    setStudents((prev) => prev.filter((s) => s.id !== studentToDelete.id));

    setLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: 'Agora mesmo',
        actor: `${oauthUser?.name || 'Gabriel Mendes'} (Gestor)`,
        action: `Excluiu o aluno ${studentToDelete.name}`,
        type: 'user',
      },
      ...logs,
    ]);

    showToast(`Aluno ${studentToDelete.name} excluído!`);
    setStudentToDelete(null);
  };

  const handleToggleStudentStatus = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const nextStatus = s.status === 'Inativo' ? 'Em Andamento' : 'Inativo';
          showToast(`Status de ${s.name} alterado para ${nextStatus}`);
          return { ...s, status: nextStatus };
        }
        return s;
      })
    );
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStdName.trim() || !newStdEmail.trim()) return;

    const newStudent: StudentRecord = {
      id: `std-${Date.now()}`,
      name: newStdName,
      email: newStdEmail,
      company: newStdCompany || 'Restaurante Parceiro',
      role: newStdRole,
      enrolledCourseTitle: newStdCourse,
      progressPercent: 0,
      completedLessonsText: '0 de 12 aulas',
      dreGrade: 'Aguardando',
      status: 'Em Andamento',
      certificateIssued: false,
      lastAccess: 'Agora mesmo',
    };

    setStudents([newStudent, ...students]);

    setLogs([
      {
        id: `log-${Date.now()}`,
        timestamp: 'Agora mesmo',
        actor: `${oauthUser?.name || 'Gabriel Mendes'} (Gestor)`,
        action: `Matriculou o aluno ${newStdName} no treinamento ${newStdCourse}`,
        type: 'user',
      },
      ...logs,
    ]);

    setNewStdName('');
    setNewStdEmail('');
    setNewStdCompany('');
    setIsAddStudentModalOpen(false);
    showToast(`Aluno ${newStdName} matriculado com sucesso!`);
  };

  const handleIssueDirectCertificate = (student: StudentRecord) => {
    const newCert: Omit<Certificate, 'id'> = {
      courseTitle: student.enrolledCourseTitle,
      studentName: student.name,
      issueDate: new Date().toLocaleDateString('pt-BR'),
      credentialId: `SAG-${Math.floor(100000 + Math.random() * 900000)}`,
      hours: 24,
      pdfName: `Certificado_${student.name.replace(/\s+/g, '_')}.pdf`,
    };

    onRegisterCertificate(newCert);

    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, certificateIssued: true, status: 'Concluído', progressPercent: 100 } : s))
    );

    showToast(`Certificado emitido para ${student.name}!`);
  };

  // Training Actions
  const handleOpenNewTrainingModal = () => {
    setEditingCourse(null);
    setTrainingTitle('');
    setTrainingCategory('Finanças & DRE');
    setTrainingLevel('Intermediário');
    setTrainingWorkload('20h');
    setTrainingDescription('');
    setIsTrainingModalOpen(true);
  };

  const handleOpenEditTrainingModal = (course: Course) => {
    setEditingCourse(course);
    setTrainingTitle(course.title);
    setTrainingCategory(course.category || 'Finanças & DRE');
    setTrainingLevel((course.level as any) || 'Intermediário');
    setTrainingWorkload('24h');
    setTrainingDescription(course.description || '');
    setIsTrainingModalOpen(true);
  };

  const handleSaveTrainingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainingTitle.trim()) return;

    if (editingCourse && onUpdateCourses) {
      const updated = courses.map((c) =>
        c.id === editingCourse.id
          ? {
              ...c,
              title: trainingTitle,
              category: trainingCategory,
              level: trainingLevel,
              description: trainingDescription,
            }
          : c
      );
      onUpdateCourses(updated);
      showToast(`Treinamento "${trainingTitle}" atualizado!`);
    } else if (onUpdateCourses) {
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        title: trainingTitle,
        category: trainingCategory,
        description: trainingDescription || 'Treinamento completo para alta performance gastronômica.',
        progress: 0,
        completedLessons: 0,
        totalLessons: 10,
        level: trainingLevel,
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
        modules: [
          {
            id: `m-1`,
            title: 'Módulo 1: Fundamentos & Estruturação',
            duration: '4h',
            lessons: [
              {
                id: `l-1`,
                number: '01',
                title: 'Aula 01: Introdução e Métricas Essenciais',
                duration: '25 min',
                completed: false,
                active: true,
              },
            ],
          },
        ],
      };
      onUpdateCourses([newCourse, ...courses]);
      showToast(`Novo treinamento "${trainingTitle}" criado com sucesso!`);
    }

    setIsTrainingModalOpen(false);
  };

  // Filtered Lists
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.company.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesCourse = studentCourseFilter === 'Todos' || s.enrolledCourseTitle === studentCourseFilter;
    const matchesStatus = studentStatusFilter === 'Todos' || s.status === studentStatusFilter;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(trainingSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(trainingSearch.toLowerCase());
    const matchesCat = trainingCategoryFilter === 'Todas' || c.category === trainingCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const filteredCertificates = certificates.filter(
    (c) =>
      c.courseTitle.toLowerCase().includes(certSearch.toLowerCase()) ||
      (c.studentName && c.studentName.toLowerCase().includes(certSearch.toLowerCase())) ||
      c.credentialId.toLowerCase().includes(certSearch.toLowerCase())
  );

  // If composing a course, show the UC composer view instead
  if (composingCourse) {
    return (
      <>
        <CourseUCComposerView
          course={composingCourse}
          unidades={unidades}
          onBack={() => setComposingCourse(null)}
          onOpenSlideEditor={(course, filteredUcIds) => {
            setSelectedCourseForSlides(course);
            if (filteredUcIds && filteredUcIds.length > 0) {
              setSelectedUcIdForSlides(filteredUcIds[0]);
            } else {
              setSelectedUcIdForSlides('');
            }
            setIsSlideEditorOpen(true);
          }}
        />
        {/* Modal Editor & Player Nativo de Slides Interativos */}
        {selectedCourseForSlides && (
          <CourseSlideEditorModal
            course={selectedCourseForSlides}
            isOpen={isSlideEditorOpen}
            onClose={() => {
              setIsSlideEditorOpen(false);
              setSelectedCourseForSlides(null);
            }}
            onSaveCourseSlides={() => {
              showToast(`Slides do treinamento atualizados com sucesso!`);
            }}
            unidades={unidades}
            initialUcId={selectedUcIdForSlides}
          />
        )}
      </>
    );
  }

  return (
    <div id="manager-tools-view" className="pt-16 md:pt-18 px-3 md:px-5 pb-8 max-w-[1440px] mx-auto space-y-4 bg-[#f9f9ff] min-h-screen">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white font-bold px-3.5 py-2 rounded shadow-lg flex items-center gap-2 animate-bounce border border-blue-400">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs">{toastMessage}</span>
        </div>
      )}

      {/* Main Header / Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-4 rounded-md border border-slate-200 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#1890ff] text-[10px] font-black uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Alchymist Manager • Menu Gestor</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            {currentTab === 'students' && 'Central de Gestão de Alunos'}
            {currentTab === 'trainings' && 'Central de Gestão de Cursos'}
            {currentTab === 'certificates' && 'Gestão de Certificados Emitidos'}
            {currentTab === 'logs' && 'Logs de Auditoria Administrativa'}
          </h1>
          <p className="text-xs text-slate-600 max-w-2xl font-medium">
            {currentTab === 'students' && 'Acompanhe a evolução individual dos alunos, matricule turmas e gerencie o engajamento geral.'}
            {currentTab === 'trainings' && 'Gerencie a grade curricular, crie novos treinamentos e organize as unidades de conhecimento.'}
            {currentTab === 'certificates' && 'Consulte, emita e valide os certificados de conclusão de treinamentos de seus alunos.'}
            {currentTab === 'logs' && 'Monitore o histórico completo das ações administrativas executadas na plataforma.'}
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {currentTab === 'students' && (
            <button
              onClick={() => setIsAddStudentModalOpen(true)}
              className="px-3.5 py-2 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Matricular Aluno</span>
            </button>
          )}

          {currentTab === 'trainings' && (
            <button
              onClick={handleOpenNewTrainingModal}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Novo Treinamento</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      {(currentTab === 'trainings' || currentTab === 'logs') && (
        <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1.5 scrollbar-none">
          <button
            onClick={() => handleSetTab('trainings')}
            className={`px-3.5 py-2 rounded font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              currentTab === 'trainings'
                ? 'bg-[#1890ff] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>📚 Grade de Treinamentos ({courses.length})</span>
          </button>

          <button
            onClick={() => handleSetTab('logs')}
            className={`px-3.5 py-2 rounded font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
              currentTab === 'logs'
                ? 'bg-[#1890ff] text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>📜 Logs de Auditoria ({logs.length})</span>
          </button>
        </div>
      )}

      {/* SUBMENU 1: GESTÃO DE ALUNOS */}
      {currentTab === 'students' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-center gap-2 flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Buscar aluno, e-mail ou empresa..."
                  className="w-full bg-slate-50 border border-slate-200 rounded pl-8 pr-2.5 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1890ff] font-medium"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-[#1890ff] shrink-0" />
                <select
                  value={studentCourseFilter}
                  onChange={(e) => setStudentCourseFilter(e.target.value)}
                  className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] cursor-pointer font-medium"
                >
                  <option value="Todos">Todos os Treinamentos</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>

                <select
                  value={studentStatusFilter}
                  onChange={(e) => setStudentStatusFilter(e.target.value)}
                  className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] cursor-pointer font-medium"
                >
                  <option value="Todos">Todos os Status</option>
                  <option value="Em Andamento">Em Andamento</option>
                  <option value="Concluído">Concluído</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => setIsAddStudentModalOpen(true)}
              className="px-3.5 py-1.5 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Novo Aluno</span>
            </button>
          </div>

          {/* Students Table */}
          <div className="bg-white border border-slate-200 rounded-md overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-3">Aluno & Empresa</th>
                    <th className="px-3.5 py-3">Treinamento Matriculado</th>
                    <th className="px-3.5 py-3">Progresso</th>
                    <th className="px-3.5 py-3">Média DRE</th>
                    <th className="px-3.5 py-3">Status</th>
                    <th className="px-3.5 py-3">Certificado</th>
                    <th className="px-3.5 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="px-3.5 py-3 font-medium text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-md bg-blue-100 text-[#1890ff] flex items-center justify-center font-black text-xs uppercase shrink-0 border border-blue-200">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block text-xs">{student.name}</span>
                            <span className="text-[10px] text-slate-500 block font-medium">{student.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-3.5 py-3">
                        <span className="inline-block px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#1890ff] font-bold text-[10px] max-w-xs truncate">
                          {student.enrolledCourseTitle}
                        </span>
                      </td>

                      <td className="px-3.5 py-3 min-w-[140px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-mono text-slate-600">{student.completedLessonsText}</span>
                            <span className="font-black text-[#1890ff]">{student.progressPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-md overflow-hidden border border-slate-200">
                            <div
                              className="h-full bg-[#1890ff] rounded-md transition-all duration-300"
                              style={{ width: `${student.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-3.5 py-3 font-mono font-black text-emerald-700 text-xs">
                        {student.dreGrade}
                      </td>

                      <td className="px-3.5 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                            student.status === 'Concluído'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : student.status === 'Em Andamento'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-md ${
                              student.status === 'Concluído'
                                ? 'bg-emerald-600'
                                : student.status === 'Em Andamento'
                                ? 'bg-[#1890ff] animate-pulse'
                                : 'bg-rose-600'
                            }`}
                          />
                          {student.status}
                        </span>
                      </td>

                      <td className="px-3.5 py-3">
                        {student.certificateIssued ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Emitido
                          </span>
                        ) : (
                          <button
                            onClick={() => handleIssueDirectCertificate(student)}
                            className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-[#1890ff] border border-blue-200 rounded text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Emitir
                          </button>
                        )}
                      </td>

                      <td className="px-3.5 py-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedStudentForDetails(student)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Detalhes
                        </button>

                        <button
                          onClick={() => handleOpenEditStudentModal(student)}
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#1890ff] border border-blue-200 rounded text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => handleToggleStudentStatus(student.id)}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            student.status === 'Inativo'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {student.status === 'Inativo' ? 'Reativar' : 'Suspender'}
                        </button>

                        <button
                          onClick={() => handleDeleteStudentClick(student)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBMENU 2: GESTÃO DE TREINAMENTOS */}
      {currentTab === 'trainings' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs">
            <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={trainingSearch}
                  onChange={(e) => setTrainingSearch(e.target.value)}
                  placeholder="Buscar treinamento por título ou conteúdo..."
                  className="w-full bg-slate-50 border border-slate-200 rounded pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1890ff] font-medium"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <select
                  value={trainingCategoryFilter}
                  onChange={(e) => setTrainingCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] cursor-pointer font-medium w-full sm:w-auto"
                >
                  <option value="Todas">Todas as Categorias</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  onClick={() => setIsCategoryModalOpen(true)}
                  title="Cadastrar Nova Categoria"
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded border border-slate-200 transition-colors cursor-pointer shrink-0"
                >
                  <FolderPlus className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            <button
              onClick={handleOpenNewTrainingModal}
              className="px-4 py-2 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo Treinamento</span>
            </button>
          </div>

          {/* Trainings Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white border border-slate-200 rounded-md p-5 hover:border-[#1890ff] transition-all flex flex-col justify-between space-y-4 shadow-2xs group relative"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#1890ff] text-[10px] font-black uppercase font-mono">
                      {course.category || 'Treinamento Corporativo'}
                    </span>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Ativo
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 text-sm group-hover:text-[#1890ff] transition-colors line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-600 font-medium line-clamp-2">{course.description}</p>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono text-slate-700">
                    <div className="bg-slate-50 p-2 rounded border border-slate-200 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#1890ff]" />
                      <span className="font-bold">{course.modules?.length || 4} Módulos</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-200 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#1890ff]" />
                      <span className="font-bold">18 Alunos</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                  <button
                    onClick={() => {
                      setStudentCourseFilter(course.title);
                      handleSetTab('students');
                    }}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Users className="w-3.5 h-3.5 text-[#1890ff]" />
                    <span>Alunos</span>
                  </button>

                  <button
                    onClick={() => setComposingCourse(course)}
                    className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Cadastrar UCs</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedCourseForSlides(course);
                      setIsSlideEditorOpen(true);
                    }}
                    className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1890ff] border border-blue-200 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Presentation className="w-3.5 h-3.5" />
                    <span>Editar Aulas</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditTrainingModal(course)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBMENU 3: CENTRAL DE CERTIFICADOS */}
      {currentTab === 'certificates' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={certSearch}
                onChange={(e) => setCertSearch(e.target.value)}
                placeholder="Buscar por credencial, aluno ou treinamento..."
                className="w-full bg-slate-50 border border-slate-200 rounded pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1890ff] font-medium"
              />
            </div>

            <button
              onClick={() => setIsRegisterCertModalOpen(true)}
              className="px-4 py-2 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
            >
              <Award className="w-4 h-4" />
              <span>Emitir Certificado Avulso</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCertificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-white border border-slate-200 rounded-md p-5 space-y-4 hover:border-emerald-500 transition-all flex flex-col justify-between shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#1890ff] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 font-bold">
                      {cert.credentialId}
                    </span>
                    <span className="text-[10px] text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Autêntico
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 text-sm line-clamp-1">{cert.courseTitle}</h4>
                    <p className="text-xs text-slate-600 font-bold mt-1">
                      Aluno: <span className="text-[#1890ff]">{cert.studentName || 'Gabriel Mendes'}</span>
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium">
                    Emitido em: <span className="text-slate-900 font-mono font-bold">{cert.issueDate}</span> • Carga:{' '}
                    <span className="text-slate-900 font-mono font-bold">{cert.hours}h</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => onOpenCertificateModal(cert)}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#1890ff]" />
                    <span>Visualizar / Imprimir PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* SUBMENU 5: LOGS */}
      {currentTab === 'logs' && (
        <div className="bg-white border border-slate-200 rounded-md p-6 space-y-4 shadow-2xs">
          <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1890ff]" />
            <span>Histórico de Auditoria do Menu Gestor</span>
          </h3>

          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-md bg-[#1890ff] shrink-0" />
                  <div>
                    <span className="text-slate-900 font-extrabold block">{log.action}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Por {log.actor}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#1890ff] font-bold shrink-0">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Cadastrar / Matricular Aluno */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md p-6 max-w-md w-full space-y-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1890ff]" />
                <span>Matricular Novo Aluno</span>
              </h3>
              <button
                onClick={() => setIsAddStudentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Nome Completo do Aluno</label>
                <input
                  type="text"
                  value={newStdName}
                  onChange={(e) => setNewStdName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1890ff] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">E-mail do Aluno</label>
                <input
                  type="email"
                  value={newStdEmail}
                  onChange={(e) => setNewStdEmail(e.target.value)}
                  placeholder="Ex: carlos@restaurante.com.br"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1890ff] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Empresa / Restaurante</label>
                <input
                  type="text"
                  value={newStdCompany}
                  onChange={(e) => setNewStdCompany(e.target.value)}
                  placeholder="Ex: Restaurante Villa Gourmet"
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1890ff] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Treinamento Inicial</label>
                <select
                  value={newStdCourse}
                  onChange={(e) => setNewStdCourse(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] cursor-pointer font-medium"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer"
                >
                  Confirmar Matrícula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1.5: Editar Aluno */}
      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md p-6 max-w-md w-full space-y-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#1890ff]" />
                <span>Editar Dados do Aluno</span>
              </h3>
              <button
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-700 text-sm cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Nome Completo</label>
                <input
                  type="text"
                  value={editStdName}
                  onChange={(e) => setEditStdName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">E-mail</label>
                <input
                  type="email"
                  value={editStdEmail}
                  onChange={(e) => setEditStdEmail(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">Empresa</label>
                  <input
                    type="text"
                    value={editStdCompany}
                    onChange={(e) => setEditStdCompany(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">Cargo / Função</label>
                  <input
                    type="text"
                    value={editStdRole}
                    onChange={(e) => setEditStdRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">Progresso (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editStdProgress}
                    onChange={(e) => setEditStdProgress(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">Média DRE</label>
                  <input
                    type="text"
                    value={editStdGrade}
                    onChange={(e) => setEditStdGrade(e.target.value)}
                    placeholder="Ex: 9.5 / 10"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">Status</label>
                  <select
                    value={editStdStatus}
                    onChange={(e: any) => setEditStdStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] cursor-pointer font-medium"
                  >
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">Treinamento</label>
                  <select
                    value={editStdCourse}
                    onChange={(e) => setEditStdCourse(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] cursor-pointer font-medium"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.title}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 1.6: Confirmar Exclusão de Aluno */}
      {studentToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md p-6 max-w-sm w-full space-y-4 shadow-lg">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-black text-slate-900 text-base">Excluir Aluno</h3>
            </div>
            
            <p className="text-xs text-slate-600 font-medium">
              Tem certeza que deseja excluir o aluno <strong className="text-slate-900">{studentToDelete.name}</strong>? 
              Esta ação removerá permanentemente a matrícula dele do curso <strong className="text-slate-900">{studentToDelete.enrolledCourseTitle}</strong> e não poderá ser desfeita.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteStudentConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer"
              >
                Excluir Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Criar / Editar Treinamento */}
      {isTrainingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md p-6 max-w-lg w-full space-y-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#1890ff]" />
                <span>{editingCourse ? 'Editar Treinamento' : 'Criar Novo Treinamento'}</span>
              </h3>
              <button
                onClick={() => setIsTrainingModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTrainingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Título do Treinamento</label>
                <input
                  type="text"
                  value={trainingTitle}
                  onChange={(e) => setTrainingTitle(e.target.value)}
                  placeholder="Ex: Formação em Engenharia de Cardápio"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1890ff] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">Categoria</label>
                  <select
                    value={trainingCategory}
                    onChange={(e) => setTrainingCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] cursor-pointer font-medium"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">Nível</label>
                  <select
                    value={trainingLevel}
                    onChange={(e: any) => setTrainingLevel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] cursor-pointer font-medium"
                  >
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Descrição / Ementa</label>
                <textarea
                  value={trainingDescription}
                  onChange={(e) => setTrainingDescription(e.target.value)}
                  placeholder="Descreva o objetivo do treinamento e os principais resultados esperados..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1890ff] font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTrainingModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer"
                >
                  {editingCourse ? 'Salvar Alterações' : 'Criar Treinamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Detalhes do Aluno */}
      {selectedStudentForDetails && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md p-6 max-w-md w-full space-y-5 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1890ff]" />
                <span>Desempenho do Aluno</span>
              </h3>
              <button
                onClick={() => setSelectedStudentForDetails(null)}
                className="text-slate-400 hover:text-slate-700 text-sm cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-0.5">
                <span className="text-slate-900 font-extrabold text-sm block">{selectedStudentForDetails.name}</span>
                <span className="text-slate-500 block font-medium">{selectedStudentForDetails.email}</span>
                <span className="text-[#1890ff] font-bold block">{selectedStudentForDetails.company}</span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded border border-slate-200 space-y-2">
                <span className="text-slate-500 font-black block uppercase text-[10px]">Treinamento Atual</span>
                <span className="text-slate-900 font-bold block">{selectedStudentForDetails.enrolledCourseTitle}</span>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-600 font-medium">Progresso:</span>
                  <span className="text-[#1890ff] font-mono font-black">{selectedStudentForDetails.progressPercent}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Nota Média DRE:</span>
                  <span className="text-emerald-700 font-mono font-black">{selectedStudentForDetails.dreGrade}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              {!selectedStudentForDetails.certificateIssued && (
                <button
                  onClick={() => {
                    handleIssueDirectCertificate(selectedStudentForDetails);
                    setSelectedStudentForDetails(null);
                  }}
                  className="px-4 py-2 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded text-xs font-bold cursor-pointer shadow-xs"
                >
                  Emitir Certificado
                </button>
              )}
              <button
                onClick={() => setSelectedStudentForDetails(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Emissão de Certificado */}
      <RegisterCertificateModal
        isOpen={isRegisterCertModalOpen}
        onClose={() => setIsRegisterCertModalOpen(false)}
        onRegisterCertificate={(cert) => {
          onRegisterCertificate(cert);
          showToast(`Certificado registrado com sucesso!`);
        }}
      />

      {/* Modal Editor & Player Naitvo de Slides Interativos */}
      {selectedCourseForSlides && (
        <CourseSlideEditorModal
          course={selectedCourseForSlides}
          isOpen={isSlideEditorOpen}
          onClose={() => {
            setIsSlideEditorOpen(false);
            setSelectedCourseForSlides(null);
          }}
          onSaveCourseSlides={() => {
            showToast(`Slides do treinamento atualizados com sucesso!`);
          }}
          unidades={unidades}
          initialUcId={selectedUcIdForSlides}
        />
      )}
      {/* Modal Cadastro de Nova Categoria */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md p-5 max-w-sm w-full text-slate-950 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                {editingCategory ? 'Editar Categoria' : 'Cadastrar Nova Categoria'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {editingCategory ? 'Altere o nome da categoria selecionada abaixo.' : 'Insira o nome da nova categoria para organizar seus treinamentos.'}
              </p>
            </div>
            
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Ex: Marketing Digital, Logística, etc."
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1890ff] font-medium"
            />

            <div className="flex justify-end gap-2 text-xs font-bold">
              <button
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setNewCategoryName('');
                  setEditingCategory(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const trimmed = newCategoryName.trim();
                  if (!trimmed) {
                    showToast('O nome da categoria não pode ser vazio.');
                    return;
                  }

                  if (editingCategory) {
                    if (editingCategory === trimmed) {
                      setEditingCategory(null);
                      setNewCategoryName('');
                      return;
                    }

                    if (categories.includes(trimmed)) {
                      showToast(`A categoria "${trimmed}" já existe!`);
                      return;
                    }

                    // 1. Update categories list
                    setCategories(prev => prev.map(c => c === editingCategory ? trimmed : c));

                    // 2. Update courses utilizing this category
                    if (courses && onUpdateCourses) {
                      const updatedCourses = courses.map(c => 
                        c.category === editingCategory ? { ...c, category: trimmed } : c
                      );
                      onUpdateCourses(updatedCourses);
                    }

                    showToast(`Categoria alterada de "${editingCategory}" para "${trimmed}" com sucesso!`);
                    setEditingCategory(null);
                    setNewCategoryName('');
                  } else {
                    if (categories.includes(trimmed)) {
                      showToast(`A categoria "${trimmed}" já existe!`);
                      return;
                    }

                    setCategories(prev => [...prev, trimmed]);
                    showToast(`Categoria "${trimmed}" cadastrada com sucesso!`);
                    setNewCategoryName('');
                  }
                }}
                className="px-4 py-2 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded-md cursor-pointer"
              >
                {editingCategory ? 'Salvar Alteração' : 'Salvar'}
              </button>
            </div>

            {/* List of existing categories */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Categorias Cadastradas</span>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {categories.map((cat) => (
                  <div key={cat} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800">
                    <span>{cat}</span>
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setNewCategoryName(cat);
                      }}
                      title="Editar Categoria"
                      className="p-1 hover:bg-slate-200 text-[#1890ff] hover:text-[#116ebc] rounded transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
