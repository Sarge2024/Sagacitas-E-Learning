import React from 'react';
import { Course, ViewMode } from '../types';
import { USER_PROFILE } from '../data/coursesData';
import { BookOpen, Award, Clock, ArrowRight } from 'lucide-react';

interface DashboardViewProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  onSelectView: (view: ViewMode) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  courses,
  onSelectCourse,
  onSelectView,
}) => {
  // Main active training courses
  const myTrainings = courses.slice(0, 3);
  // Featured recommendations
  const recommendations = courses.slice(3, 5);

  return (
    <div id="dashboard-view-container" className="pt-20 px-8 pb-12 max-w-[1440px] mx-auto space-y-12">
      {/* Welcome Hero Section */}
      <section id="welcome-section" className="relative overflow-hidden rounded-[32px] p-8 md:p-10 border border-white/10 bg-[#0b1326]/60 backdrop-blur-2xl">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#dae2fd] mb-4 tracking-tight">
            Bem-vindo de volta, Gabriel!
          </h2>
          <p className="text-[#c7c4d7] text-base md:text-lg max-w-2xl mb-8 leading-relaxed font-normal">
            Seu progresso esta semana foi excepcional. Você completou {USER_PROFILE.weeklyProgress}% dos seus objetivos de aprendizado planejados.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Stat Card 1 */}
            <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(192,193,255,0.1)] transition-all rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#c0c1ff]/20 rounded-xl flex items-center justify-center text-[#c0c1ff] shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[#c7c4d7] font-semibold">Cursos Completos</p>
                <p className="text-2xl font-bold text-[#dae2fd] mt-0.5">{USER_PROFILE.completedCoursesCount}</p>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(47,217,244,0.1)] transition-all rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#2fd9f4]/20 rounded-xl flex items-center justify-center text-[#2fd9f4] shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[#c7c4d7] font-semibold">Certificações Ativas</p>
                <p className="text-2xl font-bold text-[#dae2fd] mt-0.5">{USER_PROFILE.activeCertificatesCount}</p>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 hover:border-white/20 hover:shadow-[0_0_20px_rgba(221,183,255,0.1)] transition-all rounded-2xl p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#ddb7ff]/20 rounded-xl flex items-center justify-center text-[#ddb7ff] shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[#c7c4d7] font-semibold">Horas de Estudo</p>
                <p className="text-2xl font-bold text-[#dae2fd] mt-0.5">{USER_PROFILE.studyHoursTotal}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alchymist Manager Quick Tools Banner */}
      <section id="alchymist-quick-tools" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => onSelectView('dre-simulator')}
          className="bg-gradient-to-r from-[#0b1326] to-[#172038] border border-[#2fd9f4]/30 rounded-[28px] p-6 hover:border-[#2fd9f4] transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-extrabold text-[#2fd9f4] tracking-widest uppercase bg-[#2fd9f4]/10 px-3 py-1 rounded-full border border-[#2fd9f4]/20">
              FERRAMENTA ALCHYMIST
            </span>
            <ArrowRight className="w-5 h-5 text-[#2fd9f4] group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="text-xl font-bold text-[#dae2fd] mb-2">Simulador de DRE do Restaurante</h4>
          <p className="text-xs text-[#c7c4d7] leading-relaxed">
            Insira receita, CMV e despesas para obter diagnósticos instantâneos da saúde do seu restaurante e identificar gargalos de margem.
          </p>
        </div>

        <div 
          onClick={() => onSelectView('matrix')}
          className="bg-gradient-to-r from-[#0b1326] to-[#1e1c38] border border-[#c0c1ff]/30 rounded-[28px] p-6 hover:border-[#c0c1ff] transition-all cursor-pointer group shadow-lg"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-extrabold text-[#c0c1ff] tracking-widest uppercase bg-[#c0c1ff]/10 px-3 py-1 rounded-full border border-[#c0c1ff]/20">
              GESTÃO PRÁTICA
            </span>
            <ArrowRight className="w-5 h-5 text-[#c0c1ff] group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="text-xl font-bold text-[#dae2fd] mb-2">Matriz de Ações & Ritual Mensal</h4>
          <p className="text-xs text-[#c7c4d7] leading-relaxed">
            Consulte a matriz com causas raízes de oscilação de faturamento/lucro e acompanhe o checklist de 10 passos do dono.
          </p>
        </div>
      </section>

      {/* Meus Treinamentos Section */}
      <section id="meus-treinamentos-section">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-[#dae2fd] tracking-tight">Meus Treinamentos</h3>
          <button
            id="view-all-trainings-btn"
            onClick={() => onSelectView('courses')}
            className="text-[#2fd9f4] hover:underline text-xs uppercase font-semibold tracking-wider"
          >
            Ver todos
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myTrainings.map((course) => (
            <div
              key={course.id}
              id={`course-card-${course.id}`}
              className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 hover:border-white/25 rounded-[24px] overflow-hidden flex flex-col group transition-all hover:shadow-[0_0_20px_rgba(192,193,255,0.12)]"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1326] via-transparent to-transparent"></div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <h4 className="text-lg font-semibold text-[#dae2fd] mb-6 line-clamp-2 min-h-[56px]">
                  {course.title}
                </h4>

                <div className="mt-auto space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2 text-xs font-semibold">
                      <span className="text-[#c7c4d7]">Progresso</span>
                      <span className="text-[#2fd9f4] font-bold">{course.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#171f33] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2fd9f4] rounded-full shadow-[0_0_10px_rgba(47,217,244,0.5)] transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <button
                    id={`continue-course-btn-${course.id}`}
                    onClick={() => onSelectCourse(course)}
                    className="w-full py-3 bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl font-semibold text-[#c0c1ff] hover:text-white transition-all active:scale-95 text-sm"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Recommendations Section */}
      <section id="recomendados-section">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-[#dae2fd] tracking-tight">Recomendados para você</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((course) => (
            <div
              key={course.id}
              id={`recommendation-card-${course.id}`}
              onClick={() => onSelectCourse(course)}
              className="relative group cursor-pointer overflow-hidden rounded-[24px] h-64 border border-white/10 bg-white/[0.06] backdrop-blur-2xl hover:border-white/25 transition-all"
            >
              <img
                src={course.image}
                alt={course.title}
                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0b1326] via-[#0b1326]/70 to-transparent p-8 flex flex-col justify-center">
                <span className={`font-semibold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full w-fit mb-3 ${
                  course.badge === 'TRENDING' ? 'bg-[#2fd9f4]/20 text-[#2fd9f4]' : 'bg-[#ddb7ff]/20 text-[#ddb7ff]'
                }`}>
                  {course.badge || 'RECOMENDADO'}
                </span>

                <h4 className="text-2xl font-bold text-[#dae2fd] mb-2 max-w-sm">
                  {course.title}
                </h4>

                <p className="text-[#c7c4d7] text-sm max-w-sm mb-6 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center gap-2 text-[#c0c1ff] font-bold text-sm group-hover:translate-x-1 transition-transform">
                  <span>Explorar curso</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="dashboard-footer" className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-[#c7c4d7]/70 gap-4">
        <div>
          <p className="font-bold text-[#c0c1ff] text-sm mb-0.5">Sagacitas E-Learning</p>
          <p>© 2026 Sagacitas E-Learning • Alchymist Manager System. Todos os direitos reservados.</p>
        </div>
        <div className="flex gap-6 font-semibold">
          <a href="#" className="hover:text-[#2fd9f4] transition-colors">Suporte</a>
          <a href="#" className="hover:text-[#2fd9f4] transition-colors">Política de Privacidade</a>
          <a href="#" className="hover:text-[#2fd9f4] transition-colors">Termos do Alchymist Manager</a>
          <a href="#" className="hover:text-[#2fd9f4] transition-colors">Dúvidas Frequentes</a>
        </div>
      </footer>
    </div>
  );
};
