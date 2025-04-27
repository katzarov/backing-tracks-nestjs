import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthResult, auth } from 'express-oauth2-jwt-bearer';
import { promisify } from 'util';
import { UserRepository } from '@app/database/repositories';
import { User } from '@app/database/entities';
import { z, ZodType, ZodError } from 'zod';

@Injectable()
export class AuthGuard implements CanActivate {
  private audience: string;
  private issuerBaseURL: string;
  private readonly logger = new Logger(AuthGuard.name);

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

      // TODO-validation does the lib already validate the shape of the token ?

      const jwtSchema = z.object({
        auth: z.object({ payload: z.object({ sub: z.string() }) }),
      }) satisfies ZodType<{ auth: Omit<AuthResult, 'token' | 'header'> }>; // https://github.com/colinhacks/zod/issues/2807

      const parsedJwt = jwtSchema.parse(req);

      const {
        auth: {
          payload: { sub: auth0Id },
        },
      } = parsedJwt;

      let user: User | null;
      user = await this.userRepository.findOneByAuth0Id(auth0Id);

      if (user === null) {
        user = await this.userRepository.saveOneWithAuth0Id(auth0Id);
      }

      req.user = { id: user.id };

      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        // https://github.com/colinhacks/zod/discussions/2415 ?
        this.logger.error(error);
        throw new UnauthorizedException();
      }
      // TODO we could potentially miss logging real crititcal errors as logger.error ..
      // there are some cool tricks to get more control when using try catch in a nested way.. that involves not really using try catch direclty but more like err as return value instead of throwing.. so like a simple wrapper around try catch
      this.logger.log(error);
      throw new UnauthorizedException();
    }
  }
}
