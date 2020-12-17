import { ArgsType, ObjectType, PickType } from '@nestjs/graphql';
import { MutationOutput } from 'src/common/entities/dtos/output.dto';
import { User } from '../entities/user.entity';

@ArgsType()
export class CreateAccountInput extends PickType(User, [
  'email',
  'password',
  'role',
]) {}

@ObjectType()
export class CreateAccountOutput extends MutationOutput {}
