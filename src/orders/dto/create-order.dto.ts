import { ArgsType, Field, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/entities/dtos/output.dto';
import { Order } from '../entities/order.entity';

@ArgsType()
export class CreateOrderInput extends PickType(Order, ['dishes']) {
  @Field()
  restaurantId: number;
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {}
