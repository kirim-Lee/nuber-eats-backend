import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('confirm')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async verifyEmail(@Query() { code }) {
    return await this.userService.verifyEmail(code);
  }
}
