import { ArgsType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/entities/dtos/output.dto';
import { Restaurant } from '../entities/restaurant.entity';

@ArgsType()
export class DeleteRestaurantInput extends PickType(Restaurant, ['id']) {}

@ObjectType()
export class DeleteRestaurantOutput extends CoreOutput {}
