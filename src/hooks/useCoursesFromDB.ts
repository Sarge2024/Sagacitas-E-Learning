import { useState, useEffect } from 'react';
import { Course, Module, DBModule } from '../types';
import { dbService } from '../services/dbService';
import { INITIAL_COURSES } from '../data/coursesData';

/**
 * Helper to convert DBModule[] to frontend Module[] format.
 */
function mapDBModulesToModules(dbModules: DBModule[] | undefined): Module[] {
  if (!dbModules) return [];
  return dbModules.map((m) => ({
    id: m.id,
    title: m.title,
    focus: m.focus,
    lessons: (m.lessons || []).map((l, idx) => ({
      id: l.id,
      number: String(idx + 1).padStart(2, '0'),
      title: l.title,
      duration: '45 min',
      completed: false,
      description: l.objectives || '',
    })),
  }));
}

/**
 * Hook that loads courses from Supabase DB with graceful fallback to static mock data.
 * This ensures the app works both online (DB connected) and offline (local dev without Supabase).
 */
export function useCoursesFromDB() {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'db' | 'mock'>('mock');

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      try {
        const dbCourses = await dbService.getCourses();

        if (cancelled) return;

        if (dbCourses && dbCourses.length > 0) {
          // Map DB courses to the frontend Course interface, merging with static data where available
          const mappedCourses: Course[] = dbCourses.map((dbCourse) => {
            // Try to find a matching static course for rich data (modules, images, etc.)
            const staticMatch = INITIAL_COURSES.find(
              (c) => c.title === dbCourse.title || c.course_code === dbCourse.course_code
            );

            if (staticMatch) {
              // Merge: DB fields override static, but keep rich static data (modules, images, slides)
              return {
                ...staticMatch,
                id: dbCourse.id,
                title: dbCourse.title,
                description: dbCourse.description || staticMatch.description,
                image: dbCourse.image_url || staticMatch.image,
                level: (dbCourse.level as Course['level']) || staticMatch.level,
                status: dbCourse.status,
                course_code: dbCourse.course_code,
                totalHours: dbCourse.duration_minutes
                  ? `${Math.floor(dbCourse.duration_minutes / 60)}h ${dbCourse.duration_minutes % 60}min`
                  : staticMatch.totalHours,
                modules: dbCourse.modules ? mapDBModulesToModules(dbCourse.modules) : (staticMatch.modules || []),
                presentation: dbCourse.presentation || staticMatch.presentation || undefined,
              };
            }

            // No static match — build from DB data only
            return {
              id: dbCourse.id,
              title: dbCourse.title,
              category: dbCourse.category || 'Curso',
              progress: 0,
              image: dbCourse.image_url || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600',
              description: dbCourse.description || '',
              level: (dbCourse.level as Course['level']) || 'Iniciante',
              status: dbCourse.status,
              course_code: dbCourse.course_code,
              totalHours: dbCourse.duration_minutes
                ? `${Math.floor(dbCourse.duration_minutes / 60)}h ${dbCourse.duration_minutes % 60}min`
                : undefined,
              completedLessons: 0,
              totalLessons: 0,
              modules: mapDBModulesToModules(dbCourse.modules),
              presentation: dbCourse.presentation || undefined,
            };
          });

          setCourses(mappedCourses);
          setDataSource('db');
          console.log(`✅ [Sagacitas] ${mappedCourses.length} cursos carregados do banco de dados.`);
        } else {
          // DB is empty — use static fallback
          setDataSource('mock');
          console.log('⚠️ [Sagacitas] Banco vazio — usando dados mockados como fallback.');
        }
      } catch (err) {
        // DB error — use static fallback silently
        console.warn('⚠️ [Sagacitas] Falha ao conectar com o banco — usando dados mockados.', err);
        setDataSource('mock');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadCourses();
    return () => { cancelled = true; };
  }, []);

  return { courses, setCourses, isLoading, dataSource };
}
