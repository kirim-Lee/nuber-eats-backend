import {
  ArgsType,
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsEnum, IsNumber } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Restaurant } from 'src/restaurant/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  RelationId,
} from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum ORDER_STATUS {
  Pending = 'Pending',
  Cooking = 'Cooking', // 레스토랑 can change
  Cooked = 'Cooked', // 레스토랑 can change
  PickedUp = 'PickUp', // 딜리버리 can change
  Delivered = 'Delivered', // 딜리버리 can change
}

registerEnumType(ORDER_STATUS, { name: 'OrderStatus' });

@ArgsType()
@ObjectType()
@Entity()
export class Order extends CoreEntity {
  @Field(type => User)
  @ManyToOne(type => User, user => user.orders, {
    onDelete: 'RESTRICT',
    eager: true,
  })
  customer: User;

  @RelationId((order: Order) => order.customer)
  customerId: number;

  @Field(type => User, { nullable: true })
  @ManyToOne(type => User, user => user.orders, {
    onDelete: 'RESTRICT',
    eager: true,
  })
  driver?: User;

  @RelationId((order: Order) => order.driver)
  driverId: number;

  @Field(type => Restaurant)
  @ManyToOne(type => Restaurant, restaurant => restaurant.orders, {
    onDelete: 'RESTRICT',
    eager: true,
  })
  restaurant: Restaurant;

  @RelationId((order: Order) => order.restaurant)
  restaurantId: number;

  @Field(type => [OrderItem])
  @ManyToMany(type => OrderItem)
  @JoinTable()
  items: OrderItem[];

  @Column({ nullable: true })
  @Field(type => Float, { nullable: true })
  @IsNumber()
  total?: number;

  @Column({ type: 'enum', enum: ORDER_STATUS, default: ORDER_STATUS.Pending })
  @Field(type => ORDER_STATUS)
  @IsEnum(ORDER_STATUS)
  status: ORDER_STATUS;
}
