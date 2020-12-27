import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreOutput } from 'src/common/entities/dtos/output.dto';
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

  async isOwnerRestaurantOwner(
    restaurantId: number,
    ownerId: number,
  ): Promise<{
    ok: boolean;
    error?: string | null;
    restaurant?: null | Restaurant;
  }> {
    try {
      const restaurant = await this.restaurants.findOne(
        { id: restaurantId },
        { loadRelationIds: true },
      );

      if (!restaurant) {
        throw Error("restaurant isn't exist");
      }

      if (restaurant.ownerId !== ownerId) {
        throw Error('owner is not belonged this restaurant');
      }

      return { ok: true, restaurant };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const { ok, restaurant, error } = await this.isOwnerRestaurantOwner(
        editRestaurantInput.restaurantId,
        owner.id,
      );

      if (!ok) {
        return { ok, error };
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
      const { ok, error } = await this.isOwnerRestaurantOwner(id, owner.id);

      if (!ok) {
        return { ok, error };
      }

      await this.restaurants.delete({ id });

      return { ok: true };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }
}
