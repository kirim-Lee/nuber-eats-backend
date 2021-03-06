import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

import {
  CategoryResolver,
  DishResolver,
  RestaurantResolver,
} from './restaurant.resolver';
import { RestaurantService } from './restaurant.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant, Dish, CategoryRepository, User]),
  ],
  providers: [
    RestaurantService,
    RestaurantResolver,
    CategoryResolver,
    DishResolver,
  ],
})
export class RestaurantModule {}
