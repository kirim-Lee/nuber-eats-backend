import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthUser, Roles } from 'src/auth/auth.user.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dto/create-order.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';

@Resolver(of => Order)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @Mutation(returns => CreateOrderOutput)
  @Roles(['Any'])
  createOrder(
    @AuthUser() customer: User,
    @Args() createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.orderService.createOrder(customer, createOrderInput);
  }
}
