import { ArgsType, PickType } from '@nestjs/graphql';
import { Order } from '../entities/order.entity';

@ArgsType()
export class UpdateOrderStatusInput extends PickType(Order, ['id']) {}
