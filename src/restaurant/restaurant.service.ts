import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CoreOutput } from 'src/common/entities/dtos/output.dto';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { AllCategoriesOutput } from './dto/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dto/category.dto';
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
import { RestaurantsInput, RestaurantsOutput } from './dto/restaurants.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

const limit = 25;

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

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return { ok: true, categories };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async getRestaurantCount(category: Category): Promise<number> {
    try {
      const count = await this.restaurants.count({ category });
      return count ?? 0;
    } catch (error) {
      console.log(error);
      return 0;
    }
  }

  async findCategoryBySlug({
    slug,
    page,
  }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({ slug });

      if (!category) {
        throw Error('category not found');
      }

      const restaurants = await this.restaurants.find({
        where: { category },
        take: limit,
        skip: (page - 1) * limit,
      });

      const totalRestaurants = await this.getRestaurantCount(category);

      return {
        ok: true,
        category,
        restaurants,
        totalPages: Math.ceil(totalRestaurants / limit),
      };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [results, totalResults] = await this.restaurants.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        ok: true,
        totalPages: Math.ceil(totalResults / limit),
        totalResults,
        results,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }
}
