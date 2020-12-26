import { ArgsType, Field, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/entities/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';

@ArgsType()
export class CreateRestaurantInput extends PickType(Restaurant, [
  'name',
  'coverImage',
  'address',
]) {
  @Field(type => String)
  categoryName: string;
}

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {}
