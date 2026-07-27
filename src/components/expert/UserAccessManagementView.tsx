import React, { useState, useEffect } from 'react';
import { OAuthUser, SystemPermission, RoleProfile, PermissionHash } from '../../types';
import { collection, onSnapshot, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Shield,
  Users,
  CheckCircle2,
  XCircle,
  FileText,
  Check,
  UserCheck,
  Sparkles,
  Sliders,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { RESOURCES, getPermissionsForRole, getPermissionsHashForRole } from '../../utils/rbac';

interface UserAccessManagementViewProps {
  currentUser: OAuthUser | null;
  onSimulateLogin: (user: OAuthUser) => void;
  onRestoreAdmin: () => void;
  isSimulated: boolean;
}

// We import RESOURCES and getPermissionsForRole from rbac.ts

export const UserAccessManagementView: React.FC<UserAccessManagementViewProps> = ({
  currentUser,
  onSimulateLogin,
  onRestoreAdmin,
  isSimulated,
}) => {
  const [users, setUsers] = useState<OAuthUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [roles, setRoles] = useState<RoleProfile[]>([]);
  const [viewMode, setViewMode] = useState<'user' | 'role'>('user');
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<string>('Visitante');
  
  useEffect(() => {
    const defaultFallbackUsers: OAuthUser[] = currentUser ? [
      {
        ...currentUser,
        role: currentUser.role || 'Admin Master',
        permissions: currentUser.permissions || getPermissionsForRole('Admin Master')
      }
    ] : [];

    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      let usersData: OAuthUser[] = [];
      snapshot.forEach((doc) => {
        usersData.push(doc.data() as OAuthUser);
      });
      
      if (usersData.length === 0 && currentUser) {
        usersData = defaultFallbackUsers;
      }
      
      setUsers(usersData);
      
      // Auto-select first user if none selected
      if (usersData.length > 0) {
        setSelectedUserId(prev => {
          if (!prev || !usersData.find(u => u.id === prev)) {
            return usersData[0].id;
          }
          return prev;
        });
      }
    }, (error) => {
      console.error("Firestore onSnapshot error:", error);
      // O banco online não está disponível e/ou não há cache, carregar usuário atual como fallback
      setUsers(defaultFallbackUsers);
      if (defaultFallbackUsers.length > 0) {
        setSelectedUserId(defaultFallbackUsers[0].id);
      }
    });

    const defaultRoles = ['Admin Master', 'Gestor', 'Instrutor', 'Visitante', 'Aluno'].map(r => ({
      id: r,
      name: r,
      permissionsHash: getPermissionsHashForRole(r)
    }));

    const unsubscribeRoles = onSnapshot(collection(db, 'roles'), (snapshot) => {
      const rolesData: RoleProfile[] = [];
      snapshot.forEach(doc => rolesData.push(doc.data() as RoleProfile));
      
      if (rolesData.length === 0) {
        // Fallback local and seed
        setRoles(defaultRoles);
        defaultRoles.forEach(r => {
          setDoc(doc(db, 'roles', r.id), r).catch(() => {});
        });
      } else {
        setRoles(rolesData);
      }
    }, (error) => {
      console.error("Firestore onSnapshot roles error:", error);
      setRoles(defaultRoles);
    });

    return () => { unsubscribe(); unsubscribeRoles(); };
  }, [currentUser]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<OAuthUser | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('Gestor');
  const [formStatus, setFormStatus] = useState<'active' | 'blocked'>('active');
  const [isSaving, setIsSaving] = useState(false);
  const [justCreated, setJustCreated] = useState(false);

  // Role Conflict State
  const [isRoleConflictModalOpen, setIsRoleConflictModalOpen] = useState(false);
  const [pendingUserSaveData, setPendingUserSaveData] = useState<any>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<Array<{
    timestamp: string;
    action: string;
    operator: string;
  }>>([
    { timestamp: '14:25', action: 'Permissões do Simulador DRE editadas para Ana Silva', operator: 'Roberto Alchymist (Admin)' },
    { timestamp: '11:10', action: 'Novo usuário Carlos Oliveira matriculado no sistema', operator: 'Roberto Alchymist (Admin)' },
    { timestamp: 'Ontem', action: 'Autenticação Google OAuth ativada como obrigatória', operator: 'Roberto Alchymist (Admin)' },
  ]);

  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];

  // Filters calculation
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'Todos' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'Todos' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateOrUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      showToast('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (formName.trim().length < 3) {
      showToast('O nome deve conter pelo menos 3 caracteres.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formEmail.trim())) {
      showToast('Por favor, informe um endereço de e-mail válido (ex: usuario@empresa.com).');
      return;
    }

    const normalizedEmail = formEmail.trim().toLowerCase();

    // Check for duplicate email in local state
    const duplicateUser = users.find(u => 
      u.email.toLowerCase() === normalizedEmail && (!editingUser || u.id !== editingUser.id)
    );

    if (duplicateUser) {
      showToast(`Já existe um colaborador cadastrado com o e-mail: ${formEmail}`);
      return;
    }



    try {
      setIsSaving(true);
      if (editingUser) {
        if (formRole !== editingUser.role) {
          // Open conflict modal instead of saving
          setPendingUserSaveData({
            name: formName,
            email: formEmail,
            role: formRole,
            status: formStatus
          });
          setIsRoleConflictModalOpen(true);
          setIsSaving(false);
          return;
        }

        // Edit mode (same role)
        const userRef = doc(db, 'users', editingUser.id);
        
        // Fire and forget - offline persistence will update local snapshot immediately
        setDoc(userRef, { 
          name: formName, 
          email: formEmail, 
          role: formRole, 
          status: formStatus 
        }, { merge: true }).catch(err => console.error("Sync error:", err));

        // Otimismo de UI: atualiza a lista localmente sem depender do retorno do onSnapshot
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, name: formName, email: formEmail, role: formRole, status: formStatus as any } : u));

        setAuditLogs(prev => [
          {
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            action: `Usuário ${formName} atualizado (Perfil: ${formRole}, Status: ${formStatus})`,
            operator: currentUser?.name || 'Admin Master'
          },
          ...prev
        ]);
        showToast(`Usuário ${formName} atualizado com sucesso!`);
      } else {
        // Create mode: Check against existing loaded users list
        const existsLocally = users.some(u => u.email.toLowerCase() === normalizedEmail);
        if (existsLocally) {
          showToast(`Este usuário/e-mail (${formEmail}) já se encontra cadastrado no banco de dados.`);
          setIsSaving(false);
          return;
        }

        const sanitizedDocId = `user_${normalizedEmail.replace(/[^a-z0-9]/gi, '_')}`;
        const userRef = doc(db, 'users', sanitizedDocId);

        const newUser: OAuthUser = {
          id: sanitizedDocId,
          name: formName,
          email: formEmail,
          provider: 'google',
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formName)}`,
          role: formRole,
          authenticatedAt: new Date().toISOString(),
          status: formStatus,
          permissionsHash: roles.find(r => r.name === formRole)?.permissionsHash || getPermissionsHashForRole(formRole),
        };
        
        // Fire and forget - offline persistence will update local snapshot immediately
        setDoc(userRef, newUser).catch(err => console.error("Sync error:", err));
        
        // Otimismo de UI: insere na lista localmente
        setUsers(prev => [...prev, newUser]);
        
        setSelectedUserId(sanitizedDocId);
        setAuditLogs(prev => [
          {
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            action: `Criado novo usuário ${formName} com perfil ${formRole}`,
            operator: currentUser?.name || 'Admin Master'
          },
          ...prev
        ]);
        showToast(`Novo usuário ${formName} criado com sucesso!`);
        setJustCreated(true);
        
        setTimeout(() => {
          setIsModalOpen(false);
          setJustCreated(false);
          setEditingUser(null);
          setFormName('');
          setFormEmail('');
          setFormRole('Gestor');
          setFormStatus('active');
        }, 2500);
        
        return;
      }

      setIsModalOpen(false);
      setEditingUser(null);
      setFormName('');
      setFormEmail('');
    } catch (error: any) {
      console.error("Error saving user:", error);
      showToast(error.message || 'Erro ao salvar usuário. Tente novamente.');
      setIsModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResolveRoleConflict = async (action: 'keep' | 'replace' | 'review') => {
    setIsRoleConflictModalOpen(false);
    if (!pendingUserSaveData || !editingUser) return;

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout: Conexão com Firestore demorou muito.')), 8000)
    );

    try {
      setIsSaving(true);
      const userRef = doc(db, 'users', editingUser.id);
      
      let newPermissions = editingUser.permissions;
      if (action === 'replace' || action === 'review') {
        newPermissions = getPermissionsForRole(pendingUserSaveData.role);
      }

      const updateData = {
        ...pendingUserSaveData,
        permissions: newPermissions
      };

      await Promise.race([
        setDoc(userRef, updateData, { merge: true }),
        timeoutPromise
      ]);

      setAuditLogs(prev => [
        {
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          action: `Usuário ${pendingUserSaveData.name} requalificado (Perfil: ${pendingUserSaveData.role}). Ação de permissões: ${action}`,
          operator: currentUser?.name || 'Admin Master'
        },
        ...prev
      ]);

      if (action === 'review') {
        setSelectedUserId(editingUser.id);
        showToast(`Papel atualizado. Agora você pode revisar as permissões.`);
      } else {
        showToast(`Usuário ${pendingUserSaveData.name} atualizado com sucesso!`);
      }
      
      setIsModalOpen(false);
      setEditingUser(null);
      setPendingUserSaveData(null);
    } catch (error: any) {
      console.error("Error saving user:", error);
      showToast(error.message || 'Erro ao salvar usuário. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenEditUserModal = (user: OAuthUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormStatus(user.status || 'active');
    setIsModalOpen(true);
  };

  const handleOpenCreateUserModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormRole('Gestor');
    setFormStatus('active');
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (user: OAuthUser) => {
    if (user.role === 'Admin Master' && users.filter(u => u.role === 'Admin Master').length === 1) {
      showToast('Não é possível remover o único administrador.');
      return;
    }
    if (confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
      await deleteDoc(doc(db, 'users', user.id));
      
      if (selectedUserId === user.id && users.length > 0) {
        setSelectedUserId(users[0].id);
      }
      setAuditLogs(prev => [
        {
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          action: `Excluído usuário ${user.name}`,
          operator: currentUser?.name || 'Admin Master'
        },
        ...prev
      ]);
      showToast(`Usuário ${user.name} removido.`);
    }
  };

  const handleTogglePermission = async (resourceId: string, action: 'c' | 'r' | 'u' | 'd') => {
    if (viewMode === 'role') {
      const roleObj = roles.find(r => r.name === selectedRoleForPermissions);
      if (!roleObj) return;

      const currentPerms = roleObj.permissionsHash || getPermissionsHashForRole(roleObj.name);
      const permObj = currentPerms[resourceId] || { c: false, r: false, u: false, d: false };
      
      const newPerms = { ...currentPerms, [resourceId]: { ...permObj, [action]: !permObj[action] } };
      
      // Optimistic update
      setRoles(prev => prev.map(r => r.id === roleObj.id ? { ...r, permissionsHash: newPerms } : r));
      
      // Persist to Firebase
      setDoc(doc(db, 'roles', roleObj.id), { permissionsHash: newPerms }, { merge: true }).catch(err => console.error(err));
      
      setAuditLogs(prev => [
        {
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          action: `Permissão ${action.toUpperCase()} para módulo ${resourceId} alterada no Perfil Padrão ${roleObj.name}`,
          operator: currentUser?.name || 'Admin Master'
        },
        ...prev
      ]);
    } else {
      if (!selectedUser) return;
      
      const currentPerms = selectedUser.permissionsHash || getPermissionsHashForRole(selectedUser.role);
      const permObj = currentPerms[resourceId] || { c: false, r: false, u: false, d: false };
      
      const newPerms = { ...currentPerms, [resourceId]: { ...permObj, [action]: !permObj[action] } };

      // Optimistic update
      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, permissionsHash: newPerms } : u));
      
      // Persist
      const userRef = doc(db, 'users', selectedUser.id);
      await setDoc(userRef, { permissionsHash: newPerms }, { merge: true });

      // Log the change
      const resource = RESOURCES.find(r => r.id === resourceId);
      setAuditLogs(prev => [
        {
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          action: `Permissão ${action.toUpperCase()} para ${resource?.name} alterada para ${selectedUser.name}`,
          operator: currentUser?.name || 'Admin Master'
        },
        ...prev
      ]);
    }
  };

  const handleToggleAllPermissions = async (resourceId: string) => {
    if (viewMode === 'role') {
      const roleObj = roles.find(r => r.name === selectedRoleForPermissions);
      if (!roleObj) return;

      const currentPerms = roleObj.permissionsHash || getPermissionsHashForRole(roleObj.name);
      const permObj = currentPerms[resourceId] || { c: false, r: false, u: false, d: false };
      const allTrue = permObj.c && permObj.r && permObj.u && permObj.d;
      
      const newPerms = { 
        ...currentPerms, 
        [resourceId]: { c: !allTrue, r: !allTrue, u: !allTrue, d: !allTrue } 
      };
      
      setRoles(prev => prev.map(r => r.id === roleObj.id ? { ...r, permissionsHash: newPerms } : r));
      setDoc(doc(db, 'roles', roleObj.id), { permissionsHash: newPerms }, { merge: true }).catch(err => console.error(err));
    } else {
      if (!selectedUser) return;

      const currentPerms = selectedUser.permissionsHash || getPermissionsHashForRole(selectedUser.role);
      const permObj = currentPerms[resourceId] || { c: false, r: false, u: false, d: false };
      const allTrue = permObj.c && permObj.r && permObj.u && permObj.d;

      const newPerms = { 
        ...currentPerms, 
        [resourceId]: { c: !allTrue, r: !allTrue, u: !allTrue, d: !allTrue } 
      };

      setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, permissionsHash: newPerms } : u));
      
      const userRef = doc(db, 'users', selectedUser.id);
      await setDoc(userRef, { permissionsHash: newPerms }, { merge: true });
    }
  };

  const duplicatesCount = users.filter((u, index, self) => 
    self.findIndex(t => t.email.toLowerCase() === u.email.toLowerCase()) !== index
  ).length;

  const handleCleanDuplicates = async () => {
    const seen = new Set<string>();
    const duplicatesToRemove: string[] = [];

    for (const u of users) {
      const normalized = u.email.toLowerCase();
      if (seen.has(normalized)) {
        duplicatesToRemove.push(u.id);
      } else {
        seen.add(normalized);
      }
    }

    if (duplicatesToRemove.length === 0) {
      showToast('Nenhum registro duplicado encontrado.');
      return;
    }

    try {
      for (const id of duplicatesToRemove) {
        await deleteDoc(doc(db, 'users', id));
      }
      showToast(`${duplicatesToRemove.length} registro(s) duplicado(s) removido(s) com sucesso!`);
    } catch (err) {
      showToast('Erro ao remover registros duplicados.');
    }
  };

  return (
    <div className="bg-white rounded-md p-6 border border-slate-200 space-y-6 shadow-2xs">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold py-2.5 px-4 rounded-md shadow-lg border border-slate-700 flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-[#1890ff]" />
          <span>{toast}</span>
        </div>
      )}

      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200 text-[#1890ff] text-[10px] font-black uppercase tracking-wider mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Painel Administrativo de Segurança</span>
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">Gestão de Usuários & Controle de Acessos</h2>
          <p className="text-xs text-slate-500">
            Gerencie os usuários do sistema e atribua permissões granulares de CRUD para cada UI e Relatório.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {duplicatesCount > 0 && (
            <button
              onClick={handleCleanDuplicates}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded font-bold text-xs uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              title="Clique para remover cadastros com e-mails idênticos"
            >
              <Trash2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Limpar {duplicatesCount} Duplicado(s)</span>
            </button>
          )}

          {isSimulated ? (
            <button
              onClick={onRestoreAdmin}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded font-bold text-xs uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Admin Geral</span>
            </button>
          ) : (
            <button
              onClick={handleOpenCreateUserModal}
              className="px-4 py-2 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded font-bold text-xs uppercase transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Usuário</span>
            </button>
          )}
        </div>
      </div>

      {isSimulated && (
        <div className="p-3.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2 shadow-2xs">
          <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0" />
          <span>
            Sessão ativa de simulação de permissão: <strong>{currentUser?.name} ({currentUser?.role})</strong>.
            Tudo o que você visualiza agora respeita as regras definidas na grade abaixo.
          </span>
        </div>
      )}

      {/* Main Content Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Users List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-md p-4 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Lista de Colaboradores</h3>
            
            {/* Search & Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar por nome ou e-mail..."
                  className="w-full bg-white border border-slate-200 rounded pl-8 pr-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] cursor-pointer font-medium"
                >
                  <option value="Todos">Todos os Perfis</option>
                  <option value="Admin Master">Admin Master</option>
                  <option value="Instrutor">Instrutor</option>
                  <option value="Gestor">Gestor</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] cursor-pointer font-medium"
                >
                  <option value="Todos">Todos os Status</option>
                  <option value="active">Ativo</option>
                  <option value="blocked">Bloqueado</option>
                </select>
              </div>
            </div>

            {/* Users List Cards */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {filteredUsers.map((user) => {
                const isSelected = user.id === selectedUserId;
                const isUserSimulated = currentUser?.id === user.id;

                return (
                  <div
                    key={user.id}
                    onClick={() => { setSelectedUserId(user.id); setViewMode('user'); }}
                    className={`p-3 rounded border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected 
                        ? 'bg-[#1890ff]/5 border-[#1890ff] ring-1 ring-[#1890ff]/10' 
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-md border border-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900 truncate block">{user.name}</span>
                          {isUserSimulated && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[8px] font-bold uppercase shrink-0">
                              Simulado
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium truncate block">{user.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                        user.role === 'Admin Master' 
                          ? 'bg-purple-50 text-purple-800 border-purple-200' 
                          : user.role === 'Instrutor'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}>
                        {user.role}
                      </span>
                      
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenEditUserModal(user)}
                          className="p-1 hover:bg-slate-100 text-slate-500 rounded transition-colors"
                          title="Editar perfil"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors"
                          title="Excluir usuário"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredUsers.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs font-medium bg-white rounded border border-slate-100">
                  Nenhum usuário encontrado com os filtros aplicados.
                </div>
              )}
            </div>
          </div>

          {/* Audit Log Box */}
          <div className="border border-slate-200 rounded-md p-4 space-y-3">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1890ff]" />
              <span>Logs de Auditoria de Acessos</span>
            </h4>
            <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
              {auditLogs.map((log, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-100 text-[10px] space-y-1">
                  <div className="flex items-center justify-between text-slate-400 font-mono">
                    <span>{log.timestamp}</span>
                    <span>Operador: {log.operator}</span>
                  </div>
                  <p className="text-slate-700 font-semibold">{log.action}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Dynamic ACL Matrix Grid */}
        <div className="lg:col-span-7">
          <div className="border border-slate-200 rounded-md p-5 space-y-4">
            
            {/* View Mode Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50 p-4 rounded-md border border-slate-100 mb-2">
              <div className="flex-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">Exibir Permissões de:</label>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as 'user' | 'role')}
                  className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#1890ff] cursor-pointer"
                >
                  <option value="user">Usuário Específico (Selecionado ao lado)</option>
                  <option value="role">Padrão por Perfil (Editável)</option>
                </select>
              </div>

              {viewMode === 'role' && (
                <div className="flex-1 animate-fadeIn">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-1.5 block">Selecione o Perfil:</label>
                  <select
                    value={selectedRoleForPermissions}
                    onChange={(e) => setSelectedRoleForPermissions(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#1890ff] cursor-pointer"
                  >
                    <option value="Visitante">Visitante</option>
                    <option value="Instrutor">Instrutor</option>
                    <option value="Gestor">Gestor</option>
                    <option value="Admin Master">Admin Master</option>
                  </select>
                </div>
              )}
            </div>

            {/* Header info user selected */}
            {viewMode === 'user' ? (
              selectedUser ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="w-10 h-10 rounded-md border border-slate-200"
                    />
                    <div>
                      <h3 className="text-sm font-black text-slate-900">{selectedUser.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">Define permissões de CRUD exclusivas para este usuário</p>
                    </div>
                  </div>

                  <button
                      onClick={() => {
                        onSimulateLogin(selectedUser);
                        showToast(`Sessão alternada para ${selectedUser.name}.`);
                      }}
                      className="px-3 py-1.5 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded font-bold text-xs uppercase transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Simular Login</span>
                    </button>
                </div>
              ) : (
                <div className="text-sm text-slate-500 pb-3 border-b border-slate-100">Selecione um usuário para gerenciar permissões exclusivas.</div>
              )
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-md border border-slate-200 bg-[#1890ff]/10 flex items-center justify-center text-[#1890ff]">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Perfil Padrão: {selectedRoleForPermissions}</h3>
                    <p className="text-xs text-slate-500 font-medium">Permissões de referência padrão para novos usuários deste cargo</p>
                  </div>
                </div>
              </div>
            )}

            {/* Matrix Table */}
            {(viewMode === 'role' || (viewMode === 'user' && selectedUser)) && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-black tracking-wider uppercase text-[10px]">
                    <th className="py-2.5 pr-4">Módulos & Relatórios</th>
                    <th className="py-2.5 text-center w-12">C (Criar)</th>
                    <th className="py-2.5 text-center w-12">R (Ler)</th>
                    <th className="py-2.5 text-center w-12">U (Editar)</th>
                    <th className="py-2.5 text-center w-12">D (Excluir)</th>
                    <th className="py-2.5 text-center w-16">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {RESOURCES.map((res) => {
                    let permObj = { c: false, r: false, u: false, d: false };
                    if (viewMode === 'role') {
                      const roleObj = roles.find(r => r.name === selectedRoleForPermissions);
                      const currentPerms = roleObj ? roleObj.permissionsHash : getPermissionsHashForRole(selectedRoleForPermissions);
                      permObj = currentPerms[res.id] || permObj;
                    } else {
                      const currentPerms = selectedUser!.permissionsHash || getPermissionsHashForRole(selectedUser!.role);
                      permObj = currentPerms[res.id] || permObj;
                    }

                    const isAllChecked = permObj.c && permObj.r && permObj.u && permObj.d;

                    return (
                      <tr key={res.id} className="hover:bg-slate-50/50">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-md ${res.type === 'ui' ? 'bg-[#1890ff]' : 'bg-emerald-500'}`} />
                            <div>
                              <span className="font-bold text-slate-800 block">{res.name}</span>
                              <span className="text-[9px] text-slate-400 font-mono font-bold uppercase">{res.type === 'ui' ? 'Interface UI' : 'Relatório'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 text-center">
                          <input
                            type="checkbox"
                            checked={permObj.c}
                            onChange={() => handleTogglePermission(res.id, 'c')}
                            className="w-4 h-4 rounded border-slate-300 text-[#1890ff] focus:ring-[#1890ff] cursor-pointer"
                          />
                        </td>

                        <td className="py-3 text-center">
                          <input
                            type="checkbox"
                            checked={permObj.r}
                            onChange={() => handleTogglePermission(res.id, 'r')}
                            className="w-4 h-4 rounded border-slate-300 text-[#1890ff] focus:ring-[#1890ff] cursor-pointer"
                          />
                        </td>

                        <td className="py-3 text-center">
                          <input
                            type="checkbox"
                            checked={permObj.u}
                            onChange={() => handleTogglePermission(res.id, 'u')}
                            className="w-4 h-4 rounded border-slate-300 text-[#1890ff] focus:ring-[#1890ff] cursor-pointer"
                          />
                        </td>

                        <td className="py-3 text-center">
                          <input
                            type="checkbox"
                            checked={permObj.d}
                            onChange={() => handleTogglePermission(res.id, 'd')}
                            className="w-4 h-4 rounded border-slate-300 text-[#1890ff] focus:ring-[#1890ff] cursor-pointer"
                          />
                        </td>

                        <td className="py-3 text-center">
                          <button
                            onClick={() => handleToggleAllPermissions(res.id)}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded border transition-all cursor-pointer ${
                              isAllChecked 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {isAllChecked ? 'Tudo' : 'Nenhum'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            )}

            {selectedUser?.role === 'Admin Master' && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded text-purple-900 text-xs font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                <span>O Admin Master Geral do sistema possui privilégios de acesso completos e permanentes para todos os recursos (algumas verificações ignoram as restrições abaixo dependendo da regra).</span>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* User Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#070b14]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md p-6 max-w-sm w-full text-slate-800 shadow-lg relative animate-scaleUp">
            {justCreated ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Usuário Cadastrado!</h3>
                <p className="text-xs text-slate-600">
                  <strong>{formName}</strong> foi criado com perfil <strong>{formRole}</strong>.
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Esta janela fechará automaticamente...</p>
              </div>
            ) : (
              <>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário do Sistema'}
                </h3>

            <form onSubmit={handleCreateOrUpdateUser} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">E-mail</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="Ex: joao@empresa.com.br"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Cargo / Perfil</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] cursor-pointer font-medium"
                  >
                    <option value="Visitante">Visitante</option>
                    <option value="Aluno">Aluno</option>
                    <option value="Instrutor">Instrutor</option>
                    <option value="Gestor">Gestor</option>
                    <option value="Admin Master">Admin Master</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Status da Conta</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#1890ff] cursor-pointer font-medium"
                  >
                    <option value="active">Ativo</option>
                    <option value="blocked">Bloqueado</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-xs uppercase transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded font-bold text-xs uppercase transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
            </>
            )}
          </div>
        </div>
      )}

      {/* Role Conflict Modal */}
      {isRoleConflictModalOpen && pendingUserSaveData && (
        <div className="fixed inset-0 bg-[#070b14]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-md p-6 max-w-lg w-full text-slate-800 shadow-lg relative animate-scaleUp">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-md bg-amber-100 flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Novas Permissões de Acesso
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Você alterou o perfil de <strong>{pendingUserSaveData.name}</strong> para <strong>{pendingUserSaveData.role}</strong>. Esse perfil possui um conjunto padrão de autorizações.
                <br /><br />
                O que você deseja fazer com as permissões atuais do usuário?
              </p>
              
              <div className="grid grid-cols-1 gap-3 pt-4">
                <button
                  onClick={() => handleResolveRoleConflict('replace')}
                  disabled={isSaving}
                  className="w-full py-3 bg-[#1890ff] hover:bg-[#096dd9] text-white rounded font-bold text-xs uppercase transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Receber Novas (Padrão do Papel)
                </button>
                <button
                  onClick={() => handleResolveRoleConflict('keep')}
                  disabled={isSaving}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-bold text-xs uppercase transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4 text-slate-500" />
                  Manter Atuais
                </button>
                <button
                  onClick={() => handleResolveRoleConflict('review')}
                  disabled={isSaving}
                  className="w-full py-3 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 rounded font-bold text-xs uppercase transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Sliders className="w-4 h-4" />
                  Revisar Manualmente
                </button>
                <button
                  onClick={() => {
                    setIsRoleConflictModalOpen(false);
                    setPendingUserSaveData(null);
                    setIsSaving(false);
                  }}
                  disabled={isSaving}
                  className="w-full py-2 bg-transparent text-slate-500 hover:text-slate-700 underline text-xs transition-colors cursor-pointer disabled:opacity-50 mt-2"
                >
                  Cancelar Edição
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
