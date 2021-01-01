import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Order } from 'src/orders/entities/order.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Category } from './category.entity';
import { Dish } from './dish.entity';

@ArgsType()
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @PrimaryGeneratedColumn()
  @Field(type => Number)
  id: number;

  @Column({ unique: true })
  @Field(type => String)
  @IsString()
  @Length(5, 20)
  name: string;

  @Column()
  @Field(type => String)
  @IsString()
  address: string;

  @Column()
  @Field(type => String)
  @IsString()
  coverImage: string;

  @ManyToOne(type => Category, category => category.restaurants, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: Category;

  @RelationId((restaurant: Restaurant) => restaurant.category)
  categoryId: number;

  @ManyToOne(type => User, user => user.restaurants)
  owner: User;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field(type => [Dish], { nullable: true })
  @OneToMany(type => Dish, dish => dish.restaurant)
  menu: Dish[];

  @Field(type => [Order], { nullable: true })
  @OneToMany(type => Order, order => order.restaurant)
  orders?: Order[];

  @Field(type => [Payment])
  @OneToMany(type => Payment, payment => payment.user)
  payments: Payment[];
}
