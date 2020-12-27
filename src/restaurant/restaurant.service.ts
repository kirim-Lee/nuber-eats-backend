import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dto/delete-restaurant.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dto/edit-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private readonly categories: CategoryRepository,
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
      newRestaurant.category = await this.categories.getOrCreate(
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

      if (editRestaurantInput.categoryName) {
        restaurant.category = await this.categories.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }

      await this.restaurants.save({ ...restaurant, ...editRestaurantInput });

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

  async deleteRestaurant(
    owner: User,
    { id }: DeleteRestaurantInput,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(
        { id },
        { loadRelationIds: true },
      );

      if (!restaurant) {
        throw Error("restaurant isn't not exist");
      }

      if (restaurant.ownerId !== owner.id) {
        throw Error('able to delete by only owner');
      }

      await this.restaurants.delete({ id });

      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }
}
