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
    <div id="courses-view-container" className="pt-16 md:pt-18 px-3 md:px-5 pb-8 max-w-[1440px] mx-auto space-y-4 bg-[#f9f9ff] min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4 bg-white p-4 rounded-md shadow-2xs">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#1890ff]" />
            <span>Catálogo de Cursos & Formações</span>
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Formações acadêmicas e de liderança desenvolvidas com rigor técnico.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`category-tab-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#1890ff] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            id={`catalog-card-${course.id}`}
            className="bg-white border border-slate-200 rounded-md overflow-hidden flex flex-col group transition-all hover:border-[#1890ff] shadow-2xs"
          >
            <div className="relative h-44 overflow-hidden bg-slate-100">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {course.badge && (
                <span className="absolute top-3 left-3 bg-[#1890ff] text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow-xs">
                  {course.badge}
                </span>
              )}
            </div>

            <div className="p-4 flex flex-col flex-1">
              <span className="text-[10px] text-[#1890ff] uppercase font-black tracking-wider mb-1">
                {course.category}
              </span>

              <h3 className="text-sm font-extrabold text-slate-900 mb-1 line-clamp-2">
                {course.title}
              </h3>

              <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed font-medium">
                {course.description}
              </p>

              <div className="mt-auto space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 font-medium">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.totalLessons || 12} Aulas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{course.totalHours || '24h'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#1890ff]" />
                    <span>{course.level || 'Avançado'}</span>
                  </div>
                </div>

                {course.progress > 0 && (
                  <div>
                    <div className="flex justify-between items-center mb-1 text-[10px] font-bold">
                      <span className="text-slate-500">Progresso</span>
                      <span className="text-[#1890ff]">{course.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-[#1890ff] rounded"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <button
                  id={`access-course-btn-${course.id}`}
                  onClick={() => onSelectCourse(course)}
                  className="w-full py-2 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded font-bold transition-all text-xs uppercase tracking-wider active:scale-98 shadow-2xs cursor-pointer"
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
