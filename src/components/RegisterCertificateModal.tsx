import React, { useState, useRef } from 'react';
import { Certificate } from '../types';
import {
  Award,
  X,
  Upload,
  FileImage,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  FileText,
  User,
  BookOpen,
  Clock,
  Key,
  Calendar,
} from 'lucide-react';

interface RegisterCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterCertificate: (certificate: Omit<Certificate, 'id'>) => void;
}

const STUDENT_OPTIONS = [
  { name: 'Gabriel Mendes', email: 'sagacitas.assessoria@gmail.com' },
  { name: 'Mariana Costa', email: 'mariana.costa@alchymist.com.br' },
  { name: 'Lucas Oliveira', email: 'lucas.oliveira@sagacitas.edu.br' },
  { name: 'Beatriz Santos', email: 'beatriz.santos@gastronomia.com.br' },
  { name: 'Rodrigo Silva', email: 'rodrigo.silva@restaurante.com.br' },
  { name: 'Aline Vasconcelos', email: 'aline.v@sagacitas.edu.br' },
  { name: 'OUTRO', email: '' },
];

const COURSE_OPTIONS = [
  'Engenharia de Cardápio & Fichas Técnicas',
  'Dominando a DRE do Restaurante',
  'Gestão Operacional de Salão e Delivery',
  'Fluxo de Caixa & Fôlego Financeiro',
  'Precificação & CMV na Prática',
  'Controle de Estoque & Fichas Técnicas',
  'Análise de Margem e CMV Real',
  'OUTRO',
];

