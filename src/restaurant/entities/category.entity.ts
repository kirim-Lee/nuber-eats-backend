import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@ArgsType()
@ObjectType()
@Entity()
export class Category extends CoreEntity {
  @Field(type => String)
  @Column({ unique: true })
  @IsString()
  name: string;

  @Field(type => String)
  @Column({ unique: true })
  @IsString()
  slug: string;

  @Field(type => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  icon?: string;

  @OneToMany(type => Restaurant, restaurant => restaurant.category)
  restaurants: Restaurant[];
}
