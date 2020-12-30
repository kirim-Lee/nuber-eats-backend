import { ArgsType, Field, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/entities/dtos/output.dto';
import { Order } from '../entities/order.entity';

@ArgsType()
export class GetOrderInput extends PickType(Order, ['id']) {}

@ObjectType()
export class GetOrderOutput extends CoreOutput {
  @Field(type => Order, { nullable: true })
  order?: Order;
}
