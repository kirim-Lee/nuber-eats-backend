import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from './category.entity';

@ArgsType()
@ObjectType()
@Entity()
export class Restaurant extends CoreEntity {
  @PrimaryGeneratedColumn()
  @Field(type => Number)
  id: number;

  @Column()
  @Field(type => String)
  @IsString()
  @Length(5, 10)
  name: string;

  @Column()
  @Field(type => String)
  @IsString()
  address: string;

  @Column()
  @Field(type => String)
  @IsString()
  coverImage: string;

  @ManyToOne(type => Category, category => category.restaurants)
  @Field(type => Category)
  category: Category;
}
