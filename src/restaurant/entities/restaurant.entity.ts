import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@ArgsType()
@ObjectType()
@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field(type => Number)
  id: number;

  @Column()
  @Field(type => String)
  @IsString()
  @Length(5, 10)
  name: string;

  @Column()
  @Field(type => Boolean)
  @IsBoolean()
  isVegan: boolean;

  @Column()
  @Field(type => String)
  @IsString()
  address: string;

  @Column()
  @Field(type => String)
  @IsString()
  ownersName: string;

  @Column()
  @Field(type => String)
  @IsString()
  categoryName: string;
}
