import React from 'react';
import { Certificate } from '../types';
import { USER_PROFILE } from '../data/coursesData';
import { X, Award, Download, ShieldCheck, CheckCircle2, FileText, Sparkles } from 'lucide-react';

interface CertificateModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  onClose,
}) => {
  if (!certificate) return null;

  const targetStudentName = certificate.studentName || USER_PROFILE.name;
  const regNum = certificate.registrationNumber || 'Registração 0120022';

  const handleDownloadImage = () => {
    if (!certificate.imageUrl) return;
    const link = document.createElement('a');
    link.href = certificate.imageUrl;
    link.download = certificate.pdfName.replace('.pdf', '.png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPdf = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      if (certificate.imageUrl) {
        // Image-based certificate download/print window
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${certificate.pdfName}</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                background-color: #000;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
              }
              img {
                max-width: 100%;
                height: auto;
                box-shadow: 0 0 40px rgba(0,0,0,0.8);
              }
            </style>
          </head>
          <body>
            <img src="${certificate.imageUrl}" alt="Certificado" />
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
          </html>
        `);
      } else {
        // Formatted printable certificate
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${certificate.pdfName}</title>
            <style>
              body {
                font-family: 'Times New Roman', serif;
                background-color: #fdfbf7;
                color: #1a1a1a;
                margin: 0;
                padding: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
              }
              .cert-border {
                border: 12px double #8b6b23;
                border-radius: 12px;
                padding: 50px;
                background: #fffdf9;
                text-align: center;
                max-width: 850px;
                width: 100%;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                position: relative;
              }
              .reg-top {
                position: absolute;
                top: 20px;
                right: 30px;
                font-size: 11px;
                font-family: sans-serif;
                color: #666;
              }
              h1 { font-size: 32px; letter-spacing: 2px; color: #332200; margin-bottom: 20px; text-transform: uppercase; }
              h2 { font-size: 18px; font-family: sans-serif; color: #555; font-weight: normal; margin-bottom: 25px; }
              .name { font-size: 34px; font-weight: bold; margin: 25px 0; color: #1a1a1a; letter-spacing: 1px; border-bottom: 2px solid #8b6b23; display: inline-block; padding-bottom: 5px; }
              .course { font-size: 26px; font-weight: bold; color: #8b6b23; margin: 15px 0; text-transform: uppercase; }
              .desc { font-size: 14px; font-family: sans-serif; color: #444; line-height: 1.6; max-width: 650px; margin: 0 auto 25px; }
              .meta { font-size: 13px; font-family: sans-serif; color: #666; margin-top: 30px; display: flex; justify-content: space-between; border-top: 1px solid #ddd; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="cert-border">
              <div class="reg-top">${regNum}</div>
              <h1>CERTIFICADO DE CONCLUSÃO</h1>
              <h2>A instituição SAGACITAS E-LEARNING certifica que</h2>
              <div class="name">${targetStudentName}</div>
              <p style="font-family: sans-serif; font-size: 15px; color: #555;">concluiu com êxito o curso de</p>
              <div class="course">${certificate.courseTitle}</div>
              <p class="desc">${certificate.description || 'Este curso integra o conjunto de ferramentas do sistema Alchymist Manager.'}</p>
              <p style="font-family: sans-serif; font-size: 14px; font-weight: bold; color: #333;">Carga horária total: ${certificate.hours} horas.</p>
              
              <div class="meta">
                <div>Data de Emissão: <strong>${certificate.issueDate}</strong></div>
                <div>Código: <strong>${certificate.credentialId}</strong></div>
              </div>
            </div>
            <script>
              window.onload = function() { window.print(); }
            </script>
          </body>
          </html>
        `);
      }
      printWindow.document.close();
    }
  };

  return (
    <div
      id="certificate-modal-backdrop"
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto"
    >
      <div
        id="certificate-modal-content"
        className="w-full max-w-3xl bg-[#171f33] border border-white/20 rounded-[32px] p-6 md:p-8 shadow-2xl relative text-[#dae2fd] space-y-6 my-8"
      >
        <button
          id="close-cert-modal-btn"
          onClick={onClose}
          className="absolute top-6 right-6 text-[#c7c4d7] hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header badge */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#2fd9f4]/20 rounded-2xl flex items-center justify-center text-[#2fd9f4] border border-[#2fd9f4]/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-[#2fd9f4] font-extrabold uppercase tracking-widest block">
              Documento de Certificação Oficial
            </span>
            <h2 className="text-xl font-black text-[#dae2fd]">{certificate.courseTitle}</h2>
          </div>
        </div>

        {/* Certificate Rendering Area */}
        {certificate.imageUrl ? (
          /* Custom Uploaded Image Preview */
          <div className="rounded-2xl border-2 border-[#2fd9f4]/40 overflow-hidden bg-black shadow-2xl relative group">
            <img
              src={certificate.imageUrl}
              alt={certificate.courseTitle}
              className="w-full h-auto max-h-[500px] object-contain mx-auto"
            />
            <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-md text-xs px-3 py-1.5 rounded-xl border border-white/20 text-[#2fd9f4] font-mono font-bold">
              Certificado Original Uploaded
            </div>
          </div>
        ) : certificate.templateType === 'pergaminho_sagacitas' ? (
          /* Pergaminho Template View (Matching Attachment 2) */
          <div className="border-8 border-double border-[#d4af37]/60 bg-[#fbf6ea] text-slate-900 rounded-2xl p-8 md:p-10 text-center space-y-5 relative overflow-hidden shadow-2xl font-serif">
            <div className="text-right text-[11px] font-mono text-amber-900/70">{regNum}</div>

            <div className="space-y-1">
              <span className="text-xs font-bold font-sans uppercase tracking-widest text-amber-900/80 block">
                Sagacitas E-Learning
              </span>
              <h2 className="text-2xl md:text-3xl font-black tracking-wide text-[#3d2706]">
                CERTIFICADO DE CONCLUSÃO DE CURSO
              </h2>
            </div>

            <div className="space-y-2 text-xs md:text-sm text-slate-700 font-sans">
              <p>Pelo presente, a <strong>Sagacitas E-Learning</strong> certifica que</p>
              <p className="text-2xl md:text-3xl font-bold font-serif text-[#1f1302] py-1 uppercase tracking-wider border-b border-amber-900/20 max-w-md mx-auto">
                {targetStudentName}
              </p>
              <p>concluiu com aproveitamento o curso:</p>
              <p className="text-lg md:text-xl font-bold text-[#8c600f] font-sans uppercase py-1">
                {certificate.courseTitle}
              </p>
              <p className="max-w-lg mx-auto text-xs text-slate-600 leading-relaxed font-sans">
                {certificate.description || 'Este curso integra o conjunto de ferramentas do sistema Alchymist Manager, fornecendo conhecimentos avançados.'}
              </p>
              <p className="font-bold text-slate-900 font-sans pt-1">
                Carga horária total: {certificate.hours} horas.
              </p>
            </div>

            <div className="pt-4 border-t border-amber-900/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-slate-600">
              <div className="text-left">
                <p>Data de Emissão: <strong className="text-slate-900">{certificate.issueDate}</strong></p>
                <p>Autenticação: <strong className="text-slate-900">{certificate.credentialId}</strong></p>
              </div>
              <div className="px-3 py-1 rounded-lg bg-amber-900/10 text-amber-950 text-[10px] font-bold font-mono border border-amber-900/20">
                Selo Oficial Alchimia do Prato • Sagacitas
              </div>
            </div>
          </div>
        ) : (
          /* Standard Golden Frame Template View (Matching Attachment 1) */
          <div className="border-4 border-double border-[#2fd9f4]/40 bg-[#0b1326] rounded-2xl p-8 text-center space-y-6 relative overflow-hidden shadow-[0_0_30px_rgba(47,217,244,0.15)]">
            <div className="flex justify-between items-center text-xs font-mono text-[#2fd9f4]/70">
              <span>{certificate.institutionName || 'SAGACITAS E-LEARNING'}</span>
              <span>{regNum}</span>
            </div>

            <div className="flex justify-center">
              <div className="w-14 h-14 bg-[#2fd9f4]/20 rounded-2xl flex items-center justify-center text-[#2fd9f4] border border-[#2fd9f4]/30">
                <Award className="w-7 h-7" />
              </div>
            </div>

            <div>
              <span className="text-[10px] text-[#2fd9f4] font-extrabold uppercase tracking-widest block mb-1">
                Certificado Oficial de Conclusão
              </span>
              <h2 className="text-2xl font-black text-[#dae2fd]">SAGACITAS E-LEARNING</h2>
              <p className="text-xs text-[#2fd9f4] font-bold uppercase tracking-wider">Alchymist Manager System</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-[#c7c4d7]">Certificamos com distinção que</p>
              <p className="text-2xl font-bold text-white py-1 uppercase">{targetStudentName}</p>
              <p className="text-xs text-[#c7c4d7]">concluiu com êxito o curso de especialização em</p>
              <p className="text-lg font-bold text-[#ddb7ff] pt-1 uppercase">{certificate.courseTitle}</p>
              {certificate.description && (
                <p className="text-xs text-[#c7c4d7]/80 max-w-md mx-auto pt-1">{certificate.description}</p>
              )}
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#c7c4d7]/70">
              <div className="text-left">
                <p>Data de Emissão: <strong className="text-white">{certificate.issueDate}</strong></p>
                <p>Carga Horária: <strong className="text-white">{certificate.hours} Horas</strong></p>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <ShieldCheck className="w-4 h-4 text-[#2fd9f4]" />
                <span className="font-mono text-[11px] text-[#2fd9f4] font-bold">
                  {certificate.credentialId}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {certificate.imageUrl && (
            <button
              onClick={handleDownloadImage}
              className="flex-1 py-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.3)] active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Imagem do Certificado (PNG)</span>
            </button>
          )}

          <button
            id="download-pdf-cert-modal-btn"
            onClick={handleDownloadPdf}
            className="flex-1 py-3.5 bg-[#2fd9f4] hover:bg-[#25c4de] text-[#001f25] rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(47,217,244,0.3)] active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Imprimir / Baixar PDF Autêntico</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-xs text-[#c7c4d7] hover:text-white transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

