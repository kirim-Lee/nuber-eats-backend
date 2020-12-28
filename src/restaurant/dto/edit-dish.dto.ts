import {
  ArgsType,
  Field,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/entities/dtos/output.dto';
import { Dish } from '../entities/dish.entity';

@ArgsType()
export class EditDishInput extends PartialType(
  PickType(Dish, ['name', 'options', 'price', 'photo', 'description']),
) {
  @Field(type => Number)
  dishId: number;
}

@ObjectType()
export class EditDishOutput extends CoreOutput {}
