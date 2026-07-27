import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL or Service Role Key missing in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_TENANT_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // Using the mock tenant

const INITIAL_CATEGORIES = [
  'Finanças & DRE',
  'Engenharia de Cardápio',
  'Gestão de Custos & CMV',
  'Gestão de Equipes'
];

const INITIAL_COURSES = [
  {
    title: 'Alchymist Manager | Dominando a DRE do Restaurante',
    course_code: 'ALCH-DRE-01',
    description: 'Treinamento oficial complementar do sistema Alchymist Manager pela Sagacitas E-Learning. Aprenda a ler a DRE sem complicação contábil, identificar vazamentos de margem e tomar decisões de gestão para o seu restaurante.',
    category_name: 'Finanças & DRE',
    level: 'Iniciante',
    duration_minutes: 330,
    status: 'active'
  }
];

async function seed() {
  console.log('🌱 Starting DB Seeding...');

  // 1. Ensure Tenant exists (We use a known UUID for demo)
  console.log(`Checking Tenant ${DEFAULT_TENANT_ID}...`);
  const { data: tenant, error: tenantErr } = await supabase
    .from('tenants')
    .select('id')
    .eq('id', DEFAULT_TENANT_ID)
    .single();

  if (tenantErr || !tenant) {
    console.log('Tenant not found, creating demo tenant...');
    const { error: insertErr } = await supabase.from('tenants').insert({
      id: DEFAULT_TENANT_ID,
      slug: 'sagacitas-demo',
      nome_fantasia: 'Sagacitas Demo Tenant'
    });
    if (insertErr) {
      console.error('Error inserting tenant:', insertErr);
    }
  }

  // 2. Insert Categories
  console.log('Seeding Course Categories...');
  const categoryIdMap: Record<string, string> = {};

  for (let i = 0; i < INITIAL_CATEGORIES.length; i++) {
    const catName = INITIAL_CATEGORIES[i];
    const code = `${(i + 1).toString().padStart(3, '0')}`;
    
    // Check if exists
    const { data: existingCat } = await supabase
      .from('course_categories')
      .select('id')
      .eq('name', catName)
      .single();

    if (existingCat) {
      categoryIdMap[catName] = existingCat.id;
    } else {
      const { data: newCat, error } = await supabase
        .from('course_categories')
        .insert({ name: catName, code })
        .select('id')
        .single();
      
      if (error) {
        console.error(`Error inserting category ${catName}:`, error);
      } else if (newCat) {
        categoryIdMap[catName] = newCat.id;
      }
    }
  }

  // 3. Insert Courses
  console.log('Seeding Courses...');
  for (const course of INITIAL_COURSES) {
    const categoryId = categoryIdMap[course.category_name];
    
    const { data: existingCourse } = await supabase
      .from('courses')
      .select('id')
      .eq('title', course.title)
      .single();

    if (!existingCourse) {
      const { error } = await supabase
        .from('courses')
        .insert({
          title: course.title,
          course_code: course.course_code,
          description: course.description,
          category_id: categoryId,
          level: course.level,
          duration_minutes: course.duration_minutes,
          status: course.status,
          tenant_id: DEFAULT_TENANT_ID
        });

      if (error) {
        console.error(`Error inserting course ${course.title}:`, error);
      }
    }
  }

  console.log('✅ Seeding Complete!');
}

seed().catch(console.error);
