import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity } from 'typeorm';

type ROLE = 'client' | 'owner' | 'delivery';

@ArgsType()
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column()
  @Field()
  email: string;

  @Column()
  @Field()
  password: string;

  @Column()
  @Field()
  role: ROLE;
}
