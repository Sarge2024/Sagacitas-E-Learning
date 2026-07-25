// Types for the Dynamic Question Bank (Metalúrgica Silva Case)
// Reflects the Supabase Relational Model

export interface KnowledgeUnit {
  id: string;
  tenant_id: string;
  code: string;
  title: string;
  dimension: string;
  bloom_level: 1 | 2 | 3 | 4 | 5 | 6;
  created_at: string;
  updated_at: string;
}

export interface Scenario {
  id: string;
  tenant_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  tenant_id: string;
  uc_id: string;
  scenario_id?: string | null;
  bloom_level_applied: 1 | 2 | 3 | 4 | 5 | 6;
  statement: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnswerOption {
  id: string;
  tenant_id: string;
  question_id: string;
  text: string;
  is_correct: boolean;
  feedback?: string | null;
  created_at: string;
  updated_at: string;
}

// Relational types for fetching
export interface QuestionWithRelations extends Question {
  scenario?: Scenario;
  knowledge_unit?: KnowledgeUnit;
  options: AnswerOption[];
}
