import { ArgsType, Field, ObjectType } from '@nestjs/graphql';

import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/entities/dtos/pagination.dto';
import { Restaurant } from '../entities/restaurant.entity';

@ArgsType()
export class SearchRestaurantInput extends PaginationInput {
  @Field(type => String)
  query: string;
}

@ObjectType()
export class SearchRestaurantOutput extends PaginationOutput {
  @Field(type => [Restaurant], { nullable: true })
  result?: Restaurant[];

  @Field(type => Number, { nullable: true })
  totalResults?: number;
}
