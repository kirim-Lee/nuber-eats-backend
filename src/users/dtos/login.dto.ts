import { ArgsType, Field, ObjectType, PickType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/entities/dtos/output.dto';
import { User } from '../entities/user.entity';

@ArgsType()
export class LoginInput extends PickType(User, ['email', 'password']) {}

@ObjectType()
export class LoginOutput extends MutationOutput {
  @Field(type => String, { nullable: true })
  token?: string;
}
