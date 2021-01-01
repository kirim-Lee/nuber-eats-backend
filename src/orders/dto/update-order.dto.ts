import { ArgsType, PickType } from '@nestjs/graphql';
import { Order } from '../entities/order.entity';

@ArgsType()
export class UpdateOrderInput extends PickType(Order, ['id']) {}
