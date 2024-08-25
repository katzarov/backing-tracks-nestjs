import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthResult, auth } from 'express-oauth2-jwt-bearer';
import { promisify } from 'util';
import { UserRepository } from '@app/database/repositories';
import { User } from '@app/database/entities';

@Injectable()
export class AuthGuard implements CanActivate {
  private audience: string;
  private issuerBaseURL: string;

  constructor(
    private configService: ConfigService,
    private userRepository: UserRepository,
  ) {
    this.audience = this.configService.getOrThrow<string>('auth.audience');
    const domain = this.configService.getOrThrow<string>('auth.domain');
    this.issuerBaseURL = `https://${domain}/`;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    // express-oauth2-jwt-bearer is only made to work as an express middleware, so the auth function is actually an Express Handler, so I need to work around it a bit.
    // since the Nestjs way to do authorization is to have a guard and not middleware.
    const checkJwt = promisify(
      auth({
        audience: this.audience,
        issuerBaseURL: this.issuerBaseURL,
        tokenSigningAlg: 'RS256',
      }),
    );

    try {
      // assigns auth object to req
      await checkJwt(req, res);

      const { auth } = req as { auth: AuthResult };
      const auth0Id = auth.payload.sub;

      let user: User | null;
      user = await this.userRepository.findOneByAuth0Id(auth0Id);

      if (user === null) {
        user = await this.userRepository.saveOneWithAuth0Id(auth0Id);
      }

      req.user = { id: user.id };

      return true;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException();
    }
  }
}
