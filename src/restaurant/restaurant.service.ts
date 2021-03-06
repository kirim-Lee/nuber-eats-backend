import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Raw, Repository } from 'typeorm';
import { AllCategoriesOutput } from './dto/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dto/category.dto';
import { CreateDishInput, CreateDishOutput } from './dto/create-dish.dto';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.dto';
import { DeleteDishInput, DeleteDishOutput } from './dto/delete-dish.dto';
import {
  DeleteRestaurantInput,
  DeleteRestaurantOutput,
} from './dto/delete-restaurant.dto';
import { EditDishInput, EditDishOutput } from './dto/edit-dish.dto';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dto/edit-restaurant.dto';
import { RestaurantInput, RestaurantOutput } from './dto/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dto/restaurants.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dto/search-restaurant.dto';
import { Category } from './entities/category.entity';
import { Dish } from './entities/dish.entity';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';

const limit = 1;

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurants: Repository<Restaurant>,
    private readonly categories: CategoryRepository,
    @InjectRepository(Dish)
    private readonly dish: Repository<Dish>,
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

  // 레스토랑 아이디의 소유주가 사용자 아이디인지 확인
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

  async myRestaurants(owner: User): Promise<RestaurantsOutput> {
    try {
      const [restaurnats, totalResults] = await this.restaurants.findAndCount({
        owner,
      });
      return { ok: true, results: restaurnats, totalResults };
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
        order: { isPromoted: 'DESC' },
        relations: ['category'],
      });

      const totalRestaurants = await this.getRestaurantCount(category);

      return {
        ok: true,
        category,
        restaurants,
        totalResults: totalRestaurants,
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
        order: { isPromoted: 'DESC' },
        relations: ['category'],
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

  async findRestaurantById(
    restaurantInput: RestaurantInput,
  ): Promise<RestaurantOutput> {
    try {
      const result = await this.restaurants.findOne(
        {
          id: restaurantInput.restaurantId,
        },
        { relations: ['menu'] },
      );
      if (!result) {
        throw Error("restaurant coudln't found");
      }
      return {
        ok: true,
        result,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async searchRestaurantByName({
    query,
    page,
  }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: { name: Raw(name => `${name} ILIKE '%${query}%'`) },
        take: limit,
        skip: (page - 1) * limit,
        relations: ['menu', 'category'],
      });

      return {
        ok: true,
        totalPages: Math.ceil(totalResults / limit),
        totalResults,
        result: restaurants,
      };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async createDish(
    owner: User,
    createDishInput: CreateDishInput,
  ): Promise<CreateDishOutput> {
    try {
      const { ok, error, restaurant } = await this.isOwnerRestaurantOwner(
        createDishInput.restaurantId,
        owner.id,
      );

      if (!ok) {
        return {
          ok,
          error,
        };
      }

      const existDish = await this.dish.findOne({
        name: createDishInput.name,
        restaurant,
      });

      if (existDish) {
        throw Error('dish name is already exist');
      }

      await this.dish.save(
        this.dish.create({ ...createDishInput, restaurant }),
      );

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }
  async editDish(
    owner: User,
    editDishInput: EditDishInput,
  ): Promise<EditDishOutput> {
    try {
      const dish = await this.dish.findOne(editDishInput.dishId, {
        loadRelationIds: true,
      });

      if (!dish) {
        throw Error('dish is not exist');
      }

      const { ok, error } = await this.isOwnerRestaurantOwner(
        dish.restaurantId,
        owner.id,
      );

      if (!ok) {
        return {
          ok,
          error,
        };
      }

      await this.dish.save({ ...dish, ...editDishInput });

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }

  async deleteDish(
    owner: User,
    { dishId }: DeleteDishInput,
  ): Promise<DeleteDishOutput> {
    try {
      const dish = await this.dish.findOne(dishId, { loadRelationIds: true });

      if (!dish) {
        throw Error("dish isn't exist");
      }

      const { ok, error } = await this.isOwnerRestaurantOwner(
        dish.restaurantId,
        owner.id,
      );

      if (!ok) {
        return { ok, error };
      }

      await this.dish.delete(dishId);

      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: error.message,
      };
    }
  }
}
