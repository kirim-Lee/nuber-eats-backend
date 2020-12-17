"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const jwt_middleware_1 = require("./jwt/jwt.middleware");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.use(jwt_middleware_1.JwtMiddelware);
    await app.listen(3000);
}
bootstrap();
//# sourceMappingURL=main.js.map