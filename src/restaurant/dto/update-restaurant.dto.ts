import { ArgsType, Field, PartialType } from '@nestjs/graphql';
import { CreateRestaurantDto } from './create-restaurant.dto';

@ArgsType()
export class UpdateRestaurantInputType extends PartialType(
  CreateRestaurantDto,
) {}

@ArgsType()
export class UpdateRestaurantDto extends UpdateRestaurantInputType {
  @Field(type => Number)
  id: number;
}
