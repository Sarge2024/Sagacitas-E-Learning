import { Request, Response, NextFunction } from 'express';

/**
 * Middleware global de tratamento de erros para Express.
 * 
 * Captura qualquer erro não tratado nos controllers e retorna
 * uma resposta JSON padronizada com status HTTP apropriado.
 * 
 * Uso:
 *   // Registrar APÓS todas as rotas
 *   app.use(errorHandler);
 */

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log do erro no servidor (não expor stack trace ao cliente)
  console.error(`[Sagacitas Error Handler] ${err.code || 'INTERNAL_ERROR'}:`, err.message);

  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';

  // Mapeamento de status para mensagens amigáveis
  const friendlyMessages: Record<number, string> = {
    400: 'Requisição inválida. Verifique os parâmetros enviados.',
    401: 'Autenticação necessária. Por favor, faça login novamente.',
    403: 'Acesso negado. Você não tem permissão para esta ação.',
    404: 'Recurso não encontrado.',
    409: 'Conflito. O recurso já existe ou está em uso.',
    429: 'Muitas requisições. Por favor, aguarde antes de tentar novamente.',
    500: 'Erro interno do servidor. Nossa equipe foi notificada.',
  };

  res.status(statusCode).json({
    error: errorCode,
    message: friendlyMessages[statusCode] || err.message || 'Erro desconhecido.',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

/**
 * Wrapper para async route handlers do Express.
 * Captura rejeições de Promise e as encaminha ao errorHandler.
 * 
 * Uso:
 *   app.post('/api/endpoint', asyncHandler(async (req, res) => { ... }));
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
