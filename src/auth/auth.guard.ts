import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { ROLE, User } from 'src/users/entities/user.entity';
import { TypeRoles } from './auth.user.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // role이 any 면 로그인되면 true
    // role이 지정되면 해당 롤만 가능
    // role 이 없으면 public

    const roles = this.reflector
      .get<TypeRoles[]>('roles', context.getHandler())
      ?.map(role => ROLE[role] ?? 'Any');

    if (!roles) {
      return true;
    }

    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user: User = gqlContext['user'];

    return roles.includes(user?.role) || (roles.includes('Any') && !!user);
  }
}
