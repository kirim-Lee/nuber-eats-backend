import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dto/create-order.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private readonly orders: Repository<Order>,
  ) {}

  async createOrder(
    customer: User,
    createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const order = this.orders.create(createOrderInput);
      order.customer = customer;
      await this.orders.save(order);
      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }
}
