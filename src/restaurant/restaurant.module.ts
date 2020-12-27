import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';
import { RestaurantResolver } from './restaurant.resolver';
import { RestaurantService } from './restaurant.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, CategoryRepository, User])],
  providers: [RestaurantService, RestaurantResolver],
})
export class RestaurantModule {}
