import { ArgsType, Field, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/entities/dtos/output.dto';
import { Payment } from '../entities/payment.entity';

@ArgsType()
export class CreatePaymentInput extends PickType(Payment, ['transactionId']) {
  @Field(type => Int)
  restaurantId: number;
}

@ObjectType()
export class CreatePaymentOutput extends CoreOutput {}
