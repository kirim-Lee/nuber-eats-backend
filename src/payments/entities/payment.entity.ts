import { ArgsType, Field, Int, ObjectType } from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from 'src/restaurant/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

@ArgsType()
@ObjectType()
@Entity()
export class Payment extends CoreEntity {
  @Field(type => Int)
  @Column()
  transactionId: number;

  @Field(type => User, { nullable: true })
  @ManyToOne(type => User, user => user.payments)
  user: User;

  @RelationId((payment: Payment) => payment.user)
  userId: number;

  @Field(type => Restaurant, { nullable: true })
  @ManyToOne(type => Restaurant, restaurant => restaurant.payments)
  restaurant: Restaurant;

  @RelationId((payment: Payment) => payment.restaurant)
  restaurantId: number;
}
