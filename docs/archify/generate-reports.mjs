import { execSync } from 'child_process';
import path from 'path';

const archifyBin = '/home/sstulzer/.agents/skills/archify/bin/archify.mjs';
const archifyDir = path.resolve(process.cwd(), 'docs', 'archify');

console.log('🚀 Building Archify Reports for Sagacitas E-Learning...\n');

const diagrams = [
  { type: 'architecture', input: 'sagacitas-elearning.architecture.json', output: 'sagacitas-elearning-architecture.html' },
  { type: 'workflow', input: 'agent-loop.workflow.json', output: 'agent-loop-workflow.html' },
  { type: 'sequence', input: 'ai-tutor.sequence.json', output: 'ai-tutor-sequence.html' },
  { type: 'dataflow', input: 'event-topology.dataflow.json', output: 'event-topology-dataflow.html' },
  { type: 'lifecycle', input: 'tutor-request.lifecycle.json', output: 'tutor-request-lifecycle.html' }
];

for (const d of diagrams) {
  const inputPath = path.join(archifyDir, d.input);
  const outputPath = path.join(archifyDir, d.output);
  console.log(`📌 Rendering ${d.type} diagram: ${d.input} -> ${d.output}`);
  try {
    const cmd = `node "${archifyBin}" deliver ${d.type} "${inputPath}" "${outputPath}" --quality standard`;
    execSync(cmd, { stdio: 'inherit' });
    console.log(`✅ Delivered: ${outputPath}\n`);
  } catch (err) {
    console.error(`❌ Failed to render ${d.input}:`, err.message);
  }
}

console.log('✨ Archify reports generation complete!');
