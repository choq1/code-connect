import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { JwtPayload } from './jwt-payload.interface';

// Lê o usuário populado pelo AuthGuard/OptionalAuthGuard em request['user'].
// Com OptionalAuthGuard pode ser undefined (rota pública sem token).
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): JwtPayload | undefined => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request['user'] as JwtPayload | undefined;
  },
);
