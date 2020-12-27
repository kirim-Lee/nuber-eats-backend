import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/entities/dtos/pagination.dto';
import { Restaurant } from '../entities/restaurant.entity';

@ArgsType()
export class RestaurantsInput extends PaginationInput {}

@ObjectType()
export class RestaurantsOutput extends PaginationOutput {
  @Field(type => [Restaurant], { nullable: true })
  results?: Restaurant[];

  @Field(type => Number, { nullable: true })
  totalResults?: number;
}
