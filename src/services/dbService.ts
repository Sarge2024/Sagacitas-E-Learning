import { supabase, getCurrentTenantId } from '../lib/supabaseClient';
import { 
  DBCourse,
  DBCourseCategory,
  CompanyRecord,
  OAuthUser
} from '../types';
import { UnidadeConhecimento, TaxonomyOption } from '../types/edtechExpert';

/**
 * Payload tipado para criação/atualização de Unidades de Conhecimento.
 * Reflete os campos do formulário da UI do EdTech Expert.
 */
export interface KnowledgeUnitPayload {
  titulo: string;
  descricao_curta?: string;
  meta_bloom?: string | number;
  duracao_estimada_minutos?: number;
  status?: string;
  topico?: string;
  topico_complexidade?: string;
  area?: string;
  context?: string;
}

/**
 * Item de subgrupo de conteúdo de uma UC, organizado por nível de Bloom.
 */
export interface SubgroupPayloadItem {
  type: string;
  title: string;
  content?: string;
  [key: string]: unknown;
}

export interface DBKnowledgeUnitSignature {
  id: string;
  uc_id: string;
  code: string;
  tenant_id: string;
  created_at?: string;
}

export interface DBKnowledgeUnitSubgroup {
  id: string;
  uc_id: string;
  bloom_level_required: number;
  content_payload: any;
  tenant_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface DBKnowledgeUnit {
  id: string;
  tenant_id: string | null;
  title: string;
  description: string;
  bloom_level: number;
  estimated_duration_minutes: number;
  status: string;
  topic: string;
  topic_complexity: string;
  area: string;
  context: string;
  created_at: string;
  updated_at: string;
  signatures?: DBKnowledgeUnitSignature[];
  subgroups?: DBKnowledgeUnitSubgroup[];
}

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
    
