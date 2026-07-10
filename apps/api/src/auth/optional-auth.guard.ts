import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { jwtConstants } from './constants';
import { JwtPayload } from './jwt-payload.interface';

// Igual ao AuthGuard, mas nunca bloqueia a requisição: se houver um Bearer
// token válido, popula request['user']; caso contrário (ausente ou
// inválido) a rota segue como anônima. Usado nas rotas públicas do feed que
// precisam saber "o usuário atual curtiu este post?" sem exigir login.
@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (token) {
      try {
        const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
          secret: jwtConstants.secret,
        });
        request['user'] = payload;
      } catch {
        // Token ausente/inválido/expirado: segue anônimo.
      }
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
