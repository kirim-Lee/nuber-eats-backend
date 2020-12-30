import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { ROLE } from 'src/users/entities/user.entity';
import { AllowRoles } from './auth.user.decorator';
import { AuthUserService } from 'src/auth/auth.user.service';
// import { UserService } from 'src/users/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authUserService: AuthUserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const token = gqlContext.token;

    const user = token
      ? await this.authUserService.getUser(token.toString())
      : null;
    gqlContext['user'] = user;

    // role이 any 면 로그인되면 true
    // role이 지정되면 해당 롤만 가능
    // role 이 없으면 public
    // 메타데이터를 reflector를 이용해 가져올수 있음
    const roles = this.reflector
      .get<AllowRoles[]>('roles', context.getHandler())
      ?.map(role => ROLE[role] ?? 'Any');

    if (!roles) {
      return true;
    }

    if (!token) {
      return false;
    }

    return roles.includes(user?.role) || (roles.includes('Any') && !!user);
  }
}
