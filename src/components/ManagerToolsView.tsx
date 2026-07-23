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
} from 'lucide-react';
import { RegisterCertificateModal } from './RegisterCertificateModal';

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

  return (
    <div id="manager-tools-view" className="pt-16 md:pt-18 px-3 md:px-6 pb-8 max-w-[1440px] mx-auto space-y-5">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-[#2fd9f4] text-slate-950 font-bold px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 animate-bounce border border-white/20">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span className="text-xs">{toastMessage}</span>
        </div>
      )}

      {/* Main Header / Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-gradient-to-r from-slate-900 via-[#0b1326] to-slate-900 p-4 md:p-5 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#2fd9f4]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#2fd9f4]/15 border border-[#2fd9f4]/30 text-[#2fd9f4] text-[10px] font-mono font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Alchymist Manager • Menu Gestor</span>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-[#dae2fd] tracking-tight">
            Central de Gestão de Alunos & Treinamentos
          </h1>
          <p className="text-xs text-[#c7c4d7] max-w-2xl">
            Acompanhe a evolução individual dos alunos, matricule turmas corporativas, gerencie a grade
            de treinamentos e emita certificados verificados.
          </p>
        </div>

        {/* Action Header Buttons */}
        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <button
            onClick={() => setIsAddStudentModalOpen(true)}
            className="px-3 py-2 bg-[#2fd9f4] hover:bg-[#28c4dd] text-slate-950 rounded-lg font-extrabold text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(47,217,244,0.25)] active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Matricular Aluno</span>
          </button>

          <button
            onClick={handleOpenNewTrainingModal}
            className="px-3 py-2 bg-[#8083ff] hover:bg-[#6c70ff] text-[#0d0096] rounded-lg font-extrabold text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Novo Treinamento</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => handleSetTab('students')}
          className={`bg-slate-900/80 border rounded-xl p-3.5 flex items-center gap-3 transition-all cursor-pointer ${
            currentTab === 'students'
              ? 'border-[#2fd9f4] shadow-[0_0_15px_rgba(47,217,244,0.15)] bg-slate-900'
              : 'border-white/10 hover:border-[#2fd9f4]/40'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-[#2fd9f4]/10 border border-[#2fd9f4]/30 flex items-center justify-center text-[#2fd9f4] shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Gestão de Alunos
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-white">{students.length}</span>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> 100% Ativos
              </span>
            </div>
          </div>
        </div>

        <div
          onClick={() => handleSetTab('trainings')}
          className={`bg-slate-900/80 border rounded-xl p-3.5 flex items-center gap-3 transition-all cursor-pointer ${
            currentTab === 'trainings'
              ? 'border-[#8083ff] shadow-[0_0_15px_rgba(128,131,255,0.15)] bg-slate-900'
              : 'border-white/10 hover:border-[#8083ff]/40'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-[#8083ff]/10 border border-[#8083ff]/30 flex items-center justify-center text-[#8083ff] shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Treinamentos Ativos
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-white">{courses.length}</span>
              <span className="text-[10px] text-[#2fd9f4] font-bold">4.9 ★ Avaliação</span>
            </div>
          </div>
        </div>

        <div
          onClick={() => handleSetTab('certificates')}
          className={`bg-slate-900/80 border rounded-xl p-3.5 flex items-center gap-3 transition-all cursor-pointer ${
            currentTab === 'certificates'
              ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] bg-slate-900'
              : 'border-white/10 hover:border-emerald-500/40'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Certificados Emitidos
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-white">{certificates.length}</span>
              <span className="text-[10px] text-emerald-400 font-bold">Verificados</span>
            </div>
          </div>
        </div>

        <div
          onClick={() => handleSetTab('settings')}
          className={`bg-slate-900/80 border rounded-xl p-3.5 flex items-center gap-3 transition-all cursor-pointer ${
            currentTab === 'settings'
              ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.15)] bg-slate-900'
              : 'border-white/10 hover:border-amber-500/40'
          }`}
        >
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Configurações Globais
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                Ativas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 border-b border-white/10 overflow-x-auto pb-1.5 scrollbar-none">
        <button
          onClick={() => handleSetTab('students')}
          className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            currentTab === 'students'
              ? 'bg-[#2fd9f4]/15 text-[#2fd9f4] border border-[#2fd9f4]/40 font-black'
              : 'text-[#c7c4d7] hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>🎓 Alunos ({students.length})</span>
        </button>

        <button
          onClick={() => handleSetTab('trainings')}
          className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            currentTab === 'trainings'
              ? 'bg-[#2fd9f4]/15 text-[#2fd9f4] border border-[#2fd9f4]/40 font-black'
              : 'text-[#c7c4d7] hover:text-white hover:bg-white/5'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-[#8083ff]" />
          <span>📚 Gestão de Treinamentos ({courses.length})</span>
        </button>

        <button
          onClick={() => handleSetTab('certificates')}
          className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            currentTab === 'certificates'
              ? 'bg-[#2fd9f4]/15 text-[#2fd9f4] border border-[#2fd9f4]/40 font-black'
              : 'text-[#c7c4d7] hover:text-white hover:bg-white/5'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span>🏆 Certificados ({certificates.length})</span>
        </button>

        <button
          onClick={() => handleSetTab('settings')}
          className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            currentTab === 'settings'
              ? 'bg-[#2fd9f4]/15 text-[#2fd9f4] border border-[#2fd9f4]/40 font-black'
              : 'text-[#c7c4d7] hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders className="w-3.5 h-3.5 text-amber-400" />
          <span>⚙️ Configurações Globais</span>
        </button>

        <button
          onClick={() => handleSetTab('logs')}
          className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            currentTab === 'logs'
              ? 'bg-[#2fd9f4]/15 text-[#2fd9f4] border border-[#2fd9f4]/40 font-black'
              : 'text-[#c7c4d7] hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>📜 Logs ({logs.length})</span>
        </button>
      </div>

      {/* SUBMENU 1: GESTÃO DE ALUNOS */}
      {currentTab === 'students' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-white/10">
            <div className="flex flex-col sm:flex-row items-center gap-2 flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Buscar aluno, e-mail ou empresa..."
                  className="w-full bg-slate-950 border border-white/15 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#2fd9f4]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-3.5 h-3.5 text-[#2fd9f4] shrink-0" />
                <select
                  value={studentCourseFilter}
                  onChange={(e) => setStudentCourseFilter(e.target.value)}
                  className="w-full sm:w-auto bg-slate-950 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:ring-2 focus:ring-[#2fd9f4] cursor-pointer"
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
                  className="w-full sm:w-auto bg-slate-950 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:ring-2 focus:ring-[#2fd9f4] cursor-pointer"
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
              className="px-3 py-1.5 bg-[#2fd9f4] hover:bg-[#28c4dd] text-slate-950 rounded-lg font-extrabold text-[11px] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Cadastrar Novo Aluno</span>
            </button>
          </div>

          {/* Students Table */}
          <div className="bg-slate-900/80 border border-white/10 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#c7c4d7]">
                <thead className="bg-slate-950/80 text-[#2fd9f4] uppercase font-mono text-[10px] tracking-wider border-b border-white/10">
                  <tr>
                    <th className="px-3 py-2.5">Aluno & Empresa</th>
                    <th className="px-3 py-2.5">Treinamento Matriculado</th>
                    <th className="px-3 py-2.5">Progresso</th>
                    <th className="px-3 py-2.5">Média DRE</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">Certificado</th>
                    <th className="px-3 py-2.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-3 py-2.5 font-medium text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2fd9f4] to-[#8083ff] flex items-center justify-center text-slate-950 font-black text-xs uppercase shadow-xs shrink-0">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-white block text-xs">{student.name}</span>
                            <span className="text-[10px] text-slate-400 block">{student.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-2.5">
                        <span className="inline-block px-2 py-0.5 rounded bg-[#8083ff]/15 border border-[#8083ff]/30 text-[#8083ff] font-bold text-[10px] max-w-xs truncate">
                          {student.enrolledCourseTitle}
                        </span>
                      </td>

                      <td className="px-3 py-2.5 min-w-[140px]">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-mono text-slate-300">{student.completedLessonsText}</span>
                            <span className="font-extrabold text-[#2fd9f4]">{student.progressPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-white/10">
                            <div
                              className="h-full bg-gradient-to-r from-[#2fd9f4] to-[#8083ff] rounded-full transition-all duration-500"
                              style={{ width: `${student.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-2.5 font-mono font-bold text-emerald-400 text-xs">
                        {student.dreGrade}
                      </td>

                      <td className="px-3 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            student.status === 'Concluído'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : student.status === 'Em Andamento'
                              ? 'bg-[#2fd9f4]/15 text-[#2fd9f4] border border-[#2fd9f4]/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              student.status === 'Concluído'
                                ? 'bg-emerald-400'
                                : student.status === 'Em Andamento'
                                ? 'bg-[#2fd9f4] animate-pulse'
                                : 'bg-rose-400'
                            }`}
                          />
                          {student.status}
                        </span>
                      </td>

                      <td className="px-3 py-2.5">
                        {student.certificateIssued ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> Emitido
                          </span>
                        ) : (
                          <button
                            onClick={() => handleIssueDirectCertificate(student)}
                            className="px-2 py-0.5 bg-[#2fd9f4]/10 hover:bg-[#2fd9f4]/20 text-[#2fd9f4] border border-[#2fd9f4]/30 rounded text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Emitir
                          </button>
                        )}
                      </td>

                      <td className="px-3 py-2.5 text-right space-x-1.5">
                        <button
                          onClick={() => setSelectedStudentForDetails(student)}
                          className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[#2fd9f4] rounded text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Detalhes
                        </button>

                        <button
                          onClick={() => handleToggleStudentStatus(student.id)}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            student.status === 'Inativo'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {student.status === 'Inativo' ? 'Reativar' : 'Suspender'}
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
            <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={trainingSearch}
                  onChange={(e) => setTrainingSearch(e.target.value)}
                  placeholder="Buscar treinamento por título ou conteúdo..."
                  className="w-full bg-slate-950 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#8083ff]"
                />
              </div>

              <select
                value={trainingCategoryFilter}
                onChange={(e) => setTrainingCategoryFilter(e.target.value)}
                className="w-full sm:w-auto bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none focus:ring-2 focus:ring-[#8083ff] cursor-pointer"
              >
                <option value="Todas">Todas as Categorias</option>
                <option value="Finanças & DRE">Finanças & DRE</option>
                <option value="Engenharia de Cardápio">Engenharia de Cardápio</option>
                <option value="Gestão de Custos & CMV">Gestão de Custos & CMV</option>
                <option value="Gestão de Equipes">Gestão de Equipes</option>
              </select>
            </div>

            <button
              onClick={handleOpenNewTrainingModal}
              className="px-4 py-2.5 bg-[#8083ff] hover:bg-[#6c70ff] text-[#0d0096] rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-md shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo Treinamento</span>
            </button>
          </div>

          {/* Trainings Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 hover:border-[#8083ff]/50 transition-all flex flex-col justify-between space-y-5 shadow-lg group relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-[#8083ff]/15 border border-[#8083ff]/30 text-[#8083ff] text-[10px] font-extrabold uppercase font-mono">
                      {course.category || 'Treinamento Corporativo'}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Ativo
                    </span>
                  </div>

                  <h3 className="font-extrabold text-white text-base group-hover:text-[#2fd9f4] transition-colors line-clamp-2">
                    {course.title}
                  </h3>

                  <p className="text-xs text-[#c7c4d7] line-clamp-2">{course.description}</p>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-slate-300">
                    <div className="bg-slate-950/60 p-2 rounded-lg border border-white/5 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#2fd9f4]" />
                      <span>{course.modules?.length || 4} Módulos</span>
                    </div>
                    <div className="bg-slate-950/60 p-2 rounded-lg border border-white/5 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-[#8083ff]" />
                      <span>18 Alunos</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setStudentCourseFilter(course.title);
                      handleSetTab('students');
                    }}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[#2fd9f4] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Ver Alunos</span>
                  </button>

                  <button
                    onClick={() => handleOpenEditTrainingModal(course)}
                    className="px-3 py-1.5 bg-[#8083ff]/15 hover:bg-[#8083ff]/30 text-[#8083ff] border border-[#8083ff]/30 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar Conteúdo</span>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={certSearch}
                onChange={(e) => setCertSearch(e.target.value)}
                placeholder="Buscar por credencial, aluno ou treinamento..."
                className="w-full bg-slate-950 border border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#2fd9f4]"
              />
            </div>

            <button
              onClick={() => setIsRegisterCertModalOpen(true)}
              className="px-5 py-2.5 bg-[#2fd9f4] hover:bg-[#28c4dd] text-slate-950 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg shrink-0"
            >
              <Award className="w-4 h-4" />
              <span>Emitir Certificado Avulso</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCertificates.map((cert) => (
              <div
                key={cert.id}
                className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 space-y-4 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#2fd9f4] bg-[#2fd9f4]/10 px-2.5 py-1 rounded-lg border border-[#2fd9f4]/30 font-bold">
                      {cert.credentialId}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Autêntico
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-white text-sm line-clamp-1">{cert.courseTitle}</h4>
                    <p className="text-xs text-slate-300 font-bold mt-1">
                      Aluno: <span className="text-[#2fd9f4]">{cert.studentName || 'Gabriel Mendes'}</span>
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Emitido em: <span className="text-white font-mono">{cert.issueDate}</span> • Carga:{' '}
                    <span className="text-white font-mono">{cert.hours}h</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <button
                    onClick={() => onOpenCertificateModal(cert)}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 text-[#2fd9f4] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visualizar / Imprimir PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBMENU 4: CONFIGURAÇÕES GLOBAIS */}
      {currentTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#2fd9f4]/10 text-[#2fd9f4] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Recursos de Inteligência & IA</h3>
                <p className="text-xs text-[#c7c4d7]">
                  Ativação do Tutor de IA e emissão de certificados
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <span className="text-xs font-bold text-white block">Tutor de IA Alchymist</span>
                  <span className="text-[10px] text-slate-400">
                    Permite aos alunos tirarem dúvidas sobre DRE e fichas técnicas em tempo real
                  </span>
                </div>
                <button
                  onClick={() => {
                    setAiTutorEnabled(!aiTutorEnabled);
                    showToast(`Tutor de IA ${!aiTutorEnabled ? 'ativado' : 'desativado'}`);
                  }}
                  className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${
                    aiTutorEnabled ? 'bg-[#2fd9f4]' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-slate-950 absolute top-0.5 transition-all ${
                      aiTutorEnabled ? 'left-6' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <span className="text-xs font-bold text-white block">Emissão Automática de Certificados</span>
                  <span className="text-[10px] text-slate-400">
                    Gerar certificado imediatamente após 100% de conclusão do treinamento
                  </span>
                </div>
                <button
                  onClick={() => {
                    setAutoIssueCertificates(!autoIssueCertificates);
                    showToast(`Emissão automática ${!autoIssueCertificates ? 'ativada' : 'desativada'}`);
                  }}
                  className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${
                    autoIssueCertificates ? 'bg-[#2fd9f4]' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-slate-950 absolute top-0.5 transition-all ${
                      autoIssueCertificates ? 'left-6' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#8083ff]/10 text-[#8083ff] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Segurança & Licenciamento</h3>
                <p className="text-xs text-[#c7c4d7]">Autenticação Google OAuth e validade do sistema</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <span className="text-xs font-bold text-white block">Autenticação Obrigatória Google OAuth</span>
                  <span className="text-[10px] text-slate-400">Exigir login Google autenticado para assistir aulas</span>
                </div>
                <button
                  onClick={() => {
                    setOauthRequired(!oauthRequired);
                    showToast(`OAuth obrigatório ${!oauthRequired ? 'ativado' : 'desativado'}`);
                  }}
                  className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${
                    oauthRequired ? 'bg-[#8083ff]' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full bg-slate-950 absolute top-0.5 transition-all ${
                      oauthRequired ? 'left-6' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Licença Sagacitas E-Learning</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Alchymist Enterprise • Ativo</span>
                </div>
                <span className="text-[10px] px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  2027
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMENU 5: LOGS */}
      {currentTab === 'logs' && (
        <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-6 space-y-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#2fd9f4]" />
            <span>Histórico de Auditoria do Menu Gestor</span>
          </h3>

          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-950 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#2fd9f4] shrink-0" />
                  <div>
                    <span className="text-white font-semibold block">{log.action}</span>
                    <span className="text-[10px] text-slate-400">Por {log.actor}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#2fd9f4] shrink-0">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Cadastrar / Matricular Aluno */}
      {isAddStudentModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-[#2fd9f4]" />
                <span>Matricular Novo Aluno</span>
              </h3>
              <button
                onClick={() => setIsAddStudentModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStudentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Nome Completo do Aluno</label>
                <input
                  type="text"
                  value={newStdName}
                  onChange={(e) => setNewStdName(e.target.value)}
                  placeholder="Ex: Carlos Eduardo"
                  required
                  className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#2fd9f4]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">E-mail do Aluno</label>
                <input
                  type="email"
                  value={newStdEmail}
                  onChange={(e) => setNewStdEmail(e.target.value)}
                  placeholder="Ex: carlos@restaurante.com.br"
                  required
                  className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#2fd9f4]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Empresa / Restaurante</label>
                <input
                  type="text"
                  value={newStdCompany}
                  onChange={(e) => setNewStdCompany(e.target.value)}
                  placeholder="Ex: Restaurante Villa Gourmet"
                  className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#2fd9f4]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Treinamento Inicial</label>
                <select
                  value={newStdCourse}
                  onChange={(e) => setNewStdCourse(e.target.value)}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-xs text-white outline-none focus:ring-2 focus:ring-[#2fd9f4] cursor-pointer"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddStudentModalOpen(false)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#2fd9f4] hover:bg-[#28c4dd] text-slate-950 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md cursor-pointer"
                >
                  Confirmar Matrícula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Criar / Editar Treinamento */}
      {isTrainingModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#8083ff]" />
                <span>{editingCourse ? 'Editar Treinamento' : 'Criar Novo Treinamento'}</span>
              </h3>
              <button
                onClick={() => setIsTrainingModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTrainingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Título do Treinamento</label>
                <input
                  type="text"
                  value={trainingTitle}
                  onChange={(e) => setTrainingTitle(e.target.value)}
                  placeholder="Ex: Formação em Engenharia de Cardápio"
                  required
                  className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#8083ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Categoria</label>
                  <select
                    value={trainingCategory}
                    onChange={(e) => setTrainingCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-xs text-white outline-none focus:ring-2 focus:ring-[#8083ff] cursor-pointer"
                  >
                    <option value="Finanças & DRE">Finanças & DRE</option>
                    <option value="Engenharia de Cardápio">Engenharia de Cardápio</option>
                    <option value="Gestão de Custos & CMV">Gestão de Custos & CMV</option>
                    <option value="Gestão de Equipes">Gestão de Equipes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nível</label>
                  <select
                    value={trainingLevel}
                    onChange={(e: any) => setTrainingLevel(e.target.value)}
                    className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-xs text-white outline-none focus:ring-2 focus:ring-[#8083ff] cursor-pointer"
                  >
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Descrição / Ementa</label>
                <textarea
                  value={trainingDescription}
                  onChange={(e) => setTrainingDescription(e.target.value)}
                  placeholder="Descreva o objetivo do treinamento e os principais resultados esperados..."
                  rows={3}
                  className="w-full bg-slate-950 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-[#8083ff]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTrainingModalOpen(false)}
                  className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#8083ff] hover:bg-[#6c70ff] text-[#0d0096] rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md cursor-pointer"
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/20 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-[#2fd9f4]" />
                <span>Desempenho do Aluno</span>
              </h3>
              <button
                onClick={() => setSelectedStudentForDetails(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-1">
                <span className="text-white font-bold text-sm block">{selectedStudentForDetails.name}</span>
                <span className="text-slate-400 block">{selectedStudentForDetails.email}</span>
                <span className="text-[#2fd9f4] font-medium block">{selectedStudentForDetails.company}</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-white/5 space-y-2">
                <span className="text-slate-400 font-bold block uppercase text-[10px]">Treinamento Atual</span>
                <span className="text-white font-bold block">{selectedStudentForDetails.enrolledCourseTitle}</span>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-300">Progresso:</span>
                  <span className="text-[#2fd9f4] font-mono font-bold">{selectedStudentForDetails.progressPercent}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Nota Média DRE:</span>
                  <span className="text-emerald-400 font-mono font-bold">{selectedStudentForDetails.dreGrade}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              {!selectedStudentForDetails.certificateIssued && (
                <button
                  onClick={() => {
                    handleIssueDirectCertificate(selectedStudentForDetails);
                    setSelectedStudentForDetails(null);
                  }}
                  className="px-4 py-2 bg-[#2fd9f4] hover:bg-[#28c4dd] text-slate-950 rounded-xl text-xs font-extrabold cursor-pointer"
                >
                  Emitir Certificado
                </button>
              )}
              <button
                onClick={() => setSelectedStudentForDetails(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
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
    </div>
  );
};
