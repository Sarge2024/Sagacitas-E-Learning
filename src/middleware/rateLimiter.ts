import { Request, Response, NextFunction } from 'express';

/**
 * Rate Limiter in-memory com sliding window.
 * 
 * Sem dependência externa (Redis). Para produção Multi-Tenant
 * de alta escala, substituir por Redis com chave composta (IP + tenant_id).
 * 
 * Configuração padrão: 30 requisições por minuto por IP.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// Store in-memory das contagens por IP
const store = new Map<string, RateLimitEntry>();

// Limpeza periódica para evitar vazamento de memória (a cada 5 minutos)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimiterOptions {
  /** Número máximo de requisições no intervalo. Default: 30 */
  maxRequests?: number;
  /** Intervalo da janela em milissegundos. Default: 60000 (1 minuto) */
  windowMs?: number;
}

/**
 * createRateLimiter — Cria um middleware Express de rate limiting.
 * 
 * Uso:
 *   app.use('/api', createRateLimiter({ maxRequests: 20, windowMs: 60000 }));
 * 
 * Ou com valores padrão:
 *   app.use('/api', createRateLimiter());
 */
export function createRateLimiter(options: RateLimiterOptions = {}) {
  const maxRequests = options.maxRequests ?? 30;
  const windowMs = options.windowMs ?? 60_000;

  return (req: Request, res: Response, next: NextFunction): void => {
    // Usar IP como chave (X-Forwarded-For para proxies, ou IP direto)
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() 
      || req.socket.remoteAddress 
      || 'unknown';
    
    const key = `rl:${clientIp}`;
    const now = Date.now();

    let entry = store.get(key);

    // Se não existe ou a janela expirou, criar nova entrada
    if (!entry || entry.resetAt < now) {
      entry = { count: 1, resetAt: now + windowMs };
      store.set(key, entry);
      
      // Injetar headers informativos
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000));
      
      next();
      return;
    }

    // Incrementar contador
    entry.count++;

    // Verificar se excedeu o limite
    if (entry.count > maxRequests) {
      const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
      
      res.setHeader('Retry-After', retryAfterSec);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000));
      
      res.status(429).json({
        error: 'TooManyRequests',
        message: `Limite de ${maxRequests} requisições por minuto excedido. Tente novamente em ${retryAfterSec}s.`,
        retryAfter: retryAfterSec,
      });
      return;
    }

    // Dentro do limite
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - entry.count);
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000));
    
    next();
  };
}
