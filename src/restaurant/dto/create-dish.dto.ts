import { ArgsType, Field, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/entities/dtos/output.dto';
import { Dish } from '../entities/dish.entity';

@ArgsType()
export class CreateDishInput extends PickType(Dish, [
  'name',
  'price',
  'description',
  'options',
]) {
  @Field(type => Int)
  restaurantId: number;
}

@ObjectType()
export class CreateDishOutput extends CoreOutput {}
