import React from 'react';
import { Course, ViewMode, OAuthUser } from '../types';
import { USER_PROFILE } from '../data/coursesData';
import { BookOpen, Award, Clock, ArrowRight } from 'lucide-react';

interface DashboardViewProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  onSelectView: (view: ViewMode) => void;
  currentUser: OAuthUser | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  courses,
  onSelectCourse,
  onSelectView,
  currentUser,
}) => {
  // Main active training courses
  const myTrainings = courses.slice(0, 3);
  // Featured recommendations
  const recommendations = courses.slice(3, 5);

  return (
    <div id="dashboard-view-container" className="pt-16 md:pt-18 px-3 md:px-5 pb-8 max-w-[1440px] mx-auto space-y-5 bg-[#f9f9ff] min-h-screen">
      {/* Welcome Hero Section */}
      <section id="welcome-section" className="relative overflow-hidden rounded-md p-4 md:p-5 border border-slate-200 bg-white shadow-2xs">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#1890ff] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                Sagacitas E-Learning
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 mt-2 tracking-tight">
                Bem-vindo de volta, {currentUser?.name || 'Visitante'}!
              </h2>
              <p className="text-slate-600 text-sm max-w-2xl mt-1 leading-relaxed font-normal">
                Seu progresso esta semana foi excelente. Você completou {USER_PROFILE.weeklyProgress}% dos seus objetivos de aprendizado no portal Sagacitas E-Learning.
              </p>
            </div>

            <button
              id="hero-go-virtual-class-btn"
              onClick={() => onSelectView('lesson')}
              className="px-5 py-2.5 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded-md font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0 self-start md:self-center"
            >
              <span>Ir para Sala Virtual</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            {/* Stat Card 1 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-md p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center text-[#1890ff] shrink-0 font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold">Cursos Concluídos</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">{USER_PROFILE.completedCoursesCount}</p>
              </div>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-md p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-md flex items-center justify-center text-amber-600 shrink-0 font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold">Certificações Ativas</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">{USER_PROFILE.activeCertificatesCount}</p>
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-md p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-md flex items-center justify-center text-emerald-600 shrink-0 font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-extrabold">Horas de Estudo</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">{USER_PROFILE.studyHoursTotal}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Tools Banner */}
      <section id="alchymist-quick-tools" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={() => onSelectView('dre-simulator')}
          className="bg-white border border-slate-200 rounded-md p-5 hover:border-[#1890ff] transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-[#1890ff] tracking-wider uppercase bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              SIMULADOR PRÁTICO
            </span>
            <ArrowRight className="w-4 h-4 text-[#1890ff] group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="text-base font-black text-slate-900 mb-1">Simulador DRE de Restaurante</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Insira receita, CMV e despesas operacionais para diagnósticos e simulações financeiras completas.
          </p>
        </div>

        <div 
          onClick={() => onSelectView('matrix')}
          className="bg-white border border-slate-200 rounded-md p-5 hover:border-[#1890ff] transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-purple-700 tracking-wider uppercase bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200">
              GESTÃO ACADÊMICA
            </span>
            <ArrowRight className="w-4 h-4 text-purple-700 group-hover:translate-x-1 transition-transform" />
          </div>
          <h4 className="text-base font-black text-slate-900 mb-1">Matriz de Ações & Calendar</h4>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Consulte a matriz de causa raiz, acompanhe o checklist de 10 passos e consulte o calendário de aulas.
          </p>
        </div>
      </section>

      {/* Meus Treinamentos Section */}
      <section id="meus-treinamentos-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Cursos em Andamento</h3>
          <button
            id="view-all-trainings-btn"
            onClick={() => onSelectView('courses')}
            className="text-[#1890ff] hover:underline text-xs uppercase font-extrabold tracking-wider"
          >
            Ver catálogo completo →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myTrainings.map((course) => (
            <div
              key={course.id}
              id={`course-card-${course.id}`}
              className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col group transition-all hover:border-[#1890ff] shadow-2xs"
            >
              <div className="relative h-40 overflow-hidden bg-slate-100">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                  {course.duration}
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <h4 className="text-sm font-extrabold text-slate-900 mb-4 line-clamp-2 min-h-[40px]">
                  {course.title}
                </h4>

                <div className="mt-auto space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1.5 text-xs font-bold">
                      <span className="text-slate-500">Progresso</span>
                      <span className="text-[#1890ff]">{course.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-[#1890ff] rounded transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <button
                    id={`continue-course-btn-${course.id}`}
                    onClick={() => onSelectCourse(course)}
                    className="w-full py-2 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded font-bold transition-all active:scale-98 text-xs cursor-pointer shadow-2xs"
                  >
                    Continuar Aula
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Recommendations Section */}
      <section id="recomendados-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Recomendados para você</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((course) => (
            <div
              key={course.id}
              id={`recommendation-card-${course.id}`}
              onClick={() => onSelectCourse(course)}
              className="bg-white border border-slate-200 rounded-md p-5 hover:border-[#1890ff] transition-all cursor-pointer group flex flex-col justify-between shadow-2xs"
            >
              <div>
                <span className={`font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded border w-fit mb-2 inline-block ${
                  course.badge === 'TRENDING' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-blue-50 text-[#1890ff] border-blue-200'
                }`}>
                  {course.badge || 'RECOMENDADO'}
                </span>

                <h4 className="text-base font-black text-slate-900 mb-1">
                  {course.title}
                </h4>

                <p className="text-slate-600 text-xs line-clamp-2 font-medium mb-4">
                  {course.description}
                </p>
              </div>

              <div className="flex items-center gap-2 text-[#1890ff] font-bold text-xs group-hover:translate-x-1 transition-transform">
                <span>Explorar e Iniciar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer id="dashboard-footer" className="pt-6 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
        <div>
          <p className="font-black text-slate-900 text-sm mb-0.5">Sagacitas E-Learning</p>
          <p>© 2026 Sagacitas E-Learning • Alchymist Manager. Todos os direitos reservados.</p>
        </div>
        <div className="flex gap-4 font-semibold text-slate-600">
          <a href="#" className="hover:text-[#1890ff] transition-colors">Suporte</a>
          <a href="#" className="hover:text-[#1890ff] transition-colors">Privacidade</a>
          <a href="#" className="hover:text-[#1890ff] transition-colors">Termos do Portal</a>
          <a href="#" className="hover:text-[#1890ff] transition-colors">FAQ</a>
        </div>
      </footer>
    </div>
  );
};
