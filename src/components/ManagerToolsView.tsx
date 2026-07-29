import React, { useState, useEffect } from 'react';
import { Course, Certificate, OAuthUser, Module, DBCourseCategory } from '../types';
import { dbService } from '../services/dbService';
import { uploadService } from '../services/uploadService';
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
  Building2,
  Tags,
  Image,
  UploadCloud,
  X
} from 'lucide-react';
import { RegisterCertificateModal } from './RegisterCertificateModal';
import { CourseSlideEditorModal } from './presentation/CourseSlideEditorModal';
import { CourseUCComposerView } from './expert/CourseUCComposerView';
import { UnidadeConhecimento } from '../types/edtechExpert';
import { CompaniesManagerView } from './CompaniesManagerView';

export type ManagerTabType = 'students' | 'trainings' | 'certificates' | 'companies' | 'settings' | 'logs';

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
  const [trainingCategory, setTrainingCategory] = useState('');
  const [trainingLevel, setTrainingLevel] = useState<'Iniciante' | 'Intermediário' | 'Avançado'>('Intermediário');
  const [trainingWorkload, setTrainingWorkload] = useState('20h');
  const [trainingDescription, setTrainingDescription] = useState('');
  const [trainingImageUrl, setTrainingImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const [trainingType, setTrainingType] = useState<'avulso' | 'sistema' | 'formador' | 'empresarial'>('avulso');
  const [trainingStatus, setTrainingStatus] = useState<'active' | 'blocked' | 'cancelled'>('active');
  const [trainingCompanyId, setTrainingCompanyId] = useState('');
  const [trainingSystemName, setTrainingSystemName] = useState('');
  const [companiesList, setCompaniesList] = useState<any[]>([]);

  // Register Cert Modal
  const [isRegisterCertModalOpen, setIsRegisterCertModalOpen] = useState(false);
  const [certSearch, setCertSearch] = useState('');

  // Course Slide Editor State
  const [selectedCourseForSlides, setSelectedCourseForSlides] = useState<Course | null>(null);
  const [selectedUcIdForSlides, setSelectedUcIdForSlides] = useState<string>('');
  const [isSlideEditorOpen, setIsSlideEditorOpen] = useState(false);

  // Course UC Composer state
  const [composingCourse, setComposingCourse] = useState<Course | null>(null);

  // JSON Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState('');

  // Categories management state
  const [dbCategories, setDbCategories] = useState<DBCourseCategory[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const dbCats = await dbService.getCategories();
        setDbCategories(dbCats);
        if (dbCats.length > 0) {
          setCategories(prev => {
            const dbNames = dbCats.map(c => c.name);
            return Array.from(new Set([...prev, ...dbNames]));
          });
        }
      } catch (err) {
        console.error('Erro ao carregar categorias do banco:', err);
      }
    }
    loadCategories();
  }, []);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);

  // Levels management state
  const [levelsList, setLevelsList] = useState<string[]>([
    'Iniciante',
    'Intermediário',
    'Avançado'
  ]);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [newLevelName, setNewLevelName] = useState('');
  const [editingLevel, setEditingLevel] = useState<string | null>(null);



  useEffect(() => {
    if (courses && courses.length > 0) {
      const existingCats = Array.from(new Set(courses.map(c => c.category).filter(Boolean) as string[]));
      setCategories(prev => {
        const merged = Array.from(new Set([...prev, ...existingCats]));
        return merged;
      });

      const existingLevels = Array.from(new Set(courses.map(c => c.level).filter(Boolean) as string[]));
      setLevelsList(prev => {
        const merged = Array.from(new Set([...prev, ...existingLevels]));
        return merged;
      });


    }
  }, [courses]);

  useEffect(() => {
    async function loadCompanies() {
      try {
        const data = await dbService.getCompanies();
        setCompaniesList(data);
      } catch (err) {
        console.error('Erro ao carregar empresas', err);
      }
    }
    loadCompanies();
  }, []);

  const [localUnidades, setLocalUnidades] = useState<UnidadeConhecimento[]>([]);

  useEffect(() => {
    async function loadKnowledgeUnits() {
      try {
        const ucs = await dbService.getKnowledgeUnits();
        const mappedUcs: UnidadeConhecimento[] = ucs.map(dbUc => {
          let codeStr = dbUc.signatures && dbUc.signatures.length > 0 ? dbUc.signatures[0].code : undefined;
          let titleStr = dbUc.title;
          
          if (!codeStr && dbUc.title.includes(':')) {
            const parts = dbUc.title.split(':');
            codeStr = parts[0]?.trim();
            titleStr = parts.slice(1).join(':').trim();
          }

          return {
            id: dbUc.id,
            tenant_id: dbUc.tenant_id,
            codigo: codeStr,
            signatures: dbUc.signatures,
            subgroups: dbUc.subgroups,
            titulo: titleStr,
            descricao_curta: dbUc.description,
            meta_bloom: dbUc.bloom_level === 1 ? 'CONHECIMENTO' : 
                        dbUc.bloom_level === 2 ? 'COMPREENSAO' : 
                        dbUc.bloom_level === 3 ? 'APLICACAO_SIMPLES' : 
                        dbUc.bloom_level === 4 ? 'ANALISE' : 
                        dbUc.bloom_level === 5 ? 'SINTESE' : 'COMPREENSAO',
            duracao_estimada_minutos: dbUc.estimated_duration_minutes,
            status: dbUc.status as any,
            created_at: dbUc.created_at,
            updated_at: dbUc.updated_at,
            topico: dbUc.topic,
            topico_complexidade: dbUc.topic_complexity as any || 'CONHECIMENTO',
            area: dbUc.area || 'SAG',
            context: dbUc.context || 'GLOBAL',
            layout_template: { version: '1.0', components: [] }
          };
        });
        setLocalUnidades(mappedUcs);
      } catch (err) {
        console.error('Erro ao carregar UCs no ManagerToolsView:', err);
      }
    }
    loadKnowledgeUnits();
  }, [composingCourse]);

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
    setTrainingCategory(categories.length > 0 ? categories[0] : '');
    setTrainingLevel('Intermediário');
    setTrainingWorkload('20h');
    setTrainingDescription('');
    setTrainingType('avulso');
    setTrainingCompanyId('');
    setTrainingSystemName('');
    setTrainingImageUrl('');
    setTrainingStatus('active');
    setIsTrainingModalOpen(true);
  };

  const handleOpenEditTrainingModal = (course: Course) => {
    setEditingCourse(course);
    setTrainingTitle(course.title);
    setTrainingCategory(course.category || (categories.length > 0 ? categories[0] : ''));
    setTrainingLevel((course.level as any) || 'Intermediário');
    setTrainingWorkload('24h');
    setTrainingDescription(course.description || '');
    setTrainingType(course.course_type || 'avulso');
    setTrainingCompanyId(course.company_id || '');
    setTrainingSystemName(course.system_name || '');
    setTrainingImageUrl(course.image || '');
    setTrainingStatus((course.status as any) || 'active');
    setIsTrainingModalOpen(true);
  };

  const handleSaveTrainingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainingTitle.trim()) return;

    if ((trainingType === 'empresarial' || trainingType === 'sistema') && !trainingCompanyId) {
      showToast('A seleção de uma empresa é obrigatória para este tipo de curso.');
      return;
    }
    if (trainingType === 'sistema' && !trainingSystemName.trim()) {
      showToast('O nome do sistema é obrigatório para cursos do tipo Sistemas.');
      return;
    }

    try {
      if (editingCourse && onUpdateCourses) {
        const dbUpdated = await dbService.updateCourse(editingCourse.id, {
          title: trainingTitle,
          description: trainingDescription,
          level: trainingLevel,
          category: trainingCategory,

          status: trainingStatus,
          course_type: trainingType,
          company_id: (trainingType === 'empresarial' || trainingType === 'sistema') ? trainingCompanyId : undefined,
          system_name: trainingType === 'sistema' ? trainingSystemName : undefined,
          image_url: trainingImageUrl
        });

        const updatedCourse = {
          ...editingCourse,
          title: dbUpdated.title,
          description: dbUpdated.description || '',
          level: dbUpdated.level as any,
          category: dbUpdated.category || trainingCategory,
          status: dbUpdated.status as any,
          course_type: dbUpdated.course_type,
          company_id: dbUpdated.company_id,
          system_name: dbUpdated.system_name,
          image: dbUpdated.image_url !== undefined && dbUpdated.image_url !== null 
            ? dbUpdated.image_url 
            : editingCourse.image
        };

        const updated = courses.map((c) =>
          c.id === editingCourse.id ? updatedCourse : c
        );
        onUpdateCourses(updated);
        showToast(`Treinamento "${trainingTitle}" atualizado!`);
      } else if (onUpdateCourses) {
        const initialModules = [
          {
            id: `mod-${Date.now()}-1`,
            title: 'Módulo 1: Introdução & Fundamentos',
            focus: 'Fundamentos iniciais e alinhamento didático do treinamento.',
            duration: '45 min',
            lessons: [
              {
                id: `aula-${Date.now()}-1`,
                number: '01',
                title: 'Aula 01: Apresentação da Disciplina',
                duration: '15:00',
                completed: false,
                active: true,
                description: 'Nesta aula de boas-vindas apresentamos a ementa do curso e os objetivos didáticos gerais.',
                learning_objects: []
              },
            ],
          },
        ];

        const mapDBModulesToModules = (dbMods: any[] | undefined): Module[] => {
          if (!dbMods) return [];
          return dbMods.map((m) => ({
            id: m.id || '',
            title: m.title || '',
            focus: m.focus || '',
            lessons: (m.lessons || []).map((l: any, idx: number) => ({
              id: l.id || '',
              number: l.number || String(idx + 1).padStart(2, '0'),
              title: l.title || '',
              duration: l.duration || '45 min',
              completed: l.completed || false,
              description: l.description || l.objectives || '',
            }))
          }));
        };

        const dbCreated = await dbService.createCourse({
          title: trainingTitle,
          description: trainingDescription || 'Treinamento completo para alta performance gastronômica.',
          level: trainingLevel,
          status: 'active',
          category: trainingCategory,

          course_type: trainingType,
          company_id: (trainingType === 'empresarial' || trainingType === 'sistema') ? trainingCompanyId : undefined,
          system_name: trainingType === 'sistema' ? trainingSystemName : undefined,
          image_url: trainingImageUrl || undefined,
          modules: initialModules as any,
          presentation: undefined
        });

        const newCourse: Course = {
          id: dbCreated.id,
          title: dbCreated.title,
          category: dbCreated.category || trainingCategory,
          course_type: dbCreated.course_type,
          status: dbCreated.status as any,
          company_id: dbCreated.company_id,
          system_name: dbCreated.system_name,
          progress: 0,
          completedLessons: 0,
          totalLessons: 1,
          level: dbCreated.level as any,
          image: dbCreated.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
          modules: dbCreated.modules ? mapDBModulesToModules(dbCreated.modules) : initialModules,
          presentation: dbCreated.presentation || undefined,
        };

        onUpdateCourses([newCourse, ...courses]);
        showToast(`Novo treinamento "${trainingTitle}" criado com sucesso!`);
      }
    } catch (err) {
      console.error('Erro ao salvar treinamento:', err);
      showToast('Falha ao salvar o treinamento no banco de dados.');
    }

    setIsTrainingModalOpen(false);
  };

  const handleCourseImageUpload = async (file: File) => {
    try {
      setIsUploadingImage(true);
      const url = await uploadService.uploadFile(file, 'course-covers');
      setTrainingImageUrl(url);
    } catch (err) {
      console.error('Erro ao enviar imagem de capa:', err);
      alert('Erro ao enviar imagem para o servidor: ' + (err as Error).message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCourseImagePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          e.preventDefault();
          // Create a new File to guarantee a valid name
          const file = new File([blob], `pasted-image-${Date.now()}.png`, { type: items[i].type });
          handleCourseImageUpload(file);
          break;
        }
      }
    }
  };

  const handleCourseImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleCourseImageUpload(e.target.files[0]);
    }
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
      (c.description ?? '').toLowerCase().includes(trainingSearch.toLowerCase());
    const matchesCat = trainingCategoryFilter === 'Todas' || c.category === trainingCategoryFilter;
    return matchesSearch && matchesCat;
  });

  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const handleDeleteCourseConfirm = async () => {
    if (!courseToDelete) return;
    try {
      if (courseToDelete.image && courseToDelete.image.includes('supabase.co')) {
        await uploadService.deleteFile(courseToDelete.image);
      }
      await dbService.deleteCourse(courseToDelete.id);
      const newCourses = courses.filter((c) => c.id !== courseToDelete.id);
      if (onUpdateCourses) onUpdateCourses(newCourses);
      setCourseToDelete(null);
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir curso.');
    }
  };

  const handleImportCourseJSON = async () => {
    try {
      setImportError('');
      setIsImporting(true);
      
      let payload;
      try {
        payload = JSON.parse(importJsonText);
      } catch(e) {
        throw new Error('Formato JSON inválido. Verifique se copiou corretamente.');
      }
      
      if (!payload.curso || !payload.curso.titulo) {
        throw new Error('O JSON precisa ter um objeto "curso" com um "titulo".');
      }
      if (!payload.aulas || !Array.isArray(payload.aulas)) {
        throw new Error('O JSON precisa ter um array de "aulas".');
      }

      await dbService.importCourseFromJSON(payload, companiesList[0]?.id);
      
      showToast(`Treinamento "${payload.curso.titulo}" importado com sucesso!`);
      setIsImportModalOpen(false);
      setImportJsonText('');
      
      // Reload courses
      const updatedCourses = await dbService.getCourses();
      const mappedCourses: Course[] = updatedCourses.map(c => ({
        ...c,
        category: c.category || 'Outros',
        image: c.image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
        progress: 0,
        modules: (c.presentation as any)?.modules || []
      })) as Course[];
      if (onUpdateCourses) onUpdateCourses(mappedCourses);
    } catch (err: any) {
      console.error('Import error:', err);
      setImportError(err.message || 'Erro desconhecido ao importar.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleToggleCourseStatus = async (course: Course) => {
    const newStatus = course.status === 'blocked' ? 'active' : 'blocked';
    
    // Optimistic update
    const newCourses = courses.map(c => c.id === course.id ? { ...c, status: newStatus as Course['status'] } : c);
    if (onUpdateCourses) onUpdateCourses(newCourses);

    try {
      await dbService.updateCourse(course.id, { status: newStatus as any });
    } catch (err) {
      console.error(err);
      // Revert on error
      if (onUpdateCourses) onUpdateCourses(courses);
      alert('Erro ao atualizar status do curso.');
    }
  };

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
          unidades={localUnidades.length > 0 ? localUnidades : unidades}
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
            onSaveCourseSlides={async (courseId, presentation) => {
              try {
                await dbService.updateCourse(courseId, { presentation });
                if (onUpdateCourses && courses) {
                  const updated = courses.map(c =>
                    c.id === courseId ? { ...c, presentation } : c
                  );
                  onUpdateCourses(updated);
                }
                showToast(`Slides do treinamento atualizados com sucesso!`);
              } catch (err) {
                console.error("Erro ao salvar slides:", err);
                showToast("Erro ao persistir slides no banco.");
              }
            }}
            unidades={localUnidades.length > 0 ? localUnidades : unidades}
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

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <select
                    value={trainingCategoryFilter}
                    onChange={(e) => {
                      setTrainingCategoryFilter(e.target.value);
                    }}
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
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setImportJsonText('');
                  setImportError('');
                  setIsImportModalOpen(true);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Importar JSON</span>
              </button>
              <button
                onClick={handleOpenNewTrainingModal}
                className="px-4 py-2 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Novo Treinamento</span>
              </button>
            </div>
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
                    <button
                      onClick={() => handleToggleCourseStatus(course)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        course.status !== 'blocked'
                          ? 'text-emerald-800 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                          : 'text-slate-600 bg-slate-100 border-slate-300 hover:bg-slate-200'
                      }`}
                      title="Clique para alternar o status do curso"
                    >
                      {course.status !== 'blocked' ? 'Ativo' : 'Inativo'}
                    </button>
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
                      <BookOpen className="w-3.5 h-3.5 text-[#1890ff]" />
                      <span className="font-bold">
                        {course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || course.totalLessons || 0} Aulas
                      </span>
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
                    <span>Estruturar Módulos & UCs</span>
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

                  <button
                    onClick={() => setCourseToDelete(course)}
                    className="px-2 py-1.5 ml-auto bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded transition-all cursor-pointer flex items-center justify-center"
                    title="Excluir Curso"
                  >
                    <Trash2 className="w-4 h-4" />
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


      {/* SUBMENU 4.5: EMPRESAS */}
      {currentTab === 'companies' && (
        <CompaniesManagerView />
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

      {/* MODAL 1.7: Confirmar Exclusão de Curso */}
      {courseToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md p-6 max-w-sm w-full space-y-4 shadow-lg">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-black text-slate-900 text-base">Excluir Treinamento</h3>
            </div>
            
            <p className="text-xs text-slate-600 font-medium">
              Tem certeza que deseja excluir o treinamento <strong className="text-slate-900">{courseToDelete.title}</strong>? 
              Apenas a estrutura do curso será removida (suas UCs continuarão disponíveis). Esta ação não poderá ser desfeita.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteCourseConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer"
              >
                Excluir Permanentemente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1.8: Importar Curso via JSON */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md p-6 max-w-2xl w-full flex flex-col max-h-[90vh]">
            <div className="flex items-center gap-3 text-indigo-600 mb-4">
              <UploadCloud className="w-6 h-6 shrink-0" />
              <h3 className="font-black text-slate-900 text-base">Importar Formação via JSON</h3>
            </div>
            
            <p className="text-xs text-slate-600 mb-4">
              Cole abaixo o JSON gerado pelo agente. A estrutura deve conter <strong>curso</strong>, <strong>modulo</strong>, e <strong>aulas</strong> (com suas <strong>ucs</strong>).
            </p>

            <textarea
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder='{\n  "curso": { ... },\n  "modulo": { ... },\n  "aulas": [ ... ]\n}'
              className="flex-1 min-h-[300px] w-full bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-800 font-mono outline-none focus:border-[#1890ff] resize-none mb-4"
            />

            {importError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded text-xs font-bold mb-4">
                {importError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setIsImportModalOpen(false); setImportError(''); }}
                disabled={isImporting}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleImportCourseJSON}
                disabled={isImporting || !importJsonText.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold uppercase tracking-wider shadow-xs cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isImporting && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                {isImporting ? 'Importando...' : 'Validar & Importar'}
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
                  <label className="block text-xs font-black text-slate-700 mb-1">Tipo de Treinamento</label>
                  <select
                    value={trainingType}
                    onChange={(e: any) => {
                      setTrainingType(e.target.value);
                      if (e.target.value !== 'sistema' && e.target.value !== 'empresarial') {
                        setTrainingCompanyId('');
                        setTrainingSystemName('');
                      } else if (e.target.value === 'empresarial') {
                        setTrainingSystemName('');
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] cursor-pointer font-medium"
                  >
                    <option value="avulso">Avulso (Público)</option>
                    <option value="formador">Formador (Público)</option>
                    <option value="empresarial">Empresarial (Restrito)</option>
                    <option value="sistema">Sistema (Restrito)</option>
                  </select>
                </div>

                {(trainingType === 'empresarial' || trainingType === 'sistema') && (
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">Empresa Titular</label>
                    <select
                      value={trainingCompanyId}
                      onChange={(e) => setTrainingCompanyId(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] cursor-pointer font-medium"
                    >
                      <option value="">Selecione uma empresa...</option>
                      {companiesList.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                {trainingType === 'sistema' && trainingCompanyId && (
                  <div className="col-span-2">
                    <label className="block text-xs font-black text-slate-700 mb-1">Nome do Sistema</label>
                    <input
                      type="text"
                      value={trainingSystemName}
                      onChange={(e) => setTrainingSystemName(e.target.value)}
                      placeholder="Ex: ERP Alchymist, PDV FrontPad..."
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1890ff] font-medium"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-black text-slate-700">Categoria</label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      title="Gerenciar Categorias"
                      className="p-1 hover:bg-slate-200 text-slate-400 hover:text-indigo-600 rounded cursor-pointer transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <select
                    value={trainingCategory}
                    onChange={(e) => {
                      setTrainingCategory(e.target.value);

                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] cursor-pointer font-medium"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-black text-slate-700">Nível</label>
                    <button
                      type="button"
                      onClick={() => setIsLevelModalOpen(true)}
                      title="Gerenciar Níveis"
                      className="p-1 hover:bg-slate-200 text-slate-400 hover:text-[#1890ff] rounded cursor-pointer transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <select
                    value={trainingLevel}
                    onChange={(e: any) => setTrainingLevel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] cursor-pointer font-medium"
                  >
                    {levelsList.map(lvl => (
                      <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                  </select>
                </div>
              </div>


              <div className="mt-3">
                <label className="block text-xs font-black text-slate-700 mb-1">Status do Treinamento</label>
                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded p-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="trainingStatus" 
                      value="active" 
                      checked={trainingStatus === 'active'}
                      onChange={() => setTrainingStatus('active')}
                      className="accent-[#1890ff]"
                    />
                    <span className="text-xs font-medium text-slate-700">Ativo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="trainingStatus" 
                      value="cancelled" 
                      checked={trainingStatus === 'cancelled'}
                      onChange={() => setTrainingStatus('cancelled')}
                      className="accent-rose-500"
                    />
                    <span className="text-xs font-medium text-slate-700">Inativo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="trainingStatus" 
                      value="blocked" 
                      checked={trainingStatus === 'blocked'}
                      onChange={() => setTrainingStatus('blocked')}
                      className="accent-amber-500"
                    />
                    <span className="text-xs font-medium text-slate-700">Bloqueado</span>
                  </label>
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-xs font-black text-slate-700 mb-1">Descrição / Ementa</label>
                <textarea
                  value={trainingDescription}
                  onChange={(e) => setTrainingDescription(e.target.value)}
                  placeholder="Descreva o objetivo do treinamento e os principais resultados esperados..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1890ff] font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Imagem de Capa (Opcional)</label>
                <div 
                  className="w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg p-4 flex flex-col items-center justify-center gap-2 hover:bg-blue-50/50 hover:border-blue-300 transition-colors relative"
                  onPaste={handleCourseImagePaste}
                  tabIndex={0}
                >
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center gap-2 py-4">
                      <div className="w-6 h-6 border-2 border-[#1890ff] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[10px] font-bold text-[#1890ff]">Enviando imagem...</span>
                    </div>
                  ) : trainingImageUrl ? (
                    <div className="relative w-full">
                      <img src={trainingImageUrl} alt="Capa" className="w-full max-h-[160px] object-cover rounded shadow-sm border border-slate-200" />
                      <button
                        type="button"
                        onClick={async () => {
                          if (trainingImageUrl.includes('supabase.co')) {
                            await uploadService.deleteFile(trainingImageUrl);
                          }
                          setTrainingImageUrl('');
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded hover:bg-red-600 shadow cursor-pointer"
                        title="Remover Imagem"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Image className="w-5 h-5" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-600 font-medium">Clique, arraste ou <strong className="text-[#1890ff]">Ctrl+V</strong> para colar a capa</p>
                        <p className="text-[10px] text-slate-400 mt-1">Recomendado: 800x600px (JPG, PNG)</p>
                      </div>
                      <label className="absolute inset-0 w-full h-full cursor-pointer opacity-0">
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleCourseImageFileChange}
                        />
                      </label>
                    </>
                  )}
                </div>
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
          onSaveCourseSlides={async (courseId, presentation) => {
            try {
              await dbService.updateCourse(courseId, { presentation });
              if (onUpdateCourses && courses) {
                const updated = courses.map(c =>
                  c.id === courseId ? { ...c, presentation } : c
                );
                onUpdateCourses(updated);
              }
              showToast(`Slides do treinamento atualizados com sucesso!`);
            } catch (err) {
              console.error("Erro ao salvar slides:", err);
              showToast("Erro ao persistir slides no banco.");
            }
          }}
          unidades={localUnidades.length > 0 ? localUnidades : unidades}
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
                onClick={async () => {
                  const trimmed = newCategoryName.trim();

                  if (!trimmed) {
                    showToast('O nome da categoria não pode ser vazio.');
                    return;
                  }

                  try {
                    // Função para gerar código sequencial automático
                    const generateNextCode = () => {
                      const numericCodes = dbCategories
                        .map(c => parseInt(c.code, 10))
                        .filter(n => !isNaN(n));
                      const maxCode = numericCodes.length > 0 ? Math.max(...numericCodes) : 0;
                      return (maxCode + 1).toString().padStart(3, '0');
                    };

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

                      const dbCat = dbCategories.find(c => c.name === editingCategory);
                      if (dbCat) {
                        await dbService.updateCategory(dbCat.id, { name: trimmed });
                        setDbCategories(prev => prev.map(c => c.id === dbCat.id ? { ...c, name: trimmed } : c));
                      } else {
                        const newCode = generateNextCode();
                        const newDbCat = await dbService.createCategory(trimmed, newCode);
                        setDbCategories(prev => [...prev, newDbCat]);
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

                      const newCode = generateNextCode();
                      const newDbCat = await dbService.createCategory(trimmed, newCode);
                      setDbCategories(prev => [...prev, newDbCat]);

                      setCategories(prev => [...prev, trimmed]);
                      showToast(`Categoria "${trimmed}" cadastrada com sucesso!`);
                      setNewCategoryName('');
                    }
                  } catch (err: any) {
                    showToast('Erro ao salvar categoria: ' + err.message);
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
                    <div className="flex gap-1">
                      <button
                        onClick={async () => {
                          try {
                            const dbCat = dbCategories.find(c => c.name === cat);
                            if (dbCat) {
                              await dbService.deleteCategory(dbCat.id);
                              setDbCategories(prev => prev.filter(c => c.id !== dbCat.id));
                            }
                            setCategories(prev => prev.filter(c => c !== cat));
                            showToast(`Categoria "${cat}" excluída!`);
                          } catch (err: any) {
                            showToast('Erro ao excluir categoria: ' + err.message);
                          }
                        }}
                        title="Excluir Categoria"
                        className="p-1 hover:bg-slate-200 text-rose-500 hover:text-rose-700 rounded transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cadastro de Novo Nível */}
      {isLevelModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md p-5 max-w-sm w-full text-slate-950 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                {editingLevel ? 'Editar Nível' : 'Cadastrar Novo Nível'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {editingLevel ? 'Altere o nome do nível selecionado abaixo.' : 'Insira o nome do novo nível de complexidade.'}
              </p>
            </div>
            
            <input
              type="text"
              value={newLevelName}
              onChange={(e) => setNewLevelName(e.target.value)}
              placeholder="Ex: Expert, Básico, etc."
              className="w-full bg-slate-50 border border-slate-200 rounded-md p-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1890ff] font-medium"
            />

            <div className="flex justify-end gap-2 text-xs font-bold">
              <button
                onClick={() => {
                  setIsLevelModalOpen(false);
                  setNewLevelName('');
                  setEditingLevel(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const trimmed = newLevelName.trim();
                  if (!trimmed) {
                    showToast('O nome do nível não pode ser vazio.');
                    return;
                  }

                  if (editingLevel) {
                    if (editingLevel === trimmed) {
                      setEditingLevel(null);
                      setNewLevelName('');
                      return;
                    }

                    if (levelsList.includes(trimmed)) {
                      showToast(`O nível "${trimmed}" já existe!`);
                      return;
                    }

                    // 1. Update levels list
                    setLevelsList(prev => prev.map(l => l === editingLevel ? trimmed : l));

                    // 2. Update courses utilizing this level
                    if (courses && onUpdateCourses) {
                      const updatedCourses = courses.map(c => 
                        c.level === editingLevel ? { ...c, level: trimmed as any } : c
                      );
                      onUpdateCourses(updatedCourses);
                    }

                    showToast(`Nível alterado de "${editingLevel}" para "${trimmed}" com sucesso!`);
                    setEditingLevel(null);
                    setNewLevelName('');
                  } else {
                    if (levelsList.includes(trimmed)) {
                      showToast(`O nível "${trimmed}" já existe!`);
                      return;
                    }

                    setLevelsList(prev => [...prev, trimmed]);
                    showToast(`Nível "${trimmed}" cadastrado com sucesso!`);
                    setNewLevelName('');
                  }
                }}
                className="px-4 py-2 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded-md cursor-pointer"
              >
                {editingLevel ? 'Salvar Alteração' : 'Salvar'}
              </button>
            </div>

            {/* List of existing levels */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Níveis Cadastrados</span>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
                {levelsList.map((lvl) => (
                  <div key={lvl} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800">
                    <span>{lvl}</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setLevelsList(prev => prev.filter(l => l !== lvl));
                        }}
                        title="Excluir Nível"
                        className="p-1 hover:bg-slate-200 text-rose-500 hover:text-rose-700 rounded transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingLevel(lvl);
                          setNewLevelName(lvl);
                        }}
                        title="Editar Nível"
                        className="p-1 hover:bg-slate-200 text-[#1890ff] hover:text-[#116ebc] rounded transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
