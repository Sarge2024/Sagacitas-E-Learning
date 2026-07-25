// Types for Course ↔ UC (Unidade de Conhecimento) composition

export interface CourseUCSlot {
  id: string;                // Unique slot ID
  uc_id: string;             // Reference to UnidadeConhecimento.id
  sequence_order: number;    // Position within the course curriculum
  aula_group?: number;       // Optional: group number when multiple UCs share one Aula
}

export interface CourseComposition {
  course_id: string;
  course_title: string;
  course_category: string;
  slots: CourseUCSlot[];     // Ordered list of UCs composing this course
}
