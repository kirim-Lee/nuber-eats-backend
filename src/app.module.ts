import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Restaurant } from './restaurant/entities/restaurant.entity';
import { Category } from './restaurant/entities/category.entity';
import { RestaurantModule } from './restaurant/restaurant.module';
import { Dish } from './restaurant/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { CommonModule } from './common/common.module';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/entities/payment.entity';

const isProd = process.env.NODE_ENV === 'prod';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      ignoreEnvFile: isProd,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod', 'test').default('dev'),
        PORT: Joi.number().default(5432),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.string().required(),
        DATABASE_USER: Joi.string().required(),
        DATABASE_PASSWORD: Joi.string().required(),
        DATABASE_NAME: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        EMAIL_API_KEY: Joi.string().required(),
        EMAIL_DOMAIN: Joi.string().required(),
        EMAIL_FROM: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      synchronize: !isProd,
      logging: !isProd,
      entities: [
        User,
        Verification,
        Restaurant,
        Category,
        Dish,
        Order,
        OrderItem,
        Payment,
      ],
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      context: ({ req, connection }) => ({
        token: connection ? connection.context['X-JWT'] : req.headers['x-jwt'],
      }),
      installSubscriptionHandlers: true,
    }),
    UsersModule,
    RestaurantModule,
    JwtModule.forRoot({ privateKey: process.env.PRIVATE_KEY }),
    MailModule.forRoot({
      apiKey: process.env.EMAIL_API_KEY,
      domain: process.env.EMAIL_DOMAIN,
      from: process.env.EMAIL_FROM,
    }),
    AuthModule,
    MailModule,
    OrdersModule,
    CommonModule,
    PaymentsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
