import { Controller, UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Resolver(of => User)
@Controller()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(returns => Boolean)
  hi(): boolean {
    return true;
  }

  @Mutation(returns => CreateAccountOutput)
  createAccount(
    @Args() createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.userService.createAccount(createAccountInput);
  }

  @Mutation(returns => LoginOutput)
  login(@Args() loginInput: LoginInput): Promise<LoginOutput> {
    return this.userService.login(loginInput);
  }

  @Query(returns => User)
  @UseGuards(AuthGuard)
  me(@Context() context) {
    return context['user'];
  }
}
