import { ArgsType, Field, ObjectType } from '@nestjs/graphql';
import {
  PaginationInput,
  PaginationOutput,
} from 'src/common/entities/dtos/pagination.dto';
import { Payment } from '../entities/payment.entity';

@ArgsType()
export class GetPaymentsInput extends PaginationInput {}

@ObjectType()
export class GetPaymentsOutput extends PaginationOutput {
  @Field(type => [Payment])
  results?: Payment[];
}
