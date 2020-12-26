import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser, Roles } from 'src/auth/auth.user.decorator';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UserProfileInput, UserProfileOutput } from './dtos/user-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dtos/verify-email.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Resolver(of => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

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
  @Roles(['Any'])
  me(@AuthUser() authUser: User) {
    return authUser;
  }

  @Query(returns => UserProfileOutput)
  @Roles(['Any'])
  userProfile(
    @Args() userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    return this.userService.userProfile(userProfileInput.id);
  }

  @Mutation(returns => EditProfileOutput)
  @Roles(['Any'])
  editProfile(
    @AuthUser() authUser: User,
    @Args() editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    return this.userService.editProfile(authUser.id, editProfileInput);
  }

  @Mutation(returns => VerifyEmailOutput)
  verifyEmail(@Args() verifyEmailInput: VerifyEmailInput) {
    return this.userService.verifyEmail(verifyEmailInput.code);
  }
}
