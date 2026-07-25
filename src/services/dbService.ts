import { supabase, getCurrentTenantId } from '../lib/supabaseClient';
import { 
  DBCourse, 
  DBDiscipline, 
  DBLesson, 
  DBQuestion, 
  DBClass, 
  DBClassEnrollment, 
  DBCompany, 
  DBCourseCategory,
  DBInstructor
} from '../types';

/**
 * Database Service to interface with the Supabase schema.
 * 
 * NOTA MULTI-TENANT: As tabelas transacionais possuem `tenant_id` e políticas RLS
 * que filtram automaticamente via `current_setting('app.current_tenant_id')`.
 * 
 * Para operações de INSERT/UPDATE, o `tenant_id` é injetado explicitamente
 * para garantir que o registro pertença ao tenant correto.
 * 
 * Tabelas de catálogo público (courses, disciplines, lessons, categories)
 * possuem SELECT público — o RLS permite leitura para todos.
 */
export const dbService = {
  // --- Course Categories (Catálogo público — sem filtro tenant) ---
  async getCategories(): Promise<DBCourseCategory[]> {
    const { data, error } = await supabase
      .from('course_categories')
      .select('*')
      .order('code', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // --- Courses (Catálogo público — SELECT sem filtro, INSERT com tenant) ---
  async getCourses(): Promise<DBCourse[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getCourseById(courseId: string): Promise<DBCourse | null> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // --- Disciplines (Catálogo público) ---
  async getDisciplines(courseId: string): Promise<DBDiscipline[]> {
    const { data, error } = await supabase
      .from('disciplines')
      .select('*')
      .eq('course_id', courseId)
      .order('sequence_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // --- Lessons (Many-to-Many resolution via discipline_lessons) ---
  async getLessonsForDiscipline(disciplineId: string): Promise<DBLesson[]> {
    const { data, error } = await supabase
      .from('discipline_lessons')
      .select(`
        sequence_order,
        lessons (
          id,
          title,
          content,
          video_url,
          created_at,
          updated_at
        )
      `)
      .eq('discipline_id', disciplineId)
      .order('sequence_order', { ascending: true });

    if (error) throw error;
    
    // Format the junction result to return the flat list of lessons
    return (data || []).map((item: any) => item.lessons).filter(Boolean);
  },

  // --- Questions (Question bank by Lesson) ---
  async getQuestionsForLesson(lessonId: string): Promise<DBQuestion[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // --- Classes (Turmas Virtuais — filtradas por tenant via RLS) ---
  async getClassesForDiscipline(disciplineId: string): Promise<DBClass[]> {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('discipline_id', disciplineId)
      .order('start_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getInstructorPortfolio(instructorId: string): Promise<DBClass[]> {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('instructor_id', instructorId)
      .order('start_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  // --- Class Enrollments (Matrículas com limite de 100 alunos) ---
  async enrollStudent(studentId: string, classId: string): Promise<DBClassEnrollment> {
    const tenantId = getCurrentTenantId();
    const { data, error } = await supabase
      .from('class_enrollments')
      .insert({
        student_id: studentId,
        class_id: classId,
        tenant_id: tenantId
      })
      .select('*')
      .single();

    if (error) {
      // If capacity is reached, our Postgres trigger check_class_capacity() throws a RAISE EXCEPTION
      // which we propagate here to the client
      throw error;
    }
    return data;
  },

  async getStudentEnrollments(studentId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('class_enrollments')
      .select(`
        id,
        enrollment_date,
        enrollment_number,
        classes (
          id,
          title,
          start_date,
          end_date,
          status,
          disciplines (
            id,
            title,
            courses (
              id,
              title
            )
          )
        )
      `)
      .eq('student_id', studentId);
    
    if (error) throw error;
    return data || [];
  },

  // --- Companies (B2B — filtradas por tenant via RLS) ---
  async getCompanyDetails(companyId: string): Promise<DBCompany | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();
    
    if (error) throw error;
    return data;
  }
};
