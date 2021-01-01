import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurant/entities/restaurant.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dto/create-payment.dto';
import { GetPaymentsInput, GetPaymentsOutput } from './dto/get-payments.dto';
import { Payment } from './entities/payment.entity';

const limit = 10;

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
  ) {}

  async createPayment(
    owner: User,
    createPaymentInput: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        createPaymentInput.restaurantId,
        { loadRelationIds: true },
      );

      if (!restaurant) {
        throw Error('restaurant is not exist');
      }

      if (owner.id !== restaurant.ownerId) {
        throw Error('you are not the restaurant owner');
      }

      await this.payments.save(
        this.payments.create({
          transactionId: createPaymentInput.transactionId,
          user: owner,
          restaurant,
        }),
      );

      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async getPayment(
    user: User,
    { page }: GetPaymentsInput,
  ): Promise<GetPaymentsOutput> {
    try {
      const [results, totalResults] = await this.payments.findAndCount({
        where: { user },
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        ok: true,
        results,
        totalPages: Math.ceil(totalResults / limit),
      };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }
}