export const RegisterCertificateModal: React.FC<RegisterCertificateModalProps> = ({
  isOpen,
  onClose,
  onRegisterCertificate,
}) => {
  const [selectedStudentKey, setSelectedStudentKey] = useState('Gabriel Mendes');
  const [studentName, setStudentName] = useState('Gabriel Mendes');
  const [studentEmail, setStudentEmail] = useState('sagacitas.assessoria@gmail.com');
  
  const [selectedCourseKey, setSelectedCourseKey] = useState('Engenharia de Cardápio & Fichas Técnicas');
  const [courseTitle, setCourseTitle] = useState('Engenharia de Cardápio & Fichas Técnicas');
  const [hours, setHours] = useState(20);
  const [registrationNumber, setRegistrationNumber] = useState(`0120022`);
  const [credentialId, setCredentialId] = useState(`SAG-2026-${Math.floor(10000 + Math.random() * 90000)}`);
  const [issueDate, setIssueDate] = useState('22 de Julho de 2026');
  const [description, setDescription] = useState(
    'Este curso integra o conjunto de ferramentas do sistema Alchymist Manager, fornecendo conhecimentos práticos e avançados.'
  );
  const [templateType, setTemplateType] = useState<'oficial_alchymist' | 'pergaminho_sagacitas' | 'custom_upload'>('oficial_alchymist');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImageUrl(event.target.result as string);
          setTemplateType('custom_upload');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !courseTitle.trim()) {
      alert('Por favor, preencha o nome do aluno e o título do curso.');
      return;
    }

    const pdfName = `Certificado_${courseTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${studentName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

    onRegisterCertificate({
      courseTitle,
      studentName,
      studentEmail,
      issueDate,
      credentialId,
      registrationNumber: registrationNumber || `RegistroIC00${Math.floor(1000 + Math.random() * 9000)}:01`,
      hours: Number(hours) || 20,
      institutionName: 'SAGACITAS E-LEARNING',
      description,
      pdfName,
      imageUrl: uploadedImageUrl || undefined,
      templateType,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-md max-w-3xl w-full my-8 overflow-hidden shadow-2xs text-slate-800">
        {/* Header */}
        <div className="bg-white p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-[#1890ff]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Cadastrar Novo Certificado de Aluno</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-[#1890ff] font-mono border border-blue-200 uppercase font-extrabold">
                  Carteira do Instrutor
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Emita um certificado oficial com upload de arquivo ou modelo pré-formatado para o perfil do aluno
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Student Dropdown Selection */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#1890ff]" />
                <span>Selecionar Aluno (Destinatário)</span>
              </label>
              <select
                value={selectedStudentKey}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedStudentKey(val);
                  if (val !== 'OUTRO') {
                    const found = STUDENT_OPTIONS.find((s) => s.name === val);
                    if (found) {
                      setStudentName(found.name);
                      setStudentEmail(found.email);
                    }
                  } else {
                    setStudentName('');
                    setStudentEmail('');
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] cursor-pointer font-medium"
              >
                {STUDENT_OPTIONS.map((student) => (
                  <option key={student.name} value={student.name} className="bg-white text-slate-800 p-2">
                    {student.name === 'OUTRO' ? '➕ Outro Aluno (Digitar manualmente...)' : `${student.name} (${student.email})`}
                  </option>
                ))}
              </select>

              {/* If "OUTRO" is selected, render custom inputs for name and email */}
              {selectedStudentKey === 'OUTRO' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 animate-fadeIn">
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Nome completo do aluno"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1890ff] font-medium"
                  />
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="E-mail do aluno"
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1890ff] font-medium"
                  />
                </div>
              )}
            </div>

            {/* Course Dropdown Selection */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-[#1890ff]" />
                <span>Selecionar Curso / Formação Concluída</span>
              </label>
              <select
                value={selectedCourseKey}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedCourseKey(val);
                  if (val !== 'OUTRO') {
                    setCourseTitle(val);
                  } else {
                    setCourseTitle('');
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] cursor-pointer font-medium"
              >
                {COURSE_OPTIONS.map((course) => (
                  <option key={course} value={course} className="bg-white text-slate-800 p-2">
                    {course === 'OUTRO' ? '➕ Outro Curso (Digitar manualmente...)' : course}
                  </option>
                ))}
              </select>

              {/* If "OUTRO" is selected, render custom input for course title */}
              {selectedCourseKey === 'OUTRO' && (
                <div className="pt-2 animate-fadeIn">
                  <input
                    type="text"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    placeholder="Nome personalizado do curso ou formação"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1890ff] font-medium"
                  />
                </div>
              )}
            </div>

            {/* Workload hours */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#1890ff]" />
                <span>Carga Horária (Horas)</span>
              </label>
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                min={1}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] font-medium"
              />
            </div>

            {/* Registration Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#1890ff]" />
                <span>Número de Registração / Protocolo</span>
              </label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="Ex: Registração 0120022 ou RegistroIC00123:01"
                className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-[#1890ff] font-medium"
              />
            </div>

            {/* Credential ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1890ff]" />
                <span>Código Verificador de Credencial</span>
              </label>
              <input
                type="text"
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] font-mono font-bold"
              />
            </div>

            {/* Issue Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#1890ff]" />
                <span>Data de Emissão</span>
              </label>
              <input
                type="text"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                placeholder="Ex: 22 de Julho de 2026"
                className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] font-medium"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700">
              Texto de Certificação & Escopo
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] resize-none font-medium"
            />
          </div>

          {/* Primary File Upload Dropzone */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <label className="block text-xs font-black uppercase tracking-wider text-[#1890ff] flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#1890ff]" />
                <span>Upload do Arquivo de Imagem do Certificado</span>
              </span>
              <span className="text-[10px] text-emerald-800 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                Recomendado (PNG, JPG, WEBP)
              </span>
            </label>

            {/* Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-md p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 relative overflow-hidden ${
                isDragging
                  ? 'border-[#1890ff] bg-blue-50'
                  : uploadedImageUrl
                  ? 'border-emerald-500 bg-emerald-50/20'
                  : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-[#1890ff]'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleInputChange}
                accept="image/*,.pdf"
                className="hidden"
              />

              {uploadedImageUrl ? (
                <div className="w-full space-y-4">
                  <div className="relative max-w-md mx-auto rounded overflow-hidden border-2 border-emerald-500 shadow-2xs group">
                    <img
                      src={uploadedImageUrl}
                      alt="Imagem do Certificado Uploaded"
                      className="w-full h-48 object-contain bg-white p-2"
                    />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="text-xs font-bold text-white bg-slate-900 px-3 py-1.5 rounded">
                        Trocar Imagem
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Imagem exata do certificado pronta para ser vinculada ao perfil! ({uploadedFileName})</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1890ff]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Arraste e solte o arquivo da imagem do certificado aqui
                    </h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      ou clique em qualquer área para selecionar uma imagem do seu dispositivo (PNG, JPG, WEBP)
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Alternative Formats Selection */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-600 block mb-2">
                Ou selecione um modelo visual pré-formatado (caso não tenha o arquivo de imagem):
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Template Option 1: Moldura Ouro Alchymist */}
                <button
                  type="button"
                  onClick={() => {
                    setTemplateType('oficial_alchymist');
                    setUploadedImageUrl(null);
                    setUploadedFileName(null);
                  }}
                  className={`p-3 rounded border text-left transition-all cursor-pointer ${
                    templateType === 'oficial_alchymist' && !uploadedImageUrl
                      ? 'bg-blue-50 border-[#1890ff] ring-1 ring-[#1890ff]/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-slate-900">Moldura Ouro Alchymist</span>
                    {templateType === 'oficial_alchymist' && !uploadedImageUrl && (
                      <CheckCircle2 className="w-4 h-4 text-[#1890ff]" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Estilo clássico dourado com selo Alquimia do Prato</p>
                </button>

                {/* Template Option 2: Pergaminho Rústico */}
                <button
                  type="button"
                  onClick={() => {
                    setTemplateType('pergaminho_sagacitas');
                    setUploadedImageUrl(null);
                    setUploadedFileName(null);
                  }}
                  className={`p-3 rounded border text-left transition-all cursor-pointer ${
                    templateType === 'pergaminho_sagacitas' && !uploadedImageUrl
                      ? 'bg-blue-50 border-[#1890ff] ring-1 ring-[#1890ff]/20'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-slate-900">Pergaminho Rústico</span>
                    {templateType === 'pergaminho_sagacitas' && !uploadedImageUrl && (
                      <CheckCircle2 className="w-4 h-4 text-[#1890ff]" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">Visual pergaminho envelhecido com brasão oficial</p>
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              className="flex-1 py-3 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Cadastrar & Enviar para Perfil do Aluno</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded font-bold text-xs text-slate-700 transition-all cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
