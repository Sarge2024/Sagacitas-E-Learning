import React, { useState } from 'react';
import { Certificate, OAuthUser } from '../types';
import { USER_PROFILE, INITIAL_CERTIFICATES } from '../data/coursesData';
import { Award, BookOpen, Clock, ShieldCheck, Download, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

interface ProfileViewProps {
  certificates: Certificate[];
  onOpenCertificateModal: (cert: Certificate) => void;
  onOpenProModal: () => void;
  oauthUser: OAuthUser | null;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  certificates,
  onOpenCertificateModal,
  onOpenProModal,
  oauthUser,
}) => {
  const displayName = oauthUser?.name || USER_PROFILE.name;
  const displayEmail = oauthUser?.email || USER_PROFILE.email;
  const displayAvatar = oauthUser?.avatar || USER_PROFILE.avatar;
  const displayRole = oauthUser?.role || USER_PROFILE.role;
  const companyName = oauthUser?.company_name || 'Nenhuma (Inscrição Individual)';
  const enrollmentType = oauthUser?.enrollment_type === 'corporate' ? 'Empresarial (B2B)' : 'Individual (B2C)';
  const enrollmentNumber = oauthUser?.enrollment_number || 'Não matriculado em turmas vigentes';

  const userCertificates = certificates.filter(
    (c) => !c.studentName || c.studentName === displayName || c.studentEmail === displayEmail
  );
  const displayCertificates = userCertificates.length > 0 ? userCertificates : certificates;

  return (
    <div id="profile-view-container" className="pt-16 md:pt-18 px-3 md:px-5 pb-8 max-w-[1440px] mx-auto space-y-5 bg-[#f9f9ff] min-h-screen">
      {/* User Header Hero */}
      <section id="user-profile-card" className="bg-white border border-slate-200 rounded-md p-4 md:p-5 relative overflow-hidden shadow-2xs">
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-[#1890ff] p-1 shadow-2xs">
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="absolute bottom-0 right-0 bg-[#1890ff] text-white p-1.5 rounded-full shadow-md">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900">{displayName}</h2>
              <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-200 text-[#1890ff] text-xs font-bold rounded w-fit mx-auto md:mx-0">
                Aluno Sagacitas Pro
              </span>
            </div>

            <p className="text-xs text-slate-600 font-bold">{displayRole}</p>
            <p className="text-xs text-slate-500 font-medium">{displayEmail}</p>

            {/* Container com dados do banco de dados */}
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 bg-slate-50 p-3.5 rounded border border-slate-200 text-left max-w-lg mx-auto md:mx-0 font-medium">
              <div><strong>🏢 Empresa:</strong> {companyName}</div>
              <div><strong>🎟️ Inscrição:</strong> {enrollmentType}</div>
              <div className="sm:col-span-2"><strong>🔢 Matrícula:</strong> <code className="text-[#1890ff] font-mono font-bold">{enrollmentNumber}</code></div>
            </div>
          </div>

          <button
            id="profile-upgrade-btn"
            onClick={onOpenProModal}
            className="px-5 py-2.5 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-98"
          >
            <Sparkles className="w-4 h-4" />
            <span>Gerenciar Assinatura</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3.5 rounded bg-slate-50 border border-slate-200">
            <BookOpen className="w-7 h-7 text-[#1890ff]" />
            <div>
              <p className="text-xl font-black text-slate-900">{USER_PROFILE.completedCoursesCount}</p>
              <p className="text-xs text-slate-600 font-medium">Cursos Concluídos</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded bg-slate-50 border border-slate-200">
            <Award className="w-7 h-7 text-[#1890ff]" />
            <div>
              <p className="text-xl font-black text-slate-900">{displayCertificates.length}</p>
              <p className="text-xs text-slate-600 font-medium">Certificados Verificados</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded bg-slate-50 border border-slate-200">
            <Clock className="w-7 h-7 text-[#1890ff]" />
            <div>
              <p className="text-xl font-black text-slate-900">{USER_PROFILE.studyHoursTotal}</p>
              <p className="text-xs text-slate-600 font-medium">Horas Dedicadas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Certificates Section */}
      <section id="certificates-section" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-[#1890ff]" />
            <span>Certificados Conquistados</span>
          </h3>
          <span className="text-xs text-[#1890ff] font-bold uppercase tracking-wider">
            {displayCertificates.length} Documentos Autenticados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayCertificates.map((cert) => (
            <div
              key={cert.id}
              id={`certificate-card-${cert.id}`}
              className="bg-white border border-slate-200 hover:border-[#1890ff] rounded-md p-5 flex flex-col justify-between space-y-4 transition-all shadow-2xs"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-[#1890ff] font-extrabold uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{cert.institutionName || 'Certificação Oficial Sagacitas'}</span>
                  </span>
                  <h4 className="text-base font-black text-slate-900">
                    {cert.courseTitle}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Emitido em {cert.issueDate} {cert.registrationNumber ? `• ${cert.registrationNumber}` : ''}
                  </p>
                </div>

                {cert.imageUrl ? (
                  <img
                    src={cert.imageUrl}
                    alt={cert.courseTitle}
                    className="w-14 h-14 object-cover rounded border border-blue-200 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-50 rounded flex items-center justify-center text-[#1890ff] shrink-0 border border-blue-200">
                    <Award className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600 font-mono">
                <span>Credencial ID: {cert.credentialId}</span>
                <span>{cert.hours} Horas de Formação</span>
              </div>

              <div className="flex gap-2">
                <button
                  id={`view-cert-btn-${cert.id}`}
                  onClick={() => onOpenCertificateModal(cert)}
                  className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded font-bold text-slate-800 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-[#1890ff]" />
                  <span>Visualizar Certificado</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
