import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de autenticação e autorização para Express.
 * 
 * Estratégia progressiva:
 * - Inicialmente valida tokens Firebase JWT de forma simplificada
 *   (verificação de formato e expiração, sem firebase-admin SDK)
 * - Futuramente, pode-se ativar validação completa com firebase-admin
 * 
 * O middleware extrai: uid, email, role e tenant_id do token decodificado.
 */

// Tipos de role do RBAC do Sagacitas
type UserRole = 'Visitante' | 'Aluno' | 'Instrutor' | 'Gestor' | 'Administrador';

// Interface para dados extraídos do token
export interface AuthenticatedRequest extends Request {
  auth?: {
    uid: string;
    email: string;
    role: UserRole;
    tenantId: string;
  };
}

/**
 * Decodifica um JWT Firebase de forma simplificada (sem firebase-admin).
 * NOTA: Em produção, use firebase-admin.auth().verifyIdToken(token)
 * para verificação criptográfica completa.
 */
function decodeFirebaseJWT(token: string): { uid: string; email: string; exp: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
    
    return {
      uid: payload.sub || payload.user_id || '',
      email: payload.email || '',
      exp: payload.exp || 0,
    };
  } catch {
    return null;
  }
}

/**
 * authGuard — Middleware de autenticação JWT.
 * 
 * Uso:
 *   app.post('/api/protected', authGuard, handler);
 * 
 * Ou com restrição de role:
 *   app.post('/api/admin-only', authGuard, requireRole('Administrador'), handler);
 */
export function authGuard(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Token de autenticação não fornecido. Use o header Authorization: Bearer <token>'
    });
    return;
  }

  const token = authHeader.substring(7); // Remove "Bearer "
  const decoded = decodeFirebaseJWT(token);

  if (!decoded || !decoded.uid) {
    res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Token JWT inválido ou malformado.'
    });
    return;
  }

  // Verificar expiração
  const now = Math.floor(Date.now() / 1000);
  if (decoded.exp && decoded.exp < now) {
    res.status(401).json({ 
      error: 'TokenExpired',
      message: 'Token expirado. Por favor, realize o login novamente.'
    });
    return;
  }

  // Injetar dados autenticados no request
  req.auth = {
    uid: decoded.uid,
    email: decoded.email,
    role: 'Visitante', // Default — em produção, resolver via Firestore/Supabase lookup
    tenantId: (req.headers['x-tenant-id'] as string) || '00000000-0000-0000-0000-000000000001',
  };

  next();
}

/**
 * requireRole — Middleware de autorização por role (RBAC).
 * 
 * Uso:
 *   app.post('/api/admin', authGuard, requireRole('Administrador', 'Gestor'), handler);
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Autenticação necessária antes da verificação de permissões.'
      });
      return;
    }

    if (!allowedRoles.includes(req.auth.role)) {
      res.status(403).json({ 
        error: 'Forbidden',
        message: `Acesso negado. Requer uma das roles: ${allowedRoles.join(', ')}. Role atual: ${req.auth.role}`
      });
      return;
    }

    next();
  };
}
