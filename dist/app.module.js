"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const Joi = require("joi");
const users_module_1 = require("./users/users.module");
const user_entity_1 = require("./users/entities/user.entity");
const jwt_module_1 = require("./jwt/jwt.module");
const auth_module_1 = require("./auth/auth.module");
const verification_entity_1 = require("./users/entities/verification.entity");
const mail_module_1 = require("./mail/mail.module");
const restaurant_entity_1 = require("./restaurant/entities/restaurant.entity");
const category_entity_1 = require("./restaurant/entities/category.entity");
const restaurant_module_1 = require("./restaurant/restaurant.module");
const dish_entity_1 = require("./restaurant/entities/dish.entity");
const orders_module_1 = require("./orders/orders.module");
const order_entity_1 = require("./orders/entities/order.entity");
const order_item_entity_1 = require("./orders/entities/order-item.entity");
const common_module_1 = require("./common/common.module");
const payments_module_1 = require("./payments/payments.module");
const payment_entity_1 = require("./payments/entities/payment.entity");
const isProd = process.env.NODE_ENV === 'prod';
let AppModule = class AppModule {
};
AppModule = __decorate([
    common_1.Module({
        imports: [
            config_1.ConfigModule.forRoot({
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
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                synchronize: !isProd,
                logging: !isProd,
                entities: [
                    user_entity_1.User,
                    verification_entity_1.Verification,
                    restaurant_entity_1.Restaurant,
                    category_entity_1.Category,
                    dish_entity_1.Dish,
                    order_entity_1.Order,
                    order_item_entity_1.OrderItem,
                    payment_entity_1.Payment,
                ],
            }),
            graphql_1.GraphQLModule.forRoot({
                autoSchemaFile: true,
                context: ({ req, connection }) => ({
                    token: connection ? connection.context['X-JWT'] : req.headers['x-jwt'],
                }),
                installSubscriptionHandlers: true,
            }),
            users_module_1.UsersModule,
            restaurant_module_1.RestaurantModule,
            jwt_module_1.JwtModule.forRoot({ privateKey: process.env.PRIVATE_KEY }),
            mail_module_1.MailModule.forRoot({
                apiKey: process.env.EMAIL_API_KEY,
                domain: process.env.EMAIL_DOMAIN,
                from: process.env.EMAIL_FROM,
            }),
            auth_module_1.AuthModule,
            mail_module_1.MailModule,
            orders_module_1.OrdersModule,
            common_module_1.CommonModule,
            payments_module_1.PaymentsModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map