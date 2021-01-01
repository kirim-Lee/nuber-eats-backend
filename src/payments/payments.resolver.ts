import { Args, Query, Mutation, Resolver } from '@nestjs/graphql';
import { AuthUser, Roles } from 'src/auth/auth.user.decorator';
import { User } from 'src/users/entities/user.entity';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dto/create-payment.dto';
import { GetPaymentsInput, GetPaymentsOutput } from './dto/get-payments.dto';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './payments.service';

@Resolver(of => Payment)
export class PaymentResolver {
  constructor(private readonly paymentService: PaymentService) {}

  // 레스토랑 광고비 생성
  @Mutation(returns => CreatePaymentOutput)
  @Roles(['OWNER'])
  createPayment(
    @AuthUser() authUser: User,
    @Args() createPaymentInput: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    return this.paymentService.createPayment(authUser, createPaymentInput);
  }

  @Query(returns => GetPaymentsOutput)
  @Roles(['OWNER'])
  getPayments(
    @AuthUser() authUser: User,
    @Args() getPaymentInput: GetPaymentsInput,
  ): Promise<GetPaymentsOutput> {
    return this.paymentService.getPayment(authUser, getPaymentInput);
  }
}
