import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Users, UserPlus, UserMinus, X } from 'lucide-react';
import { dbService } from '../services/dbService';
import type { CompanyRecord, OAuthUser } from '../types';

export const CompaniesManagerView: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyRecord | null>(null);
  const [companyUsers, setCompanyUsers] = useState<OAuthUser[]>([]);
  const [independentUsers, setIndependentUsers] = useState<OAuthUser[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals state
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isAssociateModalOpen, setIsAssociateModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyRecord | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', cnpj: '', domain: '', active: true });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await dbService.getCompanies();
      setCompanies(data);
    } catch (err: any) {
      console.warn("Falha ao buscar empresas, usando estado local", err);
      // Mantém as empresas atuais em caso de falha (pode estar vazio inicialmente)
      // setError(err.message || 'Erro ao carregar empresas');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyUsers = async (companyId: string) => {
    try {
      const data = await dbService.getUsersByCompany(companyId);
      setCompanyUsers(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchIndependentUsers = async () => {
    try {
      const data = await dbService.getIndependentUsers();
      setIndependentUsers(data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      fetchCompanyUsers(selectedCompany.id);
    } else {
      setCompanyUsers([]);
    }
  }, [selectedCompany]);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        const updated = await dbService.updateCompany(editingCompany.id, formData);
        setCompanies(prev => prev.map(c => c.id === editingCompany.id ? updated : c));
        if (selectedCompany?.id === editingCompany.id) {
          setSelectedCompany(updated);
        }
      } else {
        const created = await dbService.createCompany(formData);
        setCompanies(prev => [...prev, created]);
      }
      setIsCompanyModalOpen(false);
      setEditingCompany(null);
      setFormData({ name: '', cnpj: '', domain: '', active: true });
    } catch (err: any) {
      console.error("Erro ao salvar empresa no banco:", err);
      window.alert(`🚨 Erro ao salvar empresa no banco de dados:\n${err.message || JSON.stringify(err)}`);
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta empresa? Todos os usuários ficarão independentes.')) return;
    try {
      await dbService.deleteCompany(id);
      setCompanies(prev => prev.filter(c => c.id !== id));
      if (selectedCompany?.id === id) {
        setSelectedCompany(null);
      }
    } catch (err: any) {
      console.error("Erro ao excluir empresa no banco:", err);
      window.alert(`🚨 Erro ao excluir empresa no banco de dados:\n${err.message || JSON.stringify(err)}`);
    }
  };

  const handleAssociateUser = async (userId: string) => {
    if (!selectedCompany) return;
    try {
      await dbService.associateUserWithCompany(userId, selectedCompany.id);
      // Remove from independent list and add to company users list
      const userToMove = independentUsers.find(u => u.id === userId);
      if (userToMove) {
        setIndependentUsers(prev => prev.filter(u => u.id !== userId));
        setCompanyUsers(prev => [...prev, { ...userToMove, company_id: selectedCompany.id }]);
      }
    } catch (err: any) {
      console.error("Erro ao associar usuário no banco:", err);
      window.alert(`🚨 Erro ao associar usuário no banco de dados:\n${err.message || JSON.stringify(err)}`);
    }
  };

  const handleDisassociateUser = async (userId: string) => {
    try {
      await dbService.associateUserWithCompany(userId, null);
      // Remove from company users list
      setCompanyUsers(prev => prev.filter(u => u.id !== userId));
      // Optionally refresh independent users if modal is open, or just leave it
    } catch (err: any) {
      console.error("Erro ao desassociar usuário no banco:", err);
      window.alert(`🚨 Erro ao desassociar usuário no banco de dados:\n${err.message || JSON.stringify(err)}`);
    }
  };

  const openAssociateModal = () => {
    fetchIndependentUsers();
    setIsAssociateModalOpen(true);
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.cnpj && c.cnpj.includes(searchTerm))
  );

  return (
    <div className="flex h-full gap-6">
      {/* Esquerda: Lista de Empresas */}
      <div className="w-1/2 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Empresas</h2>
            <p className="text-sm text-gray-500">Gerencie as contas corporativas do tenant</p>
          </div>
          <button
            onClick={() => {
              setEditingCompany(null);
              setFormData({ name: '', cnpj: '', domain: '', active: true });
              setIsCompanyModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#F15A24] text-white rounded-lg hover:bg-[#D94A1A] transition-colors shadow-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nova Empresa
          </button>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F15A24] focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-10 text-gray-500">Carregando empresas...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Nenhuma empresa encontrada.</div>
          ) : (
            filteredCompanies.map(company => (
              <div 
                key={company.id}
                onClick={() => setSelectedCompany(company)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedCompany?.id === company.id 
                    ? 'border-[#F15A24] bg-orange-50/50 shadow-sm' 
                    : 'border-gray-200 hover:border-[#F15A24]/50 hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                      {company.name}
                      {!company.active && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Inativo</span>
                      )}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1 flex gap-4">
                      {company.cnpj && <span>CNPJ: {company.cnpj}</span>}
                      {company.domain && <span>Domínio: {company.domain}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCompany(company);
                        setFormData({
                          name: company.name,
                          cnpj: company.cnpj || '',
                          domain: company.domain || '',
                          active: company.active
                        });
                        setIsCompanyModalOpen(true);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar Empresa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCompany(company.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir Empresa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Direita: Usuários da Empresa Selecionada */}
      <div className="w-1/2 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {selectedCompany ? (
          <>
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  Usuários Associados
                </h2>
                <p className="text-sm text-gray-500 mt-1">Empresa: <strong>{selectedCompany.name}</strong></p>
              </div>
              <button
                onClick={openAssociateModal}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm font-medium"
              >
                <UserPlus className="w-4 h-4" />
                Vincular Usuário
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {companyUsers.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800">Nenhum usuário vinculado</h3>
                  <p className="text-gray-500 mt-1">Vincule usuários independentes a esta empresa.</p>
                </div>
              ) : (
                companyUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                          {user.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600">
                        {user.role}
                      </span>
                      <button
                        onClick={() => handleDisassociateUser(user.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover vínculo"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500 bg-gray-50/50">
            <Users className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-800 mb-2">Selecione uma Empresa</h3>
            <p className="max-w-xs">Clique em uma empresa na lista ao lado para gerenciar seus usuários associados.</p>
          </div>
        )}
      </div>

      {/* Modal: Adicionar/Editar Empresa */}
      {isCompanyModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
              </h2>
              <button 
                onClick={() => setIsCompanyModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveCompany} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-[#F15A24] focus:border-transparent transition-all"
                    placeholder="Ex: Sagacitas Ltda"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-[#F15A24] focus:border-transparent transition-all"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domínio</label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({...formData, domain: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-[#F15A24] focus:border-transparent transition-all"
                    placeholder="exemplo.com.br"
                  />
                  <p className="text-xs text-gray-500 mt-1">Domínio de e-mail para auto-associação (opcional)</p>
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="company-active"
                    checked={formData.active}
                    onChange={(e) => setFormData({...formData, active: e.target.checked})}
                    className="w-4 h-4 text-[#F15A24] rounded border-gray-300 focus:ring-[#F15A24]"
                  />
                  <label htmlFor="company-active" className="text-sm text-gray-700 font-medium">Empresa Ativa</label>
                </div>
              </div>
              
              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCompanyModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#F15A24] text-white rounded-lg hover:bg-[#D94A1A] font-medium transition-colors shadow-sm"
                >
                  {editingCompany ? 'Salvar Alterações' : 'Criar Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Vincular Usuário Independente */}
      {isAssociateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Vincular Usuários</h2>
                <p className="text-sm text-gray-500">Selecione usuários independentes para vincular a <strong>{selectedCompany?.name}</strong></p>
              </div>
              <button 
                onClick={() => setIsAssociateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {independentUsers.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">Não há usuários independentes disponíveis no momento.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {independentUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold shrink-0">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">{user.name}</div>
                          <div className="text-xs text-gray-500 truncate">{user.email}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAssociateUser(user.id)}
                        className="ml-2 px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-xs font-medium shrink-0"
                      >
                        Vincular
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
              <button
                onClick={() => setIsAssociateModalOpen(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
