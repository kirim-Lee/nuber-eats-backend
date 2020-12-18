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
const jwt_middleware_1 = require("./jwt/jwt.middleware");
const auth_module_1 = require("./auth/auth.module");
const verification_entity_1 = require("./users/entities/verification.entity");
const isDev = process.env.NODE_ENV !== 'prod';
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(jwt_middleware_1.JwtMiddelware)
            .forRoutes({ path: '/graphql', method: common_1.RequestMethod.POST });
    }
};
AppModule = __decorate([
    common_1.Module({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: `.env.${process.env.NODE_ENV}`,
                ignoreEnvFile: !isDev,
                validationSchema: Joi.object({
                    NODE_ENV: Joi.string().valid('dev', 'prod', 'test').default('dev'),
                    PORT: Joi.number().default(5432),
                    DATABASE_HOST: Joi.string().required(),
                    DATABASE_PORT: Joi.string().required(),
                    DATABASE_USER: Joi.string().required(),
                    DATABASE_PASSWORD: Joi.string().required(),
                    DATABASE_NAME: Joi.string().required(),
                    PRIVATE_KEY: Joi.string().required(),
                }),
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DATABASE_HOST,
                port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
                username: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                database: process.env.DATABASE_NAME,
                synchronize: isDev,
                logging: isDev,
                entities: [user_entity_1.User, verification_entity_1.Verification],
            }),
            graphql_1.GraphQLModule.forRoot({
                autoSchemaFile: true,
                context: ({ req }) => ({ user: req['user'] }),
            }),
            users_module_1.UsersModule,
            jwt_module_1.JwtModule.forRoot({ privateKey: process.env.PRIVATE_KEY }),
            auth_module_1.AuthModule,
        ],
        controllers: [],
        providers: [],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map