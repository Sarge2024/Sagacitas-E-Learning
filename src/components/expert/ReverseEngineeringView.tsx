import React, { useState } from 'react';
import { MOCK_MATRIZES, MOCK_UNIDADES_CONHECIMENTO } from '../../services/expertService';
import { CourseGeneratorService } from '../../services/courseGeneratorService';
import { DidacticCompilerService } from '../../services/didacticCompilerService';
import { UnidadeConhecimento, MatrizCompetencia } from '../../types/edtechExpert';
import { Course } from '../../types';
import { 
  Wand2, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  Download, 
  Eye, 
  Layers, 
  ArrowRight,
  Sparkles,
  Printer
} from 'lucide-react';

export const ReverseEngineeringView: React.FC = () => {
  const [selectedMatriz, setSelectedMatriz] = useState<MatrizCompetencia>(MOCK_MATRIZES[0]);
  const [selectedUcs, setSelectedUcs] = useState<UnidadeConhecimento[]>(MOCK_UNIDADES_CONHECIMENTO);
  const [generatedCourse, setGeneratedCourse] = useState<Course | null>(null);
  const [compiledHtmlPreview, setCompiledHtmlPreview] = useState<string | null>(null);

  const handleGenerateCourse = () => {
    const course = CourseGeneratorService.gerarCursoEngenhariaReversa(selectedMatriz, selectedUcs);
    setGeneratedCourse(course);
  };

  const handleCompileDidacticMaterial = () => {
    const html = DidacticCompilerService.compilarApostilaHTML(
      generatedCourse ? generatedCourse.title : selectedMatriz.nome,
      selectedUcs
    );
    setCompiledHtmlPreview(html);
  };

  const handlePrintOrDownloadPDF = () => {
    if (!compiledHtmlPreview) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(compiledHtmlPreview);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1890ff] to-[#096dd9] flex items-center justify-center text-white font-bold shadow-xs">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Engenharia Reversa de Cursos & Compilador Didático</h2>
            <p className="text-xs text-slate-500">
              Construção automatizada do curso (Habilidades desejadas → Seleção de UCs → Sequenciamento lógico de Bloom → Material Didático em PDF/HTML).
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1: Select Skill Matrix & Atomic UCs */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-4 shadow-xs">
          <span className="text-[10px] font-mono font-bold text-[#1890ff] uppercase tracking-wider block">
            PASSO 1: Seleção de Competências Desejadas
          </span>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Matriz de Competência Alvo:</label>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-xs font-extrabold text-slate-900 block">{selectedMatriz.nome}</span>
                <span className="text-[11px] text-slate-500 block">Cargo: {selectedMatriz.cargo_alvo}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Unidades de Conhecimento Requeridas ({selectedUcs.length}):</label>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {selectedUcs.map((uc) => (
                  <div key={uc.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">[{uc.codigo}] {uc.titulo}</span>
                      <span className="text-[10px] text-blue-600 font-mono font-bold">Bloom: {uc.meta_bloom}</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateCourse}
              className="w-full py-3 bg-[#1890ff] hover:bg-[#096dd9] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Wand2 className="w-4 h-4" />
              <span>Executar Engenharia Reversa (Gerar Curso)</span>
            </button>
          </div>
        </div>

        {/* Step 2: Automated Course Structure */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-4 shadow-xs">
          <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider block">
            PASSO 2: Estrutura Montada Automatizada
          </span>

          {generatedCourse ? (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl space-y-1">
                <span className="text-xs font-mono font-bold text-emerald-700">{generatedCourse.course_code}</span>
                <h4 className="font-extrabold text-sm text-slate-900">{generatedCourse.title}</h4>
                <span className="text-[11px] text-slate-500 block">Duração Total: {generatedCourse.totalHours} | {generatedCourse.totalLessons} Lições</span>
              </div>

              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {generatedCourse.modules?.map((mod) => (
                  <div key={mod.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <span className="font-extrabold text-slate-900 block">{mod.title}</span>
                    <span className="text-[10px] text-slate-500 block">Foco: {mod.focus}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleCompileDidacticMaterial}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-[#1890ff]" />
                <span>Compilar Material Didático (Apostila HTML/PDF)</span>
              </button>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400 text-xs">
              Clique em "Executar Engenharia Reversa" no Passo 1 para visualizar a montagem automatizada.
            </div>
          )}
        </div>
      </div>

      {/* Step 3: Didactic Material Preview & PDF Print */}
      {compiledHtmlPreview && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#1890ff]" />
              <h3 className="font-extrabold text-slate-900 text-base">Pré-visualização do Material Didático Compilado</h3>
            </div>

            <button
              onClick={handlePrintOrDownloadPDF}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Salvar em PDF</span>
            </button>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-h-[350px] overflow-y-auto">
            <iframe
              srcDoc={compiledHtmlPreview}
              title="Preview Didático"
              className="w-full h-[300px] border-none rounded-lg bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
};