    if (error) {
      console.error(`[dbService.getCategories] Falha ao buscar categorias: ${error.message}`);
      throw new Error(`Falha ao buscar categorias: ${error.message}`);
    }
    return data ?? [];
  },

  /**
   * Cria uma nova categoria de curso.
   * @param categoryName Nome da categoria (ex: 'Finanças')
   * @param code Código único de 3 dígitos (ex: 'C05')
   */
  async createCategory(categoryName: string, code: string): Promise<DBCourseCategory> {
    const { data, error } = await supabase
      .from('course_categories')
      .insert({ name: categoryName, code })
      .select('*')
      .single();

    if (error) {
      console.error(`[dbService.createCategory] Falha ao criar categoria '${categoryName}': ${error.message}`);
      throw new Error(`Falha ao criar categoria: ${error.message}`);
    }
    return data;
  },

  /**
   * Atualiza uma categoria existente.
   * @param categoryId ID da categoria a ser atualizada
   * @param updates Objeto contendo os campos a serem atualizados (nome, código, descrição)
   */
  async updateCategory(categoryId: string, updates: Partial<DBCourseCategory>): Promise<DBCourseCategory> {
    const { data, error } = await supabase
      .from('course_categories')
      .update(updates)
      .eq('id', categoryId)
      .select('*')
      .single();

    if (error) {
      console.error(`[dbService.updateCategory] Falha ao atualizar categoria ${categoryId}: ${error.message}`);
      throw new Error(`Falha ao atualizar categoria: ${error.message}`);
    }
    return data;
  },

  /**
   * Exclui uma categoria. O RLS/DB pode negar se houver cursos atrelados (dependendo do ON DELETE).
   * @param categoryId ID da categoria
   */
  async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('course_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error(`[dbService.deleteCategory] Falha ao excluir categoria ${categoryId}: ${error.message}`);
      throw new Error(`Falha ao excluir categoria: ${error.message}`);
    }
  },

  // --- Courses (Catálogo público — SELECT sem filtro, INSERT com tenant) ---
  async getCourses(): Promise<DBCourse[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error(`[dbService.getCourses] Falha ao buscar cursos: ${error.message}`);
      throw new Error(`Falha ao buscar cursos: ${error.message}`);
    }
    return data ?? [];
  },

  async getCourseById(courseId: string): Promise<DBCourse | null> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (error) {
      console.error(`[dbService.getCourseById] Falha ao buscar curso ${courseId}: ${error.message}`);
      throw new Error(`Falha ao buscar curso: ${error.message}`);
    }
    return data;
  },

  /**
   * Cria um novo curso atrelando-o obrigatoriamente ao Tenant atual.
   * @param courseData Dados do curso (sem ID, createdAt, etc)
   */
  async createCourse(courseData: Omit<DBCourse, 'id' | 'created_at' | 'updated_at'>): Promise<DBCourse> {
    const tenantId = getCurrentTenantId();
    const { category, ...rest } = courseData as any;
    const payload = { ...rest, tenant_id: tenantId };
    
    const { data, error } = await supabase
      .from('courses')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error(`[dbService.createCourse] Falha ao criar curso '${courseData.title}': ${error.message}`);
      throw new Error(`Falha ao criar curso: ${error.message}`);
    }
    return data;
  },

  /**
   * Atualiza metadados ou status de um curso.
   * @param courseId ID do curso alvo
   * @param updates Objeto contendo as colunas a serem atualizadas
   */
  async updateCourse(courseId: string, updates: Partial<DBCourse>): Promise<DBCourse> {
    const { category, ...payload } = updates as any;
    const { data, error } = await supabase
      .from('courses')
      .update(payload)
      .eq('id', courseId)
      .select('*')
      .single();

    if (error) {
      console.error(`[dbService.updateCourse] Falha ao atualizar curso ${courseId}: ${error.message}`);
      throw new Error(`Falha ao atualizar curso: ${error.message}`);
    }
    return data;
  },

  /**
   * Remove um curso permanentemente. Operação em cascata pode limpar UCs e Turmas relacionadas.
   * @param courseId ID do curso a ser excluído
   */
  async deleteCourse(courseId: string): Promise<void> {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) {
      console.error(`[dbService.deleteCourse] Falha ao excluir curso ${courseId}: ${error.message}`);
      throw new Error(`Falha ao excluir curso: ${error.message}`);
    }
  },



  // --- Companies (B2B — filtradas por tenant via RLS) ---
  async getCompanyDetails(companyId: string): Promise<Record<string, unknown> | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();
    
    if (error) {
      console.error(`[dbService.getCompanyDetails] Falha ao buscar empresa ${companyId}: ${error.message}`);
      throw new Error(`Falha ao buscar empresa: ${error.message}`);
    }
    return data;
  },

  // --- Knowledge Units (Multimodular UCs) ---
  async getKnowledgeUnits(): Promise<DBKnowledgeUnit[]> {
    const tenantId = getCurrentTenantId();
    // Filtro explícito por tenant como camada adicional de segurança além do RLS
    let query = supabase
      .from('knowledge_units')
      .select(`
        *,
        signatures:uc_pmest_signatures(*),
        subgroups:uc_subgroups(*)
      `);
      
    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error(`[dbService.getKnowledgeUnits] Falha ao buscar UCs: ${error.message}`);
      throw new Error(`Falha ao buscar UCs: ${error.message}`);
    }
    return (data as unknown as DBKnowledgeUnit[]) ?? [];
  },

  async createKnowledgeUnit(
    ucData: KnowledgeUnitPayload, 
    signatures: string[], 
    subgroupsPayloads: Record<number, SubgroupPayloadItem[]>
  ): Promise<DBKnowledgeUnit> {
    const tenantId = getCurrentTenantId();
    
    // 1. Insere a UC na tabela principal — tenant_id obrigatório para isolamento multi-tenant
    const { data: uc, error: ucError } = await supabase
      .from('knowledge_units')
      .insert({
        title: ucData.titulo,
        description: ucData.descricao_curta ?? '',
        bloom_level: ucData.meta_bloom ? (typeof ucData.meta_bloom === 'string' ? 2 : ucData.meta_bloom) : 2, 
        estimated_duration_minutes: ucData.duracao_estimada_minutos ?? 0,
        status: ucData.status ?? 'ativo',
        topic: ucData.topico ?? '',
        topic_complexity: ucData.topico_complexidade ?? '',
        area: ucData.area ?? 'SAG',
        context: ucData.context ?? 'GLOBAL',
        tenant_id: tenantId
      })
      .select('*')
      .single();

    if (ucError) {
      console.error(`[dbService.createKnowledgeUnit] Falha ao criar UC '${ucData.titulo}': ${ucError.message}`);
      throw new Error(`Falha ao criar UC: ${ucError.message}`);
    }
    
    // 2. Insere assinaturas PMEST vinculadas à UC criada
    if (signatures && signatures.length > 0) {
      const sigsToInsert = signatures.map(sig => ({
        uc_id: uc.id,
        code: sig,
        tenant_id: tenantId
      }));
      const { error: sigError } = await supabase.from('uc_pmest_signatures').insert(sigsToInsert);
      if (sigError) {
        console.error(`[dbService.createKnowledgeUnit] Falha ao inserir assinaturas: ${sigError.message}`);
        throw new Error(`Falha ao inserir assinaturas PMEST: ${sigError.message}`);
      }
    }

    // 3. Insere subgrupos de conteúdo organizados por nível de Bloom
    const subgroupKeys = Object.keys(subgroupsPayloads);
    if (subgroupKeys.length > 0) {
      const groupsToInsert = subgroupKeys.map(bl => ({
        uc_id: uc.id,
        bloom_level_required: parseInt(bl, 10),
        content_payload: subgroupsPayloads[parseInt(bl, 10)],
        tenant_id: tenantId
      }));
      const { error: groupError } = await supabase.from('uc_subgroups').insert(groupsToInsert);
      if (groupError) {
        console.error(`[dbService.createKnowledgeUnit] Falha ao inserir subgrupos: ${groupError.message}`);
        throw new Error(`Falha ao inserir subgrupos: ${groupError.message}`);
      }
    }

    return uc;
  },

  async updateKnowledgeUnit(
    ucId: string, 
    ucData: KnowledgeUnitPayload, 
    signatures: string[], 
    subgroupsPayloads: Record<number, SubgroupPayloadItem[]>
  ): Promise<boolean> {
    const tenantId = getCurrentTenantId();
    
    // 1. Atualiza a UC — filtro por tenant_id garante que só o dono pode editar
    const { error: ucError } = await supabase
      .from('knowledge_units')
      .update({
        title: ucData.titulo,
        description: ucData.descricao_curta ?? '',
        bloom_level: ucData.meta_bloom ? (typeof ucData.meta_bloom === 'string' ? 2 : ucData.meta_bloom) : 2,
        estimated_duration_minutes: ucData.duracao_estimada_minutos ?? 0,
        status: ucData.status ?? 'ativo',
        topic: ucData.topico ?? '',
        topic_complexity: ucData.topico_complexidade ?? '',
        area: ucData.area ?? 'SAG',
        context: ucData.context ?? 'GLOBAL'
      })
      .eq('id', ucId)
      .eq('tenant_id', tenantId);

    if (ucError) {
      console.error(`[dbService.updateKnowledgeUnit] Falha ao atualizar UC ${ucId}: ${ucError.message}`);
      throw new Error(`Falha ao atualizar UC: ${ucError.message}`);
    }
    
    // 2. Recria assinaturas PMEST — delete-then-insert para simplificar a lógica de diff
    await supabase.from('uc_pmest_signatures').delete().eq('uc_id', ucId);
    if (signatures && signatures.length > 0) {
      const sigsToInsert = signatures.map(sig => ({
        uc_id: ucId,
        code: sig,
        tenant_id: tenantId
      }));
      const { error: sigError } = await supabase.from('uc_pmest_signatures').insert(sigsToInsert);
      if (sigError) {
        console.error(`[dbService.updateKnowledgeUnit] Falha ao recriar assinaturas: ${sigError.message}`);
        throw new Error(`Falha ao recriar assinaturas: ${sigError.message}`);
      }
    }

    // 3. Recria subgrupos de conteúdo por nível de Bloom
    await supabase.from('uc_subgroups').delete().eq('uc_id', ucId);
    const subgroupKeys = Object.keys(subgroupsPayloads);
    if (subgroupKeys.length > 0) {
      const groupsToInsert = subgroupKeys.map(bl => ({
        uc_id: ucId,
        bloom_level_required: parseInt(bl, 10),
        content_payload: subgroupsPayloads[parseInt(bl, 10)],
        tenant_id: tenantId
      }));
      const { error: groupError } = await supabase.from('uc_subgroups').insert(groupsToInsert);
      if (groupError) {
        console.error(`[dbService.updateKnowledgeUnit] Falha ao recriar subgrupos: ${groupError.message}`);
        throw new Error(`Falha ao recriar subgrupos: ${groupError.message}`);
      }
    }
    
    return true;
  },
  
  async deleteKnowledgeUnit(ucId: string): Promise<void> {
    // Cascading deletes no banco tratam assinaturas e subgrupos automaticamente (ON DELETE CASCADE)
    const { error } = await supabase
      .from('knowledge_units')
      .delete()
      .eq('id', ucId);

    if (error) {
      console.error(`[dbService.deleteKnowledgeUnit] Falha ao excluir UC ${ucId}: ${error.message}`);
      throw new Error(`Falha ao excluir UC: ${error.message}`);
    }
  },

  // --- Taxonomy Options (PMEST Dict) ---
  async getTaxonomyOptions(category?: string): Promise<TaxonomyOption[]> {
    let query = supabase.from('taxonomy_options').select('*');
    // Busca opções globais e do tenant atual — o RLS filtra automaticamente pelo contexto da sessão
    if (category) {
      query = query.eq('category', category);
    }
    const { data, error } = await query;
    if (error) {
      console.error(`[dbService.getTaxonomyOptions] Falha ao buscar opções de taxonomia: ${error.message}`);
      throw new Error(`Falha ao buscar taxonomia: ${error.message}`);
    }
    return (data as unknown as TaxonomyOption[]) ?? [];
  },

  async createTaxonomyOption(payload: { category: string; code: string; name: string }): Promise<TaxonomyOption> {
    const tenantId = getCurrentTenantId();
    const { data, error } = await supabase.from('taxonomy_options').insert({
      tenant_id: tenantId,
      category: payload.category,
      code: payload.code,
      name: payload.name
    }).select('*').single();
    if (error) {
      console.error(`[dbService.createTaxonomyOption] Falha ao criar opção '${payload.name}': ${error.message}`);
      throw new Error(`Falha ao criar opção de taxonomia: ${error.message}`);
    }
    return data as unknown as TaxonomyOption;
  },

  async updateTaxonomyOption(id: string, payload: { code: string; name: string }): Promise<TaxonomyOption> {
    const { data, error } = await supabase.from('taxonomy_options')
      .update({ code: payload.code, name: payload.name })
      .eq('id', id)
      .select('*').single();
    if (error) {
      console.error(`[dbService.updateTaxonomyOption] Falha ao atualizar opção ${id}: ${error.message}`);
      throw new Error(`Falha ao atualizar opção de taxonomia: ${error.message}`);
    }
    return data as unknown as TaxonomyOption;
  },

  async deleteTaxonomyOption(id: string): Promise<boolean> {
    const { error } = await supabase.from('taxonomy_options').delete().eq('id', id);
    if (error) {
      console.error(`[dbService.deleteTaxonomyOption] Falha ao excluir opção ${id}: ${error.message}`);
      throw new Error(`Falha ao excluir opção de taxonomia: ${error.message}`);
    }
    return true;
  },

  async enrollStudent(studentId: string, classId: string): Promise<Record<string, unknown>> {
    const tenantId = getCurrentTenantId();
    const { data, error } = await supabase
      .from('class_enrollments')
      .insert({
        student_id: studentId,
        class_id: classId,
        tenant_id: tenantId,
      })
      .select('*')
      .single();

    if (error) {
      console.error(`[dbService.enrollStudent] Falha ao matricular aluno ${studentId} na turma ${classId}: ${error.message}`);
      throw new Error(`Falha ao matricular aluno: ${error.message}`);
    }
    return data;
  },

  // --- Gestão de Empresas (Companies) ---
  async getCompanies(): Promise<CompanyRecord[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error(`[dbService.getCompanies] Falha ao buscar empresas: ${error.message}`);
      throw new Error(`Falha ao buscar empresas: ${error.message}`);
    }
    return data ?? [];
  },

  async createCompany(payload: Omit<CompanyRecord, 'id' | 'tenant_id'>): Promise<CompanyRecord> {
    const tenantId = getCurrentTenantId();
    const { data, error } = await supabase
      .from('companies')
      .insert({
        name: payload.name,
        cnpj: payload.cnpj,
        domain: payload.domain,
        active: payload.active,
        tenant_id: tenantId,
      })
      .select('*')
      .single();

    if (error) {
      console.error(`[dbService.createCompany] Falha ao criar empresa: ${error.message}`);
      throw new Error(`Falha ao criar empresa: ${error.message}`);
    }
    return data;
  },

  async updateCompany(id: string, payload: Partial<CompanyRecord>): Promise<CompanyRecord> {
    const { data, error } = await supabase
      .from('companies')
      .update(payload)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error(`[dbService.updateCompany] Falha ao atualizar empresa ${id}: ${error.message}`);
      throw new Error(`Falha ao atualizar empresa: ${error.message}`);
    }
    return data;
  },

  async deleteCompany(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`[dbService.deleteCompany] Falha ao excluir empresa ${id}: ${error.message}`);
      throw new Error(`Falha ao excluir empresa: ${error.message}`);
    }
    return true;
  },

  // --- Gestão de Usuários da Empresa ---
  async getUsersByCompany(companyId: string): Promise<OAuthUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
      .order('name', { ascending: true });
    
    if (error) {
      console.error(`[dbService.getUsersByCompany] Falha ao buscar usuários da empresa ${companyId}: ${error.message}`);
      throw new Error(`Falha ao buscar usuários da empresa: ${error.message}`);
    }
    return data as OAuthUser[];
  },

  async getIndependentUsers(): Promise<OAuthUser[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .is('company_id', null)
      .order('name', { ascending: true });
    
    if (error) {
      console.error(`[dbService.getIndependentUsers] Falha ao buscar usuários independentes: ${error.message}`);
      throw new Error(`Falha ao buscar usuários independentes: ${error.message}`);
    }
    return data as OAuthUser[];
  },

  async associateUserWithCompany(userId: string, companyId: string | null): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .update({ company_id: companyId })
      .eq('id', userId);
      
    if (error) {
      console.error(`[dbService.associateUserWithCompany] Falha ao associar usuário ${userId}: ${error.message}`);
      throw new Error(`Falha ao associar usuário: ${error.message}`);
    }
    return true;
  }
};
