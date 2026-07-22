import React, { useState } from 'react';
import { Course } from '../types';
import { Search, GraduationCap, Clock, BookOpen, Layers } from 'lucide-react';

interface CoursesViewProps {
  courses: Course[];
  onSelectCourse: (course: Course) => void;
  searchQuery: string;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  onSelectCourse,
  searchQuery,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = [
    'Todos',
    'Alchymist Manager & Gestão',
    'Gastronomia & Vendas',
    'Operações & Cozinha',
  ];

  const filteredCourses = courses.filter((c) => {
    const matchesCategory =
      selectedCategory === 'Todos' || c.category === selectedCategory;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div id="courses-view-container" className="pt-20 px-8 pb-12 max-w-[1440px] mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-[#dae2fd] tracking-tight flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-[#2fd9f4]" />
            <span>Catálogo de Cursos</span>
          </h2>
          <p className="text-sm text-[#c7c4d7] mt-1">
            Explore nossas formações avançadas desenvolvidas por especialistas da indústria.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`category-tab-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#2fd9f4] text-[#001f25] font-bold shadow-[0_0_15px_rgba(47,217,244,0.3)]'
                  : 'bg-white/5 text-[#c7c4d7] hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            id={`catalog-card-${course.id}`}
            className="bg-white/[0.06] backdrop-blur-2xl border border-white/10 hover:border-white/25 rounded-[24px] overflow-hidden flex flex-col group transition-all hover:shadow-[0_0_25px_rgba(192,193,255,0.1)]"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1326] via-transparent to-transparent"></div>

              {course.badge && (
                <span className="absolute top-4 left-4 bg-[#2fd9f4]/20 border border-[#2fd9f4]/40 text-[#2fd9f4] text-[10px] uppercase font-extrabold tracking-widest px-3 py-1 rounded-full backdrop-blur-md">
                  {course.badge}
                </span>
              )}
            </div>

            <div className="p-6 flex flex-col flex-1">
              <span className="text-[10px] text-[#2fd9f4] uppercase font-bold tracking-widest mb-1">
                {course.category}
              </span>

              <h3 className="text-lg font-bold text-[#dae2fd] mb-2 line-clamp-2">
                {course.title}
              </h3>

              <p className="text-xs text-[#c7c4d7] line-clamp-2 mb-6 leading-relaxed">
                {course.description}
              </p>

              <div className="mt-auto space-y-4">
                <div className="flex items-center justify-between text-xs text-[#c7c4d7]/80 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#c0c1ff]" />
                    <span>{course.totalLessons || 12} Aulas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#ddb7ff]" />
                    <span>{course.totalHours || '24h'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#2fd9f4]" />
                    <span>{course.level || 'Avançado'}</span>
                  </div>
                </div>

                {course.progress > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-1 text-[11px] font-semibold">
                      <span className="text-[#c7c4d7]">Progresso</span>
                      <span className="text-[#2fd9f4] font-bold">{course.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#171f33] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2fd9f4] rounded-full"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <button
                  id={`access-course-btn-${course.id}`}
                  onClick={() => onSelectCourse(course)}
                  className="w-full py-3 bg-[#8083ff] hover:bg-[#6c70ff] text-[#0d0096] rounded-xl font-bold transition-all text-xs uppercase tracking-wider active:scale-95 shadow-[0_0_15px_rgba(128,131,255,0.2)]"
                >
                  {course.progress > 0 ? 'Continuar Aprendendo' : 'Acessar Curso'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
