import { Inject } from '@nestjs/common';
import { Query, Args, Mutation, Resolver, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { AuthUser, Roles } from 'src/auth/auth.user.decorator';
import {
  PUB_SUB,
  NEW_PENDING_ORDER,
  NEW_COOKED_ORDER,
  UPDATE_ORDER_STATUS,
} from 'src/common/common.constant';
import { User } from 'src/users/entities/user.entity';
import { CreateOrderInput, CreateOrderOutput } from './dto/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dto/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dto/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dto/get-orders.dto';
import { UpdateOrderStatusInput } from './dto/update-order-status.dto';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';

@Resolver(of => Order)
export class OrderResolver {
  constructor(
    private readonly orderService: OrderService,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

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

  // 오더 생성시 섭스크립션
  @Subscription(returns => Order, {
    filter: (payload, _, context) => {
      return payload.pendingOrders?.ownerId === context.user?.id;
    },
    resolve: ({ pendingOrders: { order } }) => order,
  })
  @Roles(['OWNER'])
  pendingOrders() {
    return this.pubSub.asyncIterator(NEW_PENDING_ORDER);
  }

  @Subscription(returns => Order)
  @Roles(['DELIVERY'])
  cookedOrders() {
    return this.pubSub.asyncIterator(NEW_COOKED_ORDER);
  }

  @Subscription(returns => Order, {
    filter: (payload, variable, context) => {
      const order: Order = payload.updateOrderStatus;
      return (
        order.id === variable.id &&
        (order?.restaurant?.ownerId === context.user?.id ||
          order?.customerId === context.user?.id ||
          order?.driverId === context.user?.id)
      );
    },
  })
  @Roles(['Any'])
  updateOrderStatus(@Args() updateOrderStatusInput: UpdateOrderStatusInput) {
    return this.pubSub.asyncIterator(UPDATE_ORDER_STATUS);
  }
}
