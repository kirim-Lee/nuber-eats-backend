import { ArgsType, Field, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/entities/dtos/output.dto';
import { User } from '../entities/user.entity';

@ArgsType()
export class UserProfileInput extends PickType(User, ['id']) {}

@ObjectType()
export class UserProfileOutput extends CoreOutput {
  @Field(type => User, { nullable: true })
  profile?: User;
}
