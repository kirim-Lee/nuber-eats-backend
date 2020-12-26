import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository, UpdateResult } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
  ) {}

  getAll(): Promise<Restaurant[]> {
    return this.restaurants.find({ take: 10 });
  }

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);

      // owner
      newRestaurant.owner = owner;

      // category
      const categoryName = createRestaurantInput.categoryName
        .trim()
        .toLowerCase();
      const categorySlug = categoryName.replace(/\s/g, '-');
      const category = await this.categories.findOne({ slug: categorySlug });

      if (!category) {
        newRestaurant.category = await this.categories.save(
          this.categories.create({ slug: categorySlug, name: categoryName }),
        );
      } else {
        newRestaurant.category = category;
      }

      // save
      await this.restaurants.save(newRestaurant);

      return {
        ok: true,
        error: null,
      };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }
}
