import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ROLE } from 'src/users/entities/user.entity';

export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const gqlContext = GqlExecutionContext.create(ctx).getContext();
    const user = gqlContext['user'];
    return user;
  },
);

export type TypeRoles = keyof typeof ROLE | 'Any';

export const Roles = (roles: TypeRoles[]) => SetMetadata('roles', roles);
