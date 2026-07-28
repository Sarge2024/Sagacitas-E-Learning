import { supabase, getCurrentTenantId } from '../lib/supabaseClient';

export const uploadService = {
  /**
   * Faz upload de um arquivo para a bucket `media` no Supabase Storage.
   * Retorna a URL pública do arquivo enviado.
   * 
   * @param file O arquivo a ser enviado (geralmente vindo de um input type="file" ou clipboard)
   * @param prefix Opcional. Um subdiretório para organizar melhor (ex: 'learning-objects')
   * @returns URL pública da imagem persistida
   */
  async uploadFile(file: File, prefix: string = 'media'): Promise<string> {
    console.log('[uploadService] Iniciando upload para o Supabase...', file.name, file.size, file.type);
    const tenantId = getCurrentTenantId() || 'public';
    // Gerar um nome único para evitar colisões
    const fileExt = file.name.split('.').pop() || 'png';
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${tenantId}/${prefix}/${uniqueFileName}`;

    console.log('[uploadService] Path gerado:', filePath);

    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('[uploadService] Erro no upload via Supabase:', error);
      throw error;
    }

    console.log('[uploadService] Upload concluído, gerando URL pública...', data);

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('media')
      .getPublicUrl(data.path);

    console.log('[uploadService] URL gerada:', publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  },

  /**
   * Exclui um arquivo da bucket `media` usando sua URL pública.
   * @param publicUrl A URL pública do arquivo a ser excluído
   */
  async deleteFile(publicUrl: string): Promise<void> {
    try {
      if (!publicUrl || !publicUrl.includes('supabase.co')) return;
      
      const urlParts = publicUrl.split('/media/');
      if (urlParts.length < 2) return;
      
      const filePath = urlParts[1];
      
      const { error } = await supabase.storage
        .from('media')
        .remove([filePath]);
        
      if (error) {
        console.error('[uploadService] Erro ao excluir arquivo:', error);
      } else {
        console.log('[uploadService] Arquivo excluído com sucesso:', filePath);
      }
    } catch (e) {
      console.error('[uploadService] Falha na exclusão do arquivo', e);
    }
  }
};
