import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PubSub } from 'graphql-subscriptions';
import {
  NEW_COOKED_ORDER,
  NEW_PENDING_ORDER,
  PUB_SUB,
  UPDATE_ORDER,
} from 'src/common/common.constant';
import { Dish } from 'src/restaurant/entities/dish.entity';
import { Restaurant } from 'src/restaurant/entities/restaurant.entity';

import { ROLE, User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dto/create-order.dto';
import { EditOrderInput, EditOrderOutput } from './dto/edit-order.dto';
import { GetOrderInput, GetOrderOutput } from './dto/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dto/get-orders.dto';
import { TakeOrderInput, TakeOrderOutput } from './dto/take-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order, ORDER_STATUS } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Dish)
    private readonly dishs: Repository<Dish>,
    @InjectRepository(OrderItem)
    private readonly orderItems: Repository<OrderItem>,
    @Inject(PUB_SUB) private readonly pubSub: PubSub,
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, orderItems }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId, {
        loadRelationIds: true,
      });

      if (!restaurant) {
        throw Error('restaurant is not exist');
      }

      const dishes = orderItems.map(async orderItem => {
        const dish = await this.dishs.findOne(orderItem.dishId);
        if (!dish) {
          throw Error("dish isn't exist");
        }

        const options = orderItem.options
          .map(option => {
            const selectedOption = dish.options.find(
              dishOption => dishOption.name === option.name,
            );
            if (!selectedOption) {
              return null;
            }

            const selectedChoice = selectedOption.choices?.find(
              choice => choice.name === option.choice,
            );

            const extra = selectedChoice?.extra || selectedOption.extra || 0;

            return { ...option, extra };
          })
          .filter(option => !!option);

        return { dish, options };
      });

      const items = await Promise.all(dishes);

      const total = items.reduce(
        (itemAcc, item) =>
          itemAcc +
          item.dish.price +
          item.options
            .map(option => option.extra)
            .reduce((acc, cur) => acc + cur, 0),
        0,
      );

      const item = await this.orderItems.save(this.orderItems.create(items));
      const order = await this.orders.save(
        this.orders.create({ restaurant, customer, total, items: item }),
      );

      await this.pubSub.publish(NEW_PENDING_ORDER, {
        pendingOrders: { order, ownerId: restaurant.ownerId },
      });

      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async getOrdersByClient(
    user: User,
    getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      const orders = await this.orders.find({
        where: { customer: user, ...getOrdersInput },
      });
      return { ok: true, orders };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async getOrdersByDriver(
    user: User,
    getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      const orders = await this.orders.find({
        where: { driver: user, ...getOrdersInput },
      });
      return { ok: true, orders };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async getOrdersByOwner(
    user: User,
    getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      const restaurants = await this.restaurants.find({
        where: { owner: user },
      });

      if (!restaurants) {
        throw Error('you have any restaurant');
      }

      const orders = await this.orders.find({
        where: restaurants.map(restaurant => ({
          restaurant,
          ...getOrdersInput,
        })),
      });

      return { ok: true, orders };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async getOrders(
    user: User,
    getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    switch (user.role) {
      case ROLE.CLIENT:
        return this.getOrdersByClient(user, getOrdersInput);
      case ROLE.DELIVERY:
        return this.getOrdersByDriver(user, getOrdersInput);
      case ROLE.OWNER:
        return this.getOrdersByOwner(user, getOrdersInput);
      default:
        return {
          ok: false,
          error: "your role isn't exist",
        };
    }
  }

  async getCheckWithRole(user: User, order: Order): Promise<boolean> {
    switch (user.role) {
      case ROLE.CLIENT:
        return order.customerId === user.id;
      case ROLE.DELIVERY:
        return order.driverId === user.id;
      case ROLE.OWNER:
        const restaurant = await this.restaurants.findOne(order.restaurantId, {
          loadRelationIds: true,
        });
        return restaurant.ownerId === user.id;
      default:
        return false;
    }
  }

  async getOrder(user: User, { id }: GetOrderInput): Promise<GetOrderOutput> {
    try {
      const order = await this.orders.findOne(id, {
        loadRelationIds: true,
      });
      if (!order) {
        throw Error('order is not exist');
      }

      if (!(await this.getCheckWithRole(user, order))) {
        throw Error("you aren't able to view this order");
      }

      return { ok: true, order };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  checkAbleChangeStatus(role: ROLE, status: ORDER_STATUS): boolean {
    switch (status) {
      case ORDER_STATUS.Cooked:
      case ORDER_STATUS.Cooking:
        return role === ROLE.OWNER;
      case ORDER_STATUS.PickedUp:
      case ORDER_STATUS.Delivered:
        return role === ROLE.DELIVERY;
      default:
        return false;
    }
  }

  async editOrder(
    user: User,
    { id, status }: EditOrderInput,
  ): Promise<EditOrderOutput> {
    try {
      const order = await this.orders.findOne(id);

      if (!order) {
        throw Error('order is not exist');
      }

      if (!(await this.getCheckWithRole(user, order))) {
        throw Error("you aren't able to change this order");
      }

      if (!this.checkAbleChangeStatus(user.role, status)) {
        throw Error(
          `your role is ${user.role}, and couln't change to ${status}`,
        );
      }

      await this.orders.save({ id, status });

      // pubsub publish
      if (status === ORDER_STATUS.Cooked) {
        await this.pubSub.publish(NEW_COOKED_ORDER, {
          cookedOrders: { ...order, status },
        });
      }

      await this.pubSub.publish(UPDATE_ORDER, {
        updateOrder: { ...order, status },
      });

      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async takeOrder(
    driver: User,
    { id }: TakeOrderInput,
  ): Promise<TakeOrderOutput> {
    try {
      const order = await this.orders.findOne(id);
      if (!order) {
        throw Error('order is not founded');
      }

      if (
        order.status === ORDER_STATUS.Delivered ||
        order.status === ORDER_STATUS.PickedUp
      ) {
        throw Error(
          `this order couln't take because order status is ${order.status}`,
        );
      }

      if (order.driverId === driver.id) {
        throw Error('you already occupied this order');
      }

      if (order.driverId) {
        throw Error('this order has occupied');
      }

      await this.orders.save({ id, driver });
      await this.pubSub.publish(UPDATE_ORDER, {
        updateOrder: { ...order, driver },
      });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }
}
