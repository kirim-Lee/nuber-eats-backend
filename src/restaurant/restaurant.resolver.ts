import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './entities/restaurant.entity';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { RestaurantService } from './restaurant.service';

@Resolver(of => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Query(returns => [Restaurant])
  restaurant(): Promise<Restaurant[]> {
    return this.restaurantService.getAll();
  }

  @Mutation(returns => Boolean)
  async createRestaurant(
    @Args() createRestaurantArgs: CreateRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.restaurantService.createRestaurant(createRestaurantArgs);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
