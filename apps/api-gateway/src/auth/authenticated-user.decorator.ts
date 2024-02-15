import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// import { AuthResult } from 'express-oauth2-jwt-bearer';

export const AuthenticatedUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user.id;
  },
);
