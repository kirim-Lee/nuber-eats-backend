import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/entities/dtos/output.dto';
import { Order, ORDER_STATUS } from '../entities/order.entity';

@ArgsType()
export class GetOrdersInput {
  @Field(type => ORDER_STATUS, { nullable: true })
  status?: ORDER_STATUS;
}

@ObjectType()
export class GetOrdersOutput extends CoreOutput {
  @Field(type => [Order], { nullable: true })
  orders?: Order[];
}
