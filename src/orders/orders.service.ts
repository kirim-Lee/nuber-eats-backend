import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dish } from 'src/restaurant/entities/dish.entity';
import { Restaurant } from 'src/restaurant/entities/restaurant.entity';

import { ROLE, User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dto/create-order.dto';
import { GetOrderInput, GetOrderOutput } from './dto/get-order.dto';
import { GetOrdersInput, GetOrdersOutput } from './dto/get-orders.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

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
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, orderItems }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);

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
      await this.orders.save(
        this.orders.create({ restaurant, customer, total, items: item }),
      );

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
}
