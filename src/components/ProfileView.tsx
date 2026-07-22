import React, { useState } from 'react';
import { Certificate } from '../types';
import { USER_PROFILE, INITIAL_CERTIFICATES } from '../data/coursesData';
import { Award, BookOpen, Clock, ShieldCheck, Download, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';

interface ProfileViewProps {
  certificates: Certificate[];
  onOpenCertificateModal: (cert: Certificate) => void;
  onOpenProModal: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  certificates,
  onOpenCertificateModal,
  onOpenProModal,
}) => {
  const userCertificates = certificates.filter(
    (c) => !c.studentName || c.studentName === USER_PROFILE.name || c.studentEmail === USER_PROFILE.email
  );
  const displayCertificates = userCertificates.length > 0 ? userCertificates : certificates;

  return (
    <div id="profile-view-container" className="pt-20 px-8 pb-12 max-w-[1440px] mx-auto space-y-10">
      {/* User Header Hero */}
      <section id="user-profile-card" className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 md:p-10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-[#2fd9f4] p-1 shadow-[0_0_25px_rgba(47,217,244,0.3)]">
              <img
                src={USER_PROFILE.avatar}
                alt={USER_PROFILE.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="absolute bottom-1 right-1 bg-[#2fd9f4] text-[#001f25] p-1.5 rounded-full shadow-lg">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h2 className="text-3xl font-extrabold text-[#dae2fd]">{USER_PROFILE.name}</h2>
              <span className="px-3 py-1 bg-[#2fd9f4]/20 border border-[#2fd9f4]/30 text-[#2fd9f4] text-xs font-bold rounded-full w-fit mx-auto md:mx-0">
                Sagacitas Pro Member
              </span>
            </div>

            <p className="text-sm text-[#c7c4d7] font-medium">{USER_PROFILE.role}</p>
            <p className="text-xs text-[#c7c4d7]/60">{USER_PROFILE.email}</p>
          </div>

          <button
            id="profile-upgrade-btn"
            onClick={onOpenProModal}
            className="px-6 py-3 bg-[#8083ff] hover:bg-[#6c70ff] text-[#0d0096] rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(128,131,255,0.3)] active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Gerenciar Assinatura</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <BookOpen className="w-8 h-8 text-[#c0c1ff]" />
            <div>
              <p className="text-2xl font-bold text-[#dae2fd]">{USER_PROFILE.completedCoursesCount}</p>
              <p className="text-xs text-[#c7c4d7]">Cursos Concluídos</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <Award className="w-8 h-8 text-[#2fd9f4]" />
            <div>
              <p className="text-2xl font-bold text-[#dae2fd]">{displayCertificates.length}</p>
              <p className="text-xs text-[#c7c4d7]">Certificados Verificados</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
            <Clock className="w-8 h-8 text-[#ddb7ff]" />
            <div>
              <p className="text-2xl font-bold text-[#dae2fd]">{USER_PROFILE.studyHoursTotal}</p>
              <p className="text-xs text-[#c7c4d7]">Horas Dedicadas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Certificates Section */}
      <section id="certificates-section" className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-2xl font-bold text-[#dae2fd] flex items-center gap-2">
            <Award className="w-6 h-6 text-[#2fd9f4]" />
            <span>Certificados Conquistados</span>
          </h3>
          <span className="text-xs text-[#2fd9f4] font-semibold uppercase tracking-wider">
            {displayCertificates.length} Documentos Autenticados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayCertificates.map((cert) => (
            <div
              key={cert.id}
              id={`certificate-card-${cert.id}`}
              className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 hover:border-white/25 rounded-2xl p-6 flex flex-col justify-between space-y-6 group transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-[#2fd9f4] font-extrabold uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{cert.institutionName || 'Certificação Sagacitas E-Learning'}</span>
                  </span>
                  <h4 className="text-lg font-bold text-[#dae2fd] group-hover:text-[#c0c1ff] transition-colors">
                    {cert.courseTitle}
                  </h4>
                  <p className="text-xs text-[#c7c4d7]/70">
                    Emitido em {cert.issueDate} {cert.registrationNumber ? `• ${cert.registrationNumber}` : ''}
                  </p>
                </div>

                {cert.imageUrl ? (
                  <img
                    src={cert.imageUrl}
                    alt={cert.courseTitle}
                    className="w-14 h-14 object-cover rounded-xl border border-[#2fd9f4]/30 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 bg-[#2fd9f4]/10 rounded-xl flex items-center justify-center text-[#2fd9f4] shrink-0 border border-[#2fd9f4]/20">
                    <Award className="w-6 h-6" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-[#c7c4d7]/60">
                <span>Credencial ID: {cert.credentialId}</span>
                <span>{cert.hours} Horas de Formação</span>
              </div>

              <div className="flex gap-3">
                <button
                  id={`view-cert-btn-${cert.id}`}
                  onClick={() => onOpenCertificateModal(cert)}
                  className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-[#c0c1ff] transition-all text-xs flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Visualizar Certificado</span>
                </button>

                <button
                  id={`download-cert-btn-${cert.id}`}
                  onClick={() => onOpenCertificateModal(cert)}
                  className="px-4 py-2.5 bg-[#2fd9f4]/20 hover:bg-[#2fd9f4]/30 border border-[#2fd9f4]/30 rounded-xl font-bold text-[#2fd9f4] transition-all text-xs flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
