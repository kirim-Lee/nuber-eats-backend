import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from 'src/users/users.module';
import { AuthGuard } from './auth.guard';
import { AuthUserService } from './auth.user.service';

@Module({
  imports: [UsersModule],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }, AuthUserService],
})
export class AuthModule {}
