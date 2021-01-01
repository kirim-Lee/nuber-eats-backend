import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Restaurant } from 'src/restaurant/entities/restaurant.entity';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentService } from './payments.service';

const mockRepository = {
  find: jest.fn(),
  save: jest.fn(),
};
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('PaymentService', () => {
  let service: PaymentService;
  let restaurants: MockRepository<Restaurant>;
  let payments: MockRepository<Payment>;

  beforeEach(async () => {
    const modules = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: getRepositoryToken(Restaurant), useValue: mockRepository },
        { provide: getRepositoryToken(Payment), useValue: mockRepository },
      ],
    }).compile();

    service = modules.get<PaymentService>(PaymentService);
    restaurants = modules.get(getRepositoryToken(Restaurant));
    payments = modules.get(getRepositoryToken(Payment));
  });

  describe('checkPromotedRestaurant', () => {
    it('should change restaurant promote', async () => {
      restaurants.find.mockResolvedValue([
        { id: 1, isPromoted: true, promotedUntil: new Date() },
      ]);
      await service.checkPromotedRestaurant();

      expect(restaurants.find).toHaveBeenCalledTimes(1);
      expect(restaurants.save).toHaveBeenCalledTimes(1);
      expect(restaurants.save).toHaveBeenCalledWith([
        {
          id: 1,
          isPromoted: false,
          promotedUntil: null,
        },
      ]);
    });

    it('should return error except', async () => {
      jest.spyOn(console, 'log');
      restaurants.find.mockImplementation(() => {
        throw Error('unhandled Error');
      });
      await service.checkPromotedRestaurant();

      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith(Error('unhandled Error'));
    });
  });
});
