import { config } from 'dotenv';
config();

// Mock localStorage for Node environment
(global as any).localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

import { MOCK_UNIDADES_CONHECIMENTO } from '../src/services/expertService';
import { dbService } from '../src/services/dbService';

async function seed() {
  console.log('Seeding mock UCs to database...');
  for (const uc of MOCK_UNIDADES_CONHECIMENTO) {
    console.log(`Inserting ${uc.codigo} - ${uc.titulo}...`);
    
    // Group components by Bloom Level
    const groupedComponents = (uc.layout_template.components || []).reduce((acc: any, curr: any) => {
      const bl = curr.bloomLevel || (uc.meta_bloom === 'CONHECIMENTO' ? 1 : 2);
      if (!acc[bl]) acc[bl] = [];
      acc[bl].push({
        type: curr.type,
        title: curr.title,
        body: curr.body,
        metadata: curr.metadata || {}
      });
      return acc;
    }, {});

    // Save to DB
    const signatures = [uc.codigo!];
    
    // Set some defaults for the new fields Area and Context
    const payload = {
      ...uc,
      area: 'FIN',
      context: 'GLOBAL',
      status: 'ativo',
    };

    try {
      await dbService.createKnowledgeUnit(payload, signatures, groupedComponents);
      console.log(`Success: ${uc.codigo}`);
    } catch (e: any) {
      console.error(`Failed: ${uc.codigo}`, e.message);
    }
  }
  console.log('Seed completed!');
  process.exit(0);
}

seed();
