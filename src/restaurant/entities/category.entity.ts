import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@ArgsType()
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Field(type => String)
  @Column()
  @IsString()
  name: string;

  @Field(type => String)
  @Column()
  @IsString()
  icon: string;

  @OneToMany(type => Restaurant, restaurant => restaurant.category)
  restaurants: Restaurant[];
}
