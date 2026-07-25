import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getPermissionsForRole } from './src/utils/rbac';

const firebaseConfig = {
  projectId: "demo-sagacitas",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createMocks() {
  const alunoId = "mock-aluno-123";
  await setDoc(doc(db, 'users', alunoId), {
    id: alunoId,
    name: "Ana Silva (Aluno Fictício)",
    email: "ana.aluno@sagacitas.com.br",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Ana+Silva",
    provider: "Mock",
    role: "Aluno",
    status: "active",
    company_name: "Mock Company",
    enrollment_type: "individual",
    permissions: getPermissionsForRole("Aluno"),
    createdAt: new Date().toISOString()
  });

  const instrutorId = "mock-instrutor-123";
  await setDoc(doc(db, 'users', instrutorId), {
    id: instrutorId,
    name: "Carlos Mentor (Instrutor Fictício)",
    email: "carlos.instrutor@sagacitas.com.br",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Carlos+Mentor",
    provider: "Mock",
    role: "Instrutor",
    status: "active",
    company_name: "Mock Company",
    enrollment_type: "individual",
    permissions: getPermissionsForRole("Instrutor"),
    createdAt: new Date().toISOString()
  });
  
  console.log("Mock users created successfully!");
}

createMocks().catch(console.error);
