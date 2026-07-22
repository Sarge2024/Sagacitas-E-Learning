import React from 'react';
import { Certificate } from '../types';
import { USER_PROFILE } from '../data/coursesData';
import { X, Award, Download, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface CertificateModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  onClose,
}) => {
  if (!certificate) return null;

  const handleDownloadPdf = () => {
    // Generate simple printable view / trigger browser print or download
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${certificate.pdfName}</title>
          <style>
            body {
              font-family: 'Inter', sans-serif;
              background-color: #0b1326;
              color: #dae2fd;
              margin: 0;
              padding: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .cert-box {
              border: 8px double #2fd9f4;
              border-radius: 24px;
              padding: 60px;
              background: #171f33;
              text-align: center;
              max-width: 800px;
              width: 100%;
              box-shadow: 0 0 50px rgba(47, 217, 244, 0.2);
            }
            h1 { color: #c0c1ff; font-size: 36px; margin-bottom: 8px; }
            h2 { color: #2fd9f4; font-size: 20px; text-transform: uppercase; letter-spacing: 2px; }
            .name { font-size: 32px; font-weight: bold; margin: 30px 0 10px; color: #ffffff; }
            .course { font-size: 24px; color: #ddb7ff; font-bold; margin-bottom: 20px; }
            .meta { font-size: 14px; color: #c7c4d7; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="cert-box">
            <h2>Certificado de Conclusão</h2>
            <h1>SAGACITAS E-LEARNING</h1>
            <p>Alchymist Manager System</p>
            <p>Certificamos que</p>
            <div class="name">${USER_PROFILE.name}</div>
            <p>concluiu com êxito a formação profissional em</p>
            <div class="course">${certificate.courseTitle}</div>
            <p>Carga horária total: ${certificate.hours} horas de ensino prático e teórico.</p>
            <div class="meta">
              Data de Emissão: ${certificate.issueDate} <br/>
              Código de Verificação: <strong>${certificate.credentialId}</strong>
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div
      id="certificate-modal-backdrop"
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        id="certificate-modal-content"
        className="w-full max-w-2xl bg-[#171f33] border border-white/20 rounded-[32px] p-8 shadow-2xl relative text-[#dae2fd] space-y-6"
      >
        <button
          id="close-cert-modal-btn"
          onClick={onClose}
          className="absolute top-6 right-6 text-[#c7c4d7] hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Certificate Display Card */}
        <div className="border-4 border-double border-[#2fd9f4]/40 bg-[#0b1326] rounded-2xl p-8 text-center space-y-6 relative overflow-hidden shadow-[0_0_30px_rgba(47,217,244,0.15)]">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-[#2fd9f4]/20 rounded-2xl flex items-center justify-center text-[#2fd9f4] border border-[#2fd9f4]/30">
              <Award className="w-8 h-8" />
            </div>
          </div>

          <div>
            <span className="text-[10px] text-[#2fd9f4] font-extrabold uppercase tracking-widest block mb-1">
              Documento de Certificação Oficial
            </span>
            <h2 className="text-2xl font-black text-[#dae2fd]">Sagacitas E-Learning</h2>
            <p className="text-xs text-[#2fd9f4] font-bold uppercase tracking-wider">Alchymist Manager System</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-[#c7c4d7]">Certificamos com distinção que</p>
            <p className="text-2xl font-bold text-white py-1">{USER_PROFILE.name}</p>
            <p className="text-xs text-[#c7c4d7]">concluiu com êxito o curso de especialização em</p>
            <p className="text-lg font-bold text-[#ddb7ff] pt-1">{certificate.courseTitle}</p>
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

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
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
            className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-xs text-[#c7c4d7] hover:text-white transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
