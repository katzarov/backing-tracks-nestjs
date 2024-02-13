import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { auth } from 'express-oauth2-jwt-bearer';
import { promisify } from 'util';

@Injectable()
export class AuthGuard implements CanActivate {
  private audience: string;
  private issuerBaseURL: string;

  constructor(private configService: ConfigService) {
    this.audience = this.configService.getOrThrow('auth.audience');
    const domain = this.configService.getOrThrow('auth.domain');
    this.issuerBaseURL = `https://${domain}/`;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    // express-oauth2-jwt-bearer is only made to work as an express middleware, so the auth function is actually an Express Handler, so I need to work around it a bit.
    // since the Nestjs way to do authorization is to have a guard and not middleware.. hopefully Auth0 thinks about supporting nest better.
    const checkJwt = promisify(
      auth({
        audience: this.audience,
        issuerBaseURL: this.issuerBaseURL,
        tokenSigningAlg: 'RS256',
      }),
    );

    try {
      await checkJwt(req, res);
      console.log(req.auth.payload.sub);
      // req.userId = req.auth.payload.sub;

      return true;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException();
    }
  }
}
