import { ArgsType, Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity } from 'typeorm';

enum ROLE {
  CLIENT = 'client',
  OWNER = 'owner',
  DELIVERY = 'delivery',
}

registerEnumType(ROLE, { name: 'userRole' });

@ArgsType()
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column()
  @Field(type => String)
  email: string;

  @Column()
  @Field(type => String)
  password: string;

  @Column({
    type: 'enum',
    enum: ROLE,
    default: ROLE.CLIENT,
  })
  @Field(type => ROLE)
  role: ROLE;
}
