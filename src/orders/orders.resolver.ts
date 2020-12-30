import { Param } from '@nestjs/common';
import { Query, Args, Mutation, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser, Roles } from 'src/auth/auth.user.decorator';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dto/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dto/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dto/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dto/get-orders.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';

const pubSub = new PubSub();

@Resolver(of => Order)
export class OrderResolver {
  constructor(private readonly orderService: OrderService) {}

  @Mutation(returns => CreateOrderOutput)
  @Roles(['CLIENT'])
  createOrder(
    @AuthUser() customer: User,
    @Args() createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.orderService.createOrder(customer, createOrderInput);
  }

  @Query(returns => GetOrdersOutput)
  @Roles(['Any'])
  getOrders(
    @AuthUser() authUser: User,
    @Args() getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.orderService.getOrders(authUser, getOrdersInput);
  }

  @Query(returns => GetOrderOutput)
  @Roles(['Any'])
  getOrder(
    @AuthUser() authUser: User,
    @Args() getOrderInput: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.orderService.getOrder(authUser, getOrderInput);
  }

  @Mutation(returns => EditOrderOutput)
  @Roles(['Any'])
  editOrder(
    @AuthUser() authUser: User,
    @Args() editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return this.orderService.editOrder(authUser, editOrderInput);
  }

  @Subscription(returns => String)
  @Roles(['Any'])
  orderSubscription() {
    return pubSub.asyncIterator('orderArrived');
  }

  @Mutation(returns => String)
  orderTest(@Args('str') str: string): boolean {
    pubSub.publish('orderArrived', { str });
    return true;
  }
}
