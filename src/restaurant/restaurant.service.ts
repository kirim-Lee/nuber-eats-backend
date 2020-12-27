import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository, UpdateResult } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dto/edit-restaurant.dto';
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

  private async getOrCreateCategory(name: string): Promise<Category> {
    const categoryName = name.trim().toLowerCase();
    const categorySlug = categoryName.replace(/\s/g, '-');
    const category = await this.categories.findOne({ slug: categorySlug });

    if (!category) {
      return await this.categories.save(
        this.categories.create({ slug: categorySlug, name: categoryName }),
      );
    }

    return category;
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
      newRestaurant.category = await this.getOrCreateCategory(
        createRestaurantInput.categoryName,
      );

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

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        {
          id: editRestaurantInput.restaurantId,
        },
        { loadRelationIds: true },
      );

      if (!restaurant) {
        throw Error("restaurant isn't exist");
      }

      if (restaurant.ownerId !== owner.id) {
        throw Error('owner is not belonged this restaurant');
      }

      await this.restaurants.save(restaurant);

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }
}
