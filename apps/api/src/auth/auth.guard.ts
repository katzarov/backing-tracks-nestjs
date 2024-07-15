import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthResult, auth } from 'express-oauth2-jwt-bearer';
import { promisify } from 'util';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  private audience: string;
  private issuerBaseURL: string;

  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    this.audience = this.configService.getOrThrow<string>('auth.audience');
    const domain = this.configService.getOrThrow<string>('auth.domain');
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
      // assigns auth object to req
      await checkJwt(req, res);

      const { auth } = req as { auth: AuthResult };
      const auth0Id = auth.payload.sub;

      // So, I see couple options for what we about to do:
      // 1) Here, (or somewhere at this step in the pipeline) check if user exists & insert the user in the DB now.
      // 1a) same but cache result for a bit.. so we dont query the DB for this all the time ?
      // 2) some webhook with auth0, so I can listen to when new users have registered and do the insert then... But I don't know if I have a guarantee that they will hit my endpoint in the 'right' time. Before trying to actually insert someting per user into the db.
      // 3) just rely on the DB failing when no such user for a query is found , and create then...mhm

      // for now, lets go with 1)

      let user: User | null;
      user = await this.userService.findOneByAuth0Id(auth0Id);

      if (user === null) {
        user = await this.userService.create(auth0Id);
      }

      // TODO: think which id should I use from now on: the auth0 one, or should I map it to one of mine..
      req.user = { id: user.id };

      return true;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException();
    }
  }
}
